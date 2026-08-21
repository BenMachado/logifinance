"""Authentication service — registration and login flows."""
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.company import Company
from app.models.user import User
from app.schemas.auth import RegisterRequest, Token


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register(self, payload: RegisterRequest) -> tuple[Token, User, Company]:
        """Create a Company + first admin User atomically. Returns (token, user, company)."""

        # Email uniqueness check
        existing = await self.db.execute(select(User).where(User.email == payload.email))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado",
            )

        # CNPJ uniqueness (optional field, but if provided, must be unique)
        if payload.cnpj:
            existing_cnpj = await self.db.execute(
                select(Company).where(Company.cnpj == payload.cnpj)
            )
            if existing_cnpj.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="CNPJ já cadastrado",
                )

        company = Company(
            name=payload.company_name,
            cnpj=payload.cnpj,
            phone=payload.phone,
        )
        self.db.add(company)
        await self.db.flush()  # populates company.id

        user = User(
            company_id=company.id,
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            is_admin=True,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        await self.db.refresh(company)

        token = self._make_token(user.id)
        return token, user, company

    async def login(self, email: str, password: str) -> Token:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo",
            )
        return self._make_token(user.id)

    async def refresh(self, refresh_token: str) -> Token:
        from app.core.security import decode_token

        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        user_id = int(payload["sub"])
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        return self._make_token(user.id)

    def _make_token(self, user_id: int) -> Token:
        return Token(
            access_token=create_access_token(user_id),
            refresh_token=create_refresh_token(user_id),
        )
