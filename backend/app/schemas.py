# app/schemas.py
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator
from app.models import BillingCycle, SubscriptionStatus
import re


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v


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
    name: str = Field(min_length=1, max_length=100)
    cost: float = Field(gt=0, alias="amount")
    billing_cycle: str = Field(default="monthly", alias="interval")
    category: str = Field(default="Other")
    next_renewal: date = Field(alias="next_renewal_date")
    vendor: Optional[str] = None
    currency: str = Field(default="USD")
    custom_interval_days: Optional[int] = None
    last_paid_at: Optional[date] = None
    start_date: Optional[date] = None
    tags: Optional[str] = None
    color: Optional[str] = Field(default="#6366f1")
    website: Optional[str] = None
    description: Optional[str] = None
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE

    class Config:
        populate_by_name = True


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    cost: Optional[float] = Field(default=None, gt=0, alias="amount")
    billing_cycle: Optional[str] = Field(default=None, alias="interval")
    category: Optional[str] = None
    next_renewal: Optional[date] = Field(default=None, alias="next_renewal_date")
    vendor: Optional[str] = None
    currency: Optional[str] = None
    custom_interval_days: Optional[int] = None
    last_paid_at: Optional[date] = None
    start_date: Optional[date] = None
    tags: Optional[str] = None
    color: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    status: Optional[SubscriptionStatus] = None

    class Config:
        populate_by_name = True


class SubscriptionResponse(BaseModel):
    id: int
    name: str
    cost: float = Field(serialization_alias="cost")
    billing_cycle: str = Field(serialization_alias="billing_cycle")
    next_renewal: date = Field(serialization_alias="next_renewal")
    category: str
    vendor: Optional[str] = None
    currency: str
    custom_interval_days: Optional[int] = None
    last_paid_at: Optional[date] = None
    start_date: date
    tags: Optional[str] = None
    color: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    status: SubscriptionStatus
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


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
