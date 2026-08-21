"""Auth endpoints — register, login, refresh, me."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import db_session
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import (
    CompanyRegisterRead,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    Token,
    UserRead,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=CompanyRegisterRead, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(db_session),
) -> CompanyRegisterRead:
    """Create a Company + first admin User in one shot."""
    service = AuthService(db)
    token, user, company = await service.register(payload)
    return CompanyRegisterRead(
        user=UserRead.model_validate(user),
        company_id=company.id,
        company_name=company.name,
    )


@router.post("/login", response_model=Token)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(db_session),
) -> Token:
    service = AuthService(db)
    return await service.login(payload.email, payload.password)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(db_session),
) -> Token:
    service = AuthService(db)
    return await service.refresh(payload.refresh_token)


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)
