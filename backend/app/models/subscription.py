"""Subscription model — tracks Stripe billing for a Company."""
import enum
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PlanType(str, enum.Enum):
    TRIAL = "trial"
    STARTER = "starter"       # up to 15 trucks — R$579/mo
    PROFESSIONAL = "professional"  # over 15 trucks — R$799/mo


class SubscriptionStatus(str, enum.Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False, unique=True
    )
    plan: Mapped[PlanType] = mapped_column(String(30), default=PlanType.TRIAL, nullable=False)
    status: Mapped[SubscriptionStatus] = mapped_column(
        String(30), default=SubscriptionStatus.TRIAL, nullable=False, index=True
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(Text, nullable=True, unique=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(Text, nullable=True, unique=True)
    stripe_price_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_period_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancel_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    trial_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    fleet_size: Mapped[int] = mapped_column(default=0, nullable=False)
    price_cents: Mapped[int] = mapped_column(default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company = relationship("Company", back_populates="subscription")
