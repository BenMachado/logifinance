"""Shared FastAPI dependencies (auth + tenant scoping)."""
from typing import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, get_current_company_id
from app.models.user import User


async def db_session(db: AsyncSession = Depends(get_db)) -> AsyncGenerator[AsyncSession, None]:
    yield db


async def current_user(user: User = Depends(get_current_user)) -> User:
    return user


async def current_company_id(company_id: int = Depends(get_current_company_id)) -> int:
    return company_id
