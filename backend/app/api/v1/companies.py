"""Company endpoints — profile and settings."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_company_id, db_session
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyRead, CompanyUpdate, CompanyUserRead

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/me", response_model=CompanyRead)
async def get_my_company(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Company:
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return company


@router.patch("/me", response_model=CompanyRead)
async def update_my_company(
    payload: CompanyUpdate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Company:
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    data = payload.model_dump(exclude_unset=True)
    if "cnpj" in data and data["cnpj"] and data["cnpj"] != company.cnpj:
        existing = await db.execute(
            select(Company).where(Company.cnpj == data["cnpj"], Company.id != company_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="CNPJ já cadastrado por outra empresa")

    for k, v in data.items():
        setattr(company, k, v)

    await db.flush()
    await db.refresh(company)
    return company


@router.patch("/{target_id}", response_model=CompanyRead)
async def update_company_by_id(
    target_id: int,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> Company:
    if target_id != company_id:
        raise HTTPException(status_code=403, detail="Não autorizado a alterar dados de outra empresa")
    return await update_my_company(payload, db, company_id)


@router.get("/me/users", response_model=list[CompanyUserRead])
async def list_company_users(
    db: AsyncSession = Depends(db_session),
    company_id: int = Depends(current_company_id),
) -> list[User]:
    stmt = select(User).where(User.company_id == company_id).order_by(User.full_name)
    result = await db.execute(stmt)
    return list(result.scalars().all())
