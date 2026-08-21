"""Dashboard aggregation: KPIs, vehicle performance rows, recent WhatsApp history."""
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cost_alert import CostAlert
from app.models.company import Company
from app.models.cost_entry import CostEntry
from app.models.receipt import Receipt
from app.models.trip import Trip, TripStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.dashboard import (
    DashboardKPIs,
    VehiclePerformanceRow,
    WhatsAppReceiptEntry,
)
from app.services.margin_service import period_label, resolve_expected_margin


async def get_kpis(db: AsyncSession, company_id: int, today: Optional[date] = None) -> DashboardKPIs:
    """Compute the 4 KPI cards for the current month-to-date period."""
    today = today or date.today()
    period_start = today.replace(day=1)

    # Revenue: gross_revenue of COMPLETED trips in the period
    revenue_stmt = select(func.coalesce(func.sum(Trip.gross_revenue), 0)).where(
        Trip.company_id == company_id,
        Trip.status == TripStatus.COMPLETED,
        Trip.scheduled_date >= period_start,
        Trip.scheduled_date <= today,
    )
    revenue = (await db.execute(revenue_stmt)).scalar() or Decimal("0")

    # Total cost: sum of all CostEntry in the period (regardless of trip status)
    cost_stmt = select(func.coalesce(func.sum(CostEntry.amount), 0)).where(
        CostEntry.company_id == company_id,
        CostEntry.incurred_on >= period_start,
        CostEntry.incurred_on <= today,
    )
    total_cost = (await db.execute(cost_stmt)).scalar() or Decimal("0")

    net_profit = revenue - total_cost
    margin = float(net_profit / revenue) if revenue > 0 else 0.0

    # Fleet / active trips
    fleet_size = (
        await db.execute(
            select(func.count(Vehicle.id)).where(
                Vehicle.company_id == company_id,
                Vehicle.status == VehicleStatus.ACTIVE,
            )
        )
    ).scalar() or 0

    active_trips = (
        await db.execute(
            select(func.count(Trip.id)).where(
                Trip.company_id == company_id,
                Trip.status == TripStatus.IN_PROGRESS,
            )
        )
    ).scalar() or 0

    return DashboardKPIs(
        gross_revenue=Decimal(revenue),
        total_cost=Decimal(total_cost),
        net_profit=Decimal(net_profit),
        avg_margin=margin,
        fleet_size=int(fleet_size),
        active_trips=int(active_trips),
        period_label=period_label(today),
    )


async def get_vehicle_performance(
    db: AsyncSession, company_id: int, today: Optional[date] = None, limit: int = 20
) -> list[VehiclePerformanceRow]:
    """For each active vehicle, sum revenue and costs in the current month and rank by profit."""
    today = today or date.today()
    period_start = today.replace(day=1)

    vehicles = (
        await db.execute(
            select(Vehicle)
            .where(Vehicle.company_id == company_id)
            .order_by(Vehicle.plate)
        )
    ).scalars().all()

    rows: list[VehiclePerformanceRow] = []
    for v in vehicles:
        rev = (
            await db.execute(
                select(func.coalesce(func.sum(Trip.gross_revenue), 0)).where(
                    Trip.company_id == company_id,
                    Trip.vehicle_id == v.id,
                    Trip.status == TripStatus.COMPLETED,
                    Trip.scheduled_date >= period_start,
                    Trip.scheduled_date <= today,
                )
            )
        ).scalar() or Decimal("0")
        cost = (
            await db.execute(
                select(func.coalesce(func.sum(CostEntry.amount), 0)).where(
                    CostEntry.company_id == company_id,
                    CostEntry.vehicle_id == v.id,
                    CostEntry.incurred_on >= period_start,
                    CostEntry.incurred_on <= today,
                )
            )
        ).scalar() or Decimal("0")

        if rev == 0 and cost == 0:
            continue  # skip vehicles with no activity this period

        net = rev - cost
        margin = float(net / rev) if rev > 0 else 0.0
        # Best route = most recent trip with revenue
        recent = (
            await db.execute(
                select(Trip)
                .where(
                    Trip.company_id == company_id,
                    Trip.vehicle_id == v.id,
                    Trip.status == TripStatus.COMPLETED,
                )
                .order_by(Trip.completed_at.desc().nullslast())
                .limit(1)
            )
        ).scalar_one_or_none()
        route = f"{recent.origin} - {recent.destination}" if recent else "—"

        # status heuristic
        company = (await db.execute(
            select(Company).where(Company.id == company_id)
        )).scalar_one_or_none()
        company_margin = resolve_expected_margin(company.expected_margin if company else None)
        if margin < company_margin * 0.5:
            status_label = "alert"
        elif margin >= company_margin:
            status_label = "profit"
        else:
            status_label = "neutral"

        rows.append(
            VehiclePerformanceRow(
                vehicle_id=v.id,
                plate=v.plate,
                model=v.model,
                route=route,
                gross_revenue=Decimal(rev),
                total_cost=Decimal(cost),
                net_profit=Decimal(net),
                margin_pct=margin,
                status=status_label,
            )
        )

    rows.sort(key=lambda r: r.net_profit, reverse=True)
    return rows[:limit]


async def get_recent_whatsapp_receipts(
    db: AsyncSession, company_id: int, limit: int = 10
) -> list[WhatsAppReceiptEntry]:
    receipts = (
        await db.execute(
            select(Receipt)
            .where(Receipt.company_id == company_id)
            .order_by(Receipt.received_at.desc())
            .limit(limit)
        )
    ).scalars().all()

    return [
        WhatsAppReceiptEntry(
            id=r.id,
            sender_name=r.sender_name,
            received_at=r.received_at,
            original_filename=r.original_filename,
            image_path=r.image_path,
            extracted_amount=r.extracted_amount,
            extracted_plate=r.extracted_plate,
            vehicle_id=r.vehicle_id,
            status=r.status.value,
        )
        for r in receipts
    ]


async def get_active_alerts_count(db: AsyncSession, company_id: int) -> int:
    result = await db.execute(
        select(func.count(CostAlert.id)).where(
            CostAlert.company_id == company_id,
            CostAlert.is_resolved.is_(False),
        )
    )
    return int(result.scalar() or 0)
