"""Payment / Subscription schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.subscription import PlanType, SubscriptionStatus


class SubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    plan: PlanType
    status: SubscriptionStatus
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    fleet_size: int
    price_cents: int
    created_at: datetime
    updated_at: datetime


class CheckoutRequest(BaseModel):
    success_url: str = Field(..., description="URL de redirecionamento após pagamento")
    cancel_url: str = Field(..., description="URL de redirecionamento se cancelar")
    plan: PlanType = Field(PlanType.STARTER, description="Plano desejado")


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PlanPricing(BaseModel):
    plan: PlanType
    name: str
    price_cents: int
    price_brl: float
    currency: str = "BRL"
    max_trucks: Optional[int] = None
    description: str


class WebhookAck(BaseModel):
    received: bool = True
