"""Shared FastAPI dependencies (auth + tenant scoping)."""
from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, get_current_company_id
from app.models.user import User
from app.services import payment_service


async def db_session(db: AsyncSession = Depends(get_db)) -> AsyncGenerator[AsyncSession, None]:
    yield db


async def current_user(user: User = Depends(get_current_user)) -> User:
    return user


async def current_company_id(company_id: int = Depends(get_current_company_id)) -> int:
    return company_id


async def require_active_subscription(
    company_id: int = Depends(current_company_id),
    db: AsyncSession = Depends(get_db),
) -> int:
    """Dependency that blocks access if subscription is not active."""
    sub = await payment_service.get_company_subscription(db, company_id)
    if not await payment_service.is_subscription_active(sub):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Assinatura inativa. Acesse /payments/checkout para ativar seu plano.",
        )
    return company_id
