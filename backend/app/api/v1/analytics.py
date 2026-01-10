# app/api/v1/analytics.py
from typing import Annotated
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.db import get_session
from app.models import Subscription, SubscriptionStatus, BillingCycle
from app.schemas import CategorySpend, UpcomingRenewal, SubscriptionResponse
from app.deps import CurrentUser
from pydantic import BaseModel

router = APIRouter(prefix="/analytics", tags=["Analytics"])


class SummaryStats(BaseModel):
    total_monthly_cost: float
    total_subscriptions: int
    average_cost: float


class CycleSpend(BaseModel):
    interval: str  # Using interval to match database
    total_amount: float
    count: int


class MonthlyProjection(BaseModel):
    month: str
    projected_cost: float


@router.get("/summary", response_model=SummaryStats)
def get_summary(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Get summary statistics.

    Returns total monthly cost, subscription count, and average cost per subscription.
    """
    statement = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    )
    active_subs = session.exec(statement).all()

    # Calculate total monthly spend
    total_monthly = 0.0
    for sub in active_subs:
        if sub.interval == "weekly":
            total_monthly += sub.amount * 52 / 12
        elif sub.interval == "monthly":
            total_monthly += sub.amount
        elif sub.interval == "quarterly":
            total_monthly += sub.amount * 4 / 12
        elif sub.interval == "yearly":
            total_monthly += sub.amount / 12

    count = len(active_subs)
    average = total_monthly / count if count > 0 else 0

    return SummaryStats(
        total_monthly_cost=round(total_monthly, 2),
        total_subscriptions=count,
        average_cost=round(average, 2)
    )


@router.get("/by-category", response_model=list[CategorySpend])
def get_spending_by_category(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Get spending grouped by category.

    Returns monthly cost breakdown for each category.
    """
    statement = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    )
    active_subs = session.exec(statement).all()

    # Calculate monthly cost per category
    category_totals = {}
    category_counts = {}

    for sub in active_subs:
        monthly_cost = 0.0
        if sub.interval == "weekly":
            monthly_cost = sub.amount * 52 / 12
        elif sub.interval == "monthly":
            monthly_cost = sub.amount
        elif sub.interval == "quarterly":
            monthly_cost = sub.amount * 4 / 12
        elif sub.interval == "yearly":
            monthly_cost = sub.amount / 12

        category = sub.category or "Other"
        category_totals[category] = category_totals.get(category, 0) + monthly_cost
        category_counts[category] = category_counts.get(category, 0) + 1

    return [
        CategorySpend(
            category=cat,
            total_amount=round(amount, 2),
            count=category_counts[cat]
        )
        for cat, amount in category_totals.items()
    ]


@router.get("/by-cycle", response_model=list[CycleSpend])
def get_spending_by_cycle(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Get spending grouped by billing cycle.

    Returns the sum of costs for each billing cycle type.
    """
    statement = select(
        Subscription.interval,
        func.sum(Subscription.amount).label("total"),
        func.count(Subscription.id).label("count")
    ).where(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).group_by(Subscription.interval)

    results = session.exec(statement).all()

    return [
        CycleSpend(
            interval=str(row[0]),
            total_amount=round(float(row[1] or 0), 2),
            count=int(row[2] or 0)
        )
        for row in results
    ]


@router.get("/upcoming", response_model=list[UpcomingRenewal])
def get_upcoming_renewals(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)],
    days: int = 30
):
    """
    Get upcoming renewals within the specified number of days.

    Default is 30 days.
    """
    today = date.today()
    end_date = today + timedelta(days=days)

    statement = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE,
        Subscription.next_renewal_date >= today,
        Subscription.next_renewal_date <= end_date
    ).order_by(Subscription.next_renewal_date)

    upcoming_subs = session.exec(statement).all()

    return [
        UpcomingRenewal(
            subscription=SubscriptionResponse.model_validate(sub),
            days_until_renewal=(sub.next_renewal_date - today).days
        )
        for sub in upcoming_subs
    ]


@router.get("/monthly-projection", response_model=list[MonthlyProjection])
def get_monthly_projection(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)],
    months: int = 12
):
    """
    Project monthly costs for the next N months.

    Default is 12 months (1 year).
    """
    statement = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    )
    active_subs = session.exec(statement).all()

    # Calculate total monthly spend
    total_monthly = 0.0
    for sub in active_subs:
        if sub.interval == "weekly":
            total_monthly += sub.amount * 52 / 12
        elif sub.interval == "monthly":
            total_monthly += sub.amount
        elif sub.interval == "quarterly":
            total_monthly += sub.amount * 4 / 12
        elif sub.interval == "yearly":
            total_monthly += sub.amount / 12

    # Generate projection for next N months
    projections = []
    current_date = date.today()

    for i in range(months):
        # Calculate month and year
        month_offset = current_date.month + i
        year = current_date.year + (month_offset - 1) // 12
        month = ((month_offset - 1) % 12) + 1

        # Format as "MMM YYYY" (e.g., "Jan 2026")
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        month_str = f"{month_names[month - 1]} {year}"

        projections.append(
            MonthlyProjection(
                month=month_str,
                projected_cost=round(total_monthly, 2)
            )
        )

    return projections
