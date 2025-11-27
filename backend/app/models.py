# app/models.py
from datetime import datetime, date
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum


class IntervalType(str, Enum):
    MONTHLY = "monthly"
    ANNUAL = "annual"
    CUSTOM = "custom"


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAUSED = "paused"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    full_name: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    subscriptions: list["Subscription"] = Relationship(back_populates="owner")


class Subscription(SQLModel, table=True):
    __tablename__ = "subscriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, index=True)
    vendor: Optional[str] = None
    category: Optional[str] = Field(default="Other", index=True)
    amount: float = Field(nullable=False)
    currency: str = Field(default="USD", max_length=3)

    # Interval configuration
    interval: IntervalType = Field(default=IntervalType.MONTHLY)
    custom_interval_days: Optional[int] = Field(default=None)

    # Dates
    next_renewal_date: date = Field(nullable=False, index=True)
    last_paid_at: Optional[date] = None
    start_date: date = Field(default_factory=date.today)

    # Status & metadata
    status: SubscriptionStatus = Field(default=SubscriptionStatus.ACTIVE)
    tags: Optional[str] = None
    notes: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Foreign key
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    # Relationships
    owner: User = Relationship(back_populates="subscriptions")
