"""Stripe payment service — checkout, webhook, subscription management."""
import logging
import stripe as stripe_lib
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.company import Company
from app.models.subscription import PlanType, Subscription, SubscriptionStatus

logger = logging.getLogger(__name__)

stripe_lib.api_key = settings.STRIPE_SECRET_KEY


# ---------------------------------------------------------------------------
# Pricing
# ---------------------------------------------------------------------------

PLAN_PRICING = {
    PlanType.STARTER: stripe_lib.Price(
        id="price_starter_600",
        unit_amount=60000,  # R$ 600.00 in cents
        currency="brl",
        recurring={"interval": "month"},
        product_data={"name": "LogiFinance Starter"},
    ),
    PlanType.PROFESSIONAL: stripe_lib.Price(
        id="price_professional_900",
        unit_amount=90000,  # R$ 900.00 in cents
        currency="brl",
        recurring={"interval": "month"},
        product_data={"name": "LogiFinance Professional"},
    ),
}

PRICING_INFO = {
    PlanType.STARTER: {
        "name": "Starter",
        "price_brl": 600.00,
        "max_trucks": 15,
        "description": "Até 15 caminhões — R$ 600/mês",
    },
    PlanType.PROFESSIONAL: {
        "name": "Professional",
        "price_brl": 900.00,
        "max_trucks": None,
        "description": "Mais de 15 caminhões — R$ 900/mês",
    },
}


def determine_plan(fleet_size: int) -> PlanType:
    """Determine the correct plan based on fleet size."""
    if fleet_size <= 15:
        return PlanType.STARTER
    return PlanType.PROFESSIONAL


def get_price_cents(plan: PlanType) -> int:
    """Return the monthly price in cents for a given plan."""
    if plan == PlanType.PROFESSIONAL:
        return 90000
    return 60000


# ---------------------------------------------------------------------------
# Checkout session
# ---------------------------------------------------------------------------

async def create_checkout_session(
    db: AsyncSession,
    company_id: int,
    success_url: str,
    cancel_url: str,
    plan: PlanType,
) -> dict:
    """Create a Stripe Checkout session and return the URL + session ID."""
    from app.models.vehicle import Vehicle

    # Count active vehicles to determine plan
    stmt = select(Vehicle).where(
        Vehicle.company_id == company_id,
        Vehicle.status == "active",
    )
    result = await db.execute(stmt)
    fleet_size = len(result.scalars().all())

    # Override plan based on fleet if needed
    actual_plan = determine_plan(fleet_size)
    if actual_plan != plan:
        plan = actual_plan

    price_cents = get_price_cents(plan)

    # Get or create Stripe customer
    sub = await _get_or_create_subscription(db, company_id)

    # If already has active subscription, redirect to customer portal instead
    if sub.status == SubscriptionStatus.ACTIVE and sub.stripe_subscription_id:
        session = stripe_lib.billing_portal.Session.create(
            customer=sub.stripe_customer_id,
            return_url=success_url,
        )
        return {"checkout_url": session.url, "session_id": "portal"}

    # Create Checkout Session
    checkout_params = {
        "payment_method_types": ["pix"],
        "line_items": [
            {
                "price_data": {
                    "currency": "brl",
                    "product_data": {
                        "name": f"LogiFinance {PRICING_INFO[plan]['name']}",
                        "description": PRICING_INFO[plan]["description"],
                    },
                    "unit_amount": price_cents,
                    "recurring": {"interval": "month"},
                },
                "quantity": 1,
            }
        ],
        "mode": "subscription",
        "success_url": success_url,
        "cancel_url": cancel_url,
        "customer": sub.stripe_customer_id,
        "metadata": {
            "company_id": str(company_id),
            "plan": plan.value,
            "fleet_size": str(fleet_size),
        },
        "allow_promotion_codes": True,
    }

    # Also allow card payments
    checkout_params["payment_method_types"].append("card")

    session = stripe_lib.checkout.Session.create(**checkout_params)

    logger.info(f"Checkout session created for company {company_id}: {session.id}")
    return {"checkout_url": session.url, "session_id": session.id}


# ---------------------------------------------------------------------------
# Webhook handling
# ---------------------------------------------------------------------------

async def handle_webhook(db: AsyncSession, payload: bytes, sig_header: str) -> None:
    """Verify and process a Stripe webhook event."""
    try:
        event = stripe_lib.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe_lib.error.SignatureVerificationError) as e:
        logger.warning(f"Webhook signature verification failed: {e}")
        raise

    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        await _on_checkout_completed(db, data_object)
    elif event_type == "invoice.paid":
        await _on_invoice_paid(db, data_object)
    elif event_type == "invoice.payment_failed":
        await _on_invoice_payment_failed(db, data_object)
    elif event_type == "customer.subscription.deleted":
        await _on_subscription_deleted(db, data_object)
    elif event_type == "customer.subscription.updated":
        await _on_subscription_updated(db, data_object)
    else:
        logger.info(f"Unhandled webhook event type: {event_type}")


