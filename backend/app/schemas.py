# app/schemas.py
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models import IntervalType, SubscriptionStatus


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# Subscription Schemas
class SubscriptionBase(BaseModel):
    name: str
    vendor: Optional[str] = None
    category: Optional[str] = "Other"
    amount: float = Field(gt=0)
    currency: str = Field(default="USD", max_length=3)
    interval: IntervalType = IntervalType.MONTHLY
    custom_interval_days: Optional[int] = None
    next_renewal_date: date
    last_paid_at: Optional[date] = None
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    tags: Optional[str] = None
    notes: Optional[str] = None


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    vendor: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = None
    interval: Optional[IntervalType] = None
    custom_interval_days: Optional[int] = None
    next_renewal_date: Optional[date] = None
    last_paid_at: Optional[date] = None
    status: Optional[SubscriptionStatus] = None
    tags: Optional[str] = None
    notes: Optional[str] = None


class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    start_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Analytics Schemas
class CategorySpend(BaseModel):
    category: str
    total_amount: float
    count: int


class UpcomingRenewal(BaseModel):
    subscription: SubscriptionResponse
    days_until_renewal: int


class DashboardStats(BaseModel):
    total_monthly_spend: float
    active_subscriptions: int
    upcoming_renewals: list[UpcomingRenewal]
    spend_by_category: list[CategorySpend]
