"""Dashboard endpoints — aggregated KPIs and panel data."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.schemas.alert import CostAlertRead
from app.schemas.dashboard import (
    DashboardKPIs,
    VehiclePerformance,
    VehiclePerformanceRow,
    WhatsAppReceiptEntry,
)
from app.services.dashboard_service import (
    get_active_alerts_count,
    get_kpis,
    get_recent_whatsapp_receipts,
    get_vehicle_performance,
)
from app.services.margin_service import list_active_alerts

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=DashboardKPIs)
async def dashboard_kpis(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> DashboardKPIs:
    return await get_kpis(db, company_id)


@router.get("/vehicle-performance", response_model=VehiclePerformance)
async def vehicle_performance(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> VehiclePerformance:
    rows = await get_vehicle_performance(db, company_id)
    return VehiclePerformance(rows=rows)


@router.get("/whatsapp-receipts", response_model=list[WhatsAppReceiptEntry])
async def whatsapp_receipts(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    limit: int = 10,
) -> list[WhatsAppReceiptEntry]:
    return await get_recent_whatsapp_receipts(db, company_id, limit=limit)


@router.get("/alerts", response_model=list[CostAlertRead])
async def dashboard_alerts(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    limit: int = 5,
) -> list[CostAlertRead]:
    return await list_active_alerts(db, company_id, limit=limit)


@router.get("/alerts/count")
async def dashboard_alerts_count(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> dict:
    return {"count": await get_active_alerts_count(db, company_id)}
