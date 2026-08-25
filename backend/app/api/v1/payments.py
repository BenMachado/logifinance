"""Payment / Subscription endpoints — Stripe checkout + webhook."""
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.subscription import PlanType
from app.schemas.payment import (
    CheckoutRequest,
    CheckoutResponse,
    PlanPricing,
    SubscriptionRead,
    WebhookAck,
)
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["payments"])


# ---------------------------------------------------------------------------
# Plans info
# ---------------------------------------------------------------------------

@router.get("/plans", response_model=list[PlanPricing])
async def list_plans():
    """Return available plans and pricing (public)."""
    plans = []
    for plan_type, info in payment_service.PRICING_INFO.items():
        plans.append(
            PlanPricing(
                plan=plan_type,
                name=info["name"],
                price_cents=payment_service.get_price_cents(plan_type),
                price_brl=info["price_brl"],
                max_trucks=info["max_trucks"],
                description=info["description"],
            )
        )
    return plans


# ---------------------------------------------------------------------------
# Subscription status
# ---------------------------------------------------------------------------

@router.get("/subscription", response_model=SubscriptionRead)
async def get_subscription(
    company_id: int = Depends(current_company_id),
    db: AsyncSession = Depends(db_session),
):
    """Get current company subscription status."""
    sub = await payment_service.get_company_subscription(db, company_id)
    return SubscriptionRead.model_validate(sub)


# ---------------------------------------------------------------------------
# Checkout
# ---------------------------------------------------------------------------

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    payload: CheckoutRequest,
    company_id: int = Depends(current_company_id),
    db: AsyncSession = Depends(db_session),
):
    """Create a Stripe Checkout session (PIX or card)."""
    result = await payment_service.create_checkout_session(
        db=db,
        company_id=company_id,
        success_url=payload.success_url,
        cancel_url=payload.cancel_url,
        plan=payload.plan,
    )
    return CheckoutResponse(**result)


# ---------------------------------------------------------------------------
# Webhook (Stripe calls this)
# ---------------------------------------------------------------------------

@router.post("/webhook", response_model=WebhookAck)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(alias="stripe-signature"),
    db: AsyncSession = Depends(db_session),
):
    """Receive Stripe webhook events (no auth — Stripe authenticates via signature)."""
    body = await request.body()
    await payment_service.handle_webhook(db, body, stripe_signature)
    return WebhookAck()
