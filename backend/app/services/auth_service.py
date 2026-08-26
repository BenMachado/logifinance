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
from app.models.subscription import PlanType, Subscription, SubscriptionStatus
from app.models.user import User
from app.schemas.auth import RegisterRequest, Token


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register(self, payload: RegisterRequest) -> tuple[Token, User, Company]:
        """Create a Company + first admin User atomically. Returns (token, user, company)."""

        # Termos de uso são obrigatórios
        if not payload.accept_terms:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="É necessário aceitar os termos de uso e política de privacidade.",
            )

        # Email uniqueness check
        existing = await self.db.execute(select(User).where(User.email == payload.email))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado",
            )

        # Username uniqueness (opcional mas, se enviado, precisa ser único)
        if payload.username:
            existing_user = await self.db.execute(
                select(User).where(User.username == payload.username)
            )
            if existing_user.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Nome de usuário já cadastrado",
                )

        # CPF uniqueness (opcional mas, se enviado, precisa ser único)
        if payload.cpf:
            existing_cpf = await self.db.execute(select(User).where(User.cpf == payload.cpf))
            if existing_cpf.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="CPF já cadastrado",
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
            username=payload.username,
            cpf=payload.cpf,
            hashed_password=hash_password(payload.password),
            is_admin=True,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        await self.db.refresh(company)

        # Cria uma Subscription em TRIAL — o usuário pode navegar pelo
        # dashboard, mas o gate do frontend mostra um modal quando ele
        # tenta usar as funcionalidades de gestão (criar viagem, custo,
        # veículo, etc.) até que ele assine um plano.
        subscription = Subscription(
            company_id=company.id,
            plan=PlanType.TRIAL,
            status=SubscriptionStatus.TRIAL,
            fleet_size=0,
            price_cents=0,
        )
        self.db.add(subscription)

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