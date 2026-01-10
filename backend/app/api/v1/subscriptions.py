# app/api/v1/subscriptions.py
from typing import Annotated
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from sqlalchemy.exc import IntegrityError
from app.db import get_session
from app.models import Subscription, SubscriptionStatus, BillingCycle
from app.schemas import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    DashboardStats,
    CategorySpend,
    UpcomingRenewal
)
from app.deps import CurrentUser

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


def subscription_to_response(subscription: Subscription) -> dict:
    """Convert a Subscription model to frontend-expected format."""
    return {
        "id": subscription.id,
        "name": subscription.name,
        "cost": subscription.amount,
        "billing_cycle": subscription.interval,
        "next_renewal": subscription.next_renewal_date.isoformat(),
        "category": subscription.category,
        "vendor": subscription.vendor,
        "currency": subscription.currency,
        "custom_interval_days": subscription.custom_interval_days,
        "last_paid_at": subscription.last_paid_at.isoformat() if subscription.last_paid_at else None,
        "start_date": subscription.start_date.isoformat(),
        "tags": subscription.tags,
        "color": subscription.color,
        "website": subscription.website,
        "description": subscription.description,
        "status": subscription.status,
        "user_id": subscription.user_id,
        "created_at": subscription.created_at.isoformat(),
        "updated_at": subscription.updated_at.isoformat(),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    payload = subscription_data.model_dump(by_alias=True)

    # Map frontend field names to backend field names
    field_mapping = {
        "cost": "amount",
        "billing_cycle": "interval",
        "next_renewal": "next_renewal_date",
    }

    for frontend_field, backend_field in field_mapping.items():
        if frontend_field in payload:
            payload[backend_field] = payload.pop(frontend_field)

    # Prevent client from attempting to set user_id
    payload.pop("user_id", None)

    try:
        db_subscription = Subscription(**payload, user_id=current_user.id)
    except TypeError as e:
        # Field mismatch between schema and model
        raise HTTPException(
            status_code=422,
            detail=f"Invalid fields for Subscription model: {str(e)}"
        ) from e

    session.add(db_subscription)
    try:
        session.commit()
    except IntegrityError as e:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Database rejected subscription (missing required fields, invalid FK, or constraint violation)."
        ) from e

    session.refresh(db_subscription)

    return subscription_to_response(db_subscription)


@router.get("")
def list_subscriptions(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)],
    status_filter: SubscriptionStatus | None = Query(default=None),
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100)
):
    """
    List all subscriptions for the current user.

    Supports filtering by status, category, and search text, with pagination.
    """
    statement = select(Subscription).where(Subscription.user_id == current_user.id)

    if status_filter:
        statement = statement.where(Subscription.status == status_filter)

    if category:
        statement = statement.where(Subscription.category == category)

    if search:
        statement = statement.where(Subscription.name.ilike(f"%{search}%"))

    statement = statement.offset(skip).limit(limit).order_by(Subscription.next_renewal_date)

    subscriptions = session.exec(statement).all()
    return [subscription_to_response(sub) for sub in subscriptions]


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Get dashboard statistics.

    Returns:
    - Total monthly spend
    - Count of active subscriptions
    - Upcoming renewals in next 30 days
    - Spend by category
    """
    # Get all active subscriptions
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

    # Get upcoming renewals (next 30 days)
    today = date.today()
    thirty_days = today + timedelta(days=30)

    upcoming_statement = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE,
        Subscription.next_renewal_date >= today,
        Subscription.next_renewal_date <= thirty_days
    ).order_by(Subscription.next_renewal_date)

    upcoming_subs = session.exec(upcoming_statement).all()

    upcoming_renewals = [
        {
            "subscription": subscription_to_response(sub),
            "days_until_renewal": (sub.next_renewal_date - today).days
        }
        for sub in upcoming_subs
    ]

    # Get spend by category
    category_statement = select(
        Subscription.category,
        func.sum(Subscription.amount).label("total"),
        func.count(Subscription.id).label("count")
    ).where(
        Subscription.user_id == current_user.id,
        Subscription.status == SubscriptionStatus.ACTIVE
    ).group_by(Subscription.category)

    category_results = session.exec(category_statement).all()

    spend_by_category = [
        CategorySpend(
            category=row[0] or "Other",
            total_amount=float(row[1] or 0),
            count=int(row[2] or 0)
        )
        for row in category_results
    ]

    return DashboardStats(
        total_monthly_spend=round(total_monthly, 2),
        active_subscriptions=len(active_subs),
        upcoming_renewals=upcoming_renewals,
        spend_by_category=spend_by_category
    )


@router.get("/{subscription_id}")
def get_subscription(
    subscription_id: int,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Get a specific subscription by ID.

    Returns 404 if not found or not owned by current user.
    """
    subscription = session.get(Subscription, subscription_id)

    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    return subscription_to_response(subscription)


@router.patch("/{subscription_id}")
def update_subscription(
    subscription_id: int,
    subscription_data: SubscriptionUpdate,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Update a subscription.

    Only updates fields that are provided in the request.
    """
    subscription = session.get(Subscription, subscription_id)

    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    # Update only provided fields
    update_data = subscription_data.model_dump(exclude_unset=True, by_alias=True)

    # Map frontend field names to backend field names
    field_mapping = {
        "cost": "amount",
        "billing_cycle": "interval",
        "next_renewal": "next_renewal_date",
    }

    for frontend_field, backend_field in field_mapping.items():
        if frontend_field in update_data:
            update_data[backend_field] = update_data.pop(frontend_field)

    for key, value in update_data.items():
        setattr(subscription, key, value)

    subscription.updated_at = datetime.utcnow()

    session.add(subscription)
    session.commit()
    session.refresh(subscription)

    return subscription_to_response(subscription)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    subscription_id: int,
    current_user: CurrentUser,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Delete a subscription.

    Permanently removes the subscription from the database.
    """
    subscription = session.get(Subscription, subscription_id)

    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    session.delete(subscription)
    session.commit()

    return None
