from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.cost_alert import CostAlert
from app.schemas.alert import CostAlertRead
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=PaginatedResponse[CostAlertRead])
async def list_alerts(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    include_resolved: bool = False,
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginatedResponse[CostAlertRead]:
    count_stmt = select(func.count(CostAlert.id)).where(CostAlert.company_id == company_id)
    stmt = select(CostAlert).where(CostAlert.company_id == company_id)
    if not include_resolved:
        count_stmt = count_stmt.where(CostAlert.is_resolved.is_(False))
        stmt = stmt.where(CostAlert.is_resolved.is_(False))

    total = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(CostAlert.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post("/{alert_id}/resolve", response_model=CostAlertRead)
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> CostAlert:
    alert = await db.get(CostAlert, alert_id)
    if not alert or alert.company_id != company_id:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    await db.commit()
    await db.refresh(alert)
    return alert
