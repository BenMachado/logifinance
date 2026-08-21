"""Margin calculation and CostAlert generation."""
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.cost_alert import AlertSeverity, CostAlert
from app.models.cost_entry import CostEntry
from app.models.trip import Trip, TripStatus
from app.models.vehicle import Vehicle


def _safe_margin(revenue: Decimal, cost: Decimal) -> float:
    """Return (revenue - cost) / revenue, or 0.0 if revenue is zero."""
    if revenue <= 0:
        return 0.0
    return float((revenue - cost) / revenue)


async def compute_trip_totals(db: AsyncSession, trip: Trip) -> tuple[Decimal, Decimal]:
    """Return (total_cost, net_profit) for a single trip, summing its CostEntry rows."""
    result = await db.execute(
        select(CostEntry.amount).where(CostEntry.trip_id == trip.id)
    )
    total_cost = sum((row[0] for row in result.all()), Decimal("0"))
    net = Decimal(trip.gross_revenue) - total_cost
    return total_cost, net


async def maybe_create_alert_for_trip(
    db: AsyncSession,
    trip: Trip,
    vehicle: Vehicle,
    expected_margin: float,
) -> CostAlert | None:
    """If the trip's margin is below the threshold, create (or refresh) a CostAlert.

    Idempotent: if there's already an unresolved alert for this trip, we update it
    instead of creating a duplicate.
    """
    total_cost, net = await compute_trip_totals(db, trip)
    margin = _safe_margin(Decimal(trip.gross_revenue), total_cost)

    if margin >= expected_margin:
        # Margin healthy — resolve any open alert for this trip.
        existing = await db.execute(
            select(CostAlert).where(
                CostAlert.trip_id == trip.id, CostAlert.is_resolved.is_(False)
            )
        )
        for alert in existing.scalars().all():
            alert.is_resolved = True
        return None

    severity = AlertSeverity.CRITICAL if margin < expected_margin / 2 else AlertSeverity.WARNING

    existing = await db.execute(
        select(CostAlert).where(
            CostAlert.trip_id == trip.id, CostAlert.is_resolved.is_(False)
        )
    )
    alert = existing.scalar_one_or_none()
    if alert is None:
        alert = CostAlert(
            company_id=vehicle.company_id,
            vehicle_id=vehicle.id,
            trip_id=trip.id,
            severity=severity,
            title=f"Margem abaixo do esperado — {vehicle.plate}",
            message=(
                f"Placa {vehicle.plate} na rota {trip.origin} → {trip.destination} "
                f"atingiu margem de {margin*100:.1f}% (esperado {expected_margin*100:.0f}%). "
                f"Receita R$ {trip.gross_revenue:.2f}, custo R$ {total_cost:.2f}."
            ),
            actual_margin=Decimal(str(margin)),
            expected_margin=Decimal(str(expected_margin)),
        )
        db.add(alert)
    else:
        alert.severity = severity
        alert.actual_margin = Decimal(str(margin))
        alert.expected_margin = Decimal(str(expected_margin))
        alert.title = f"Margem abaixo do esperado — {vehicle.plate}"
        alert.message = (
            f"Placa {vehicle.plate} na rota {trip.origin} → {trip.destination} "
            f"atingiu margem de {margin*100:.1f}% (esperado {expected_margin*100:.0f}%)."
        )
    await db.flush()
    return alert


async def list_active_alerts(db: AsyncSession, company_id: int, limit: int = 20) -> list[CostAlert]:
    result = await db.execute(
        select(CostAlert)
        .where(CostAlert.company_id == company_id, CostAlert.is_resolved.is_(False))
        .order_by(CostAlert.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def period_label(today: date | None = None) -> str:
    """Returns a Portuguese month label, e.g. 'Agosto, 2026'."""
    months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ]
    today = today or date.today()
    return f"{months[today.month - 1]}, {today.year}"


def resolve_expected_margin(company_expected: float | None) -> float:
    if company_expected and 0 < company_expected <= 1:
        return company_expected
    return settings.MARGIN_ALERT_THRESHOLD
