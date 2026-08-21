"""Driver endpoints — CRUD with search + pagination."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverRead, DriverUpdate
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("/count/total")
async def count_drivers(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> dict:
    result = await db.execute(
        select(func.count(Driver.id)).where(Driver.company_id == company_id)
    )
    return {"total": result.scalar() or 0}


@router.get("", response_model=PaginatedResponse[DriverRead])
async def list_drivers(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
    q: str | None = Query(None, description="Search by name or phone"),
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
) -> PaginatedResponse[DriverRead]:
    count_stmt = select(func.count(Driver.id)).where(Driver.company_id == company_id)
    stmt = select(Driver).where(Driver.company_id == company_id)
    if q:
        like = f"%{q}%"
        condition = (Driver.full_name.ilike(like)) | (Driver.phone.ilike(like))
        count_stmt = count_stmt.where(condition)
        stmt = stmt.where(condition)

    total = (await db.execute(count_stmt)).scalar() or 0
    offset = (page - 1) * page_size
    stmt = stmt.order_by(Driver.full_name).offset(offset).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=DriverRead, status_code=status.HTTP_201_CREATED)
async def create_driver(
    payload: DriverCreate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Driver:
    driver = Driver(company_id=company_id, **payload.model_dump())
    db.add(driver)
    await db.commit()
    await db.refresh(driver)
    return driver


@router.get("/{driver_id}", response_model=DriverRead)
async def get_driver(
    driver_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Driver:
    driver = await db.get(Driver, driver_id)
    if not driver or driver.company_id != company_id:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.patch("/{driver_id}", response_model=DriverRead)
async def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Driver:
    driver = await db.get(Driver, driver_id)
    if not driver or driver.company_id != company_id:
        raise HTTPException(status_code=404, detail="Driver not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(driver, k, v)
    await db.commit()
    await db.refresh(driver)
    return driver


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_driver(
    driver_id: int,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> None:
    driver = await db.get(Driver, driver_id)
    if not driver or driver.company_id != company_id:
        raise HTTPException(status_code=404, detail="Driver not found")
    await db.delete(driver)
    await db.commit()