async def _on_checkout_completed(db: AsyncSession, session: dict) -> None:
    """Handle successful checkout — activate subscription."""
    company_id = int(session["metadata"]["company_id"])
    stripe_customer_id = session.get("customer")
    stripe_subscription_id = session.get("subscription")

    sub = await _get_or_create_subscription(db, company_id)
    sub.stripe_customer_id = stripe_customer_id
    sub.stripe_subscription_id = stripe_subscription_id

    # Fetch subscription details from Stripe
    if stripe_subscription_id:
        stripe_sub = stripe_lib.Subscription.retrieve(stripe_subscription_id)
        sub.status = SubscriptionStatus.ACTIVE
        sub.current_period_start = datetime.fromtimestamp(
            stripe_sub["current_period_start"], tz=timezone.utc
        )
        sub.current_period_end = datetime.fromtimestamp(
            stripe_sub["current_period_end"], tz=timezone.utc
        )
        if stripe_sub.get("items") and stripe_sub["items"]["data"]:
            sub.stripe_price_id = stripe_sub["items"]["data"][0]["price"]["id"]

    plan = PlanType(session["metadata"].get("plan", "starter"))
    sub.plan = plan
    sub.price_cents = get_price_cents(plan)
    sub.fleet_size = int(session["metadata"].get("fleet_size", 0))

    await db.flush()
    logger.info(f"Subscription activated for company {company_id}")


async def _on_invoice_paid(db: AsyncSession, invoice: dict) -> None:
    """Handle successful payment — extend subscription period."""
    stripe_subscription_id = invoice.get("subscription")
    if not stripe_subscription_id:
        return

    sub = await _get_subscription_by_stripe_id(db, stripe_subscription_id)
    if not sub:
        logger.warning(f"No subscription found for stripe_subscription_id={stripe_subscription_id}")
        return

    sub.status = SubscriptionStatus.ACTIVE

    # Update period from Stripe
    period_end = invoice.get("period_end")
    if period_end:
        sub.current_period_end = datetime.fromtimestamp(period_end, tz=timezone.utc)

    await db.flush()
    logger.info(f"Invoice paid — subscription {sub.id} extended for company {sub.company_id}")


async def _on_invoice_payment_failed(db: AsyncSession, invoice: dict) -> None:
    """Handle failed payment — mark as past due."""
    stripe_subscription_id = invoice.get("subscription")
    if not stripe_subscription_id:
        return

    sub = await _get_subscription_by_stripe_id(db, stripe_subscription_id)
    if not sub:
        return

    sub.status = SubscriptionStatus.PAST_DUE
    await db.flush()
    logger.warning(f"Invoice payment failed for company {sub.company_id}")


async def _on_subscription_deleted(db: AsyncSession, stripe_sub: dict) -> None:
    """Handle subscription cancellation."""
    stripe_subscription_id = stripe_sub.get("id")
    sub = await _get_subscription_by_stripe_id(db, stripe_subscription_id)
    if not sub:
        return

    sub.status = SubscriptionStatus.CANCELLED
    sub.stripe_subscription_id = None
    sub.stripe_price_id = None
    await db.flush()
    logger.info(f"Subscription cancelled for company {sub.company_id}")


async def _on_subscription_updated(db: AsyncSession, stripe_sub: dict) -> None:
    """Handle subscription update (e.g., plan change)."""
    stripe_subscription_id = stripe_sub.get("id")
    sub = await _get_subscription_by_stripe_id(db, stripe_subscription_id)
    if not sub:
        return

    # Update status
    stripe_status = stripe_sub.get("status")
    if stripe_status == "active":
        sub.status = SubscriptionStatus.ACTIVE
    elif stripe_status == "past_due":
        sub.status = SubscriptionStatus.PAST_DUE
    elif stripe_status in ("canceled", "unpaid"):
        sub.status = SubscriptionStatus.CANCELLED

    # Update period
    period_end = stripe_sub.get("current_period_end")
    if period_end:
        sub.current_period_end = datetime.fromtimestamp(period_end, tz=timezone.utc)

    await db.flush()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_or_create_subscription(db: AsyncSession, company_id: int) -> Subscription:
    """Get existing subscription or create a trial one."""
    stmt = select(Subscription).where(Subscription.company_id == company_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()

    if sub:
        return sub

    sub = Subscription(
        company_id=company_id,
        plan=PlanType.TRIAL,
        status=SubscriptionStatus.TRIAL,
        fleet_size=0,
        price_cents=0,
    )
    db.add(sub)
    await db.flush()
    return sub


async def _get_subscription_by_stripe_id(
    db: AsyncSession, stripe_subscription_id: str
) -> Optional[Subscription]:
    """Look up a Subscription by its Stripe subscription ID."""
    stmt = select(Subscription).where(
        Subscription.stripe_subscription_id == stripe_subscription_id
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_company_subscription(db: AsyncSession, company_id: int) -> Optional[Subscription]:
    """Get the subscription for a company, creating a trial if none exists."""
    return await _get_or_create_subscription(db, company_id)


async def is_subscription_active(sub: Optional[Subscription]) -> bool:
    """Check if a subscription grants access to the platform."""
    if not sub:
        return False
    if sub.status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL):
        return True
    if sub.status == SubscriptionStatus.PAST_DUE and sub.current_period_end:
        # Grace period: 3 days after period end
        if sub.current_period_end > datetime.now(timezone.utc):
            return True
    return False
