# app/models.py
from datetime import datetime, date
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum


class BillingCycle(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


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

    # Database uses these column names
    amount: float = Field(nullable=False, sa_column_kwargs={"name": "amount"})
    interval: str = Field(default="monthly", sa_column_kwargs={"name": "interval"})
    next_renewal_date: date = Field(nullable=False, index=True, sa_column_kwargs={"name": "next_renewal_date"})

    # Optional fields from database
    vendor: Optional[str] = None
    category: str = Field(default="Other", index=True)
    currency: str = Field(default="USD")
    custom_interval_days: Optional[int] = None
    last_paid_at: Optional[date] = None
    start_date: date = Field(default_factory=date.today)
    tags: Optional[str] = None

    # Frontend-specific fields
    color: Optional[str] = Field(default="#6366f1")  # Default indigo color
    website: Optional[str] = None
    description: Optional[str] = None

    # Status
    status: SubscriptionStatus = Field(default=SubscriptionStatus.ACTIVE)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Foreign key
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    # Relationships
    owner: User = Relationship(back_populates="subscriptions")
