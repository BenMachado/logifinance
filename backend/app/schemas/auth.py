"""Auth-related Pydantic schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    """Payload to create a new company + its first admin user."""

    company_name: str = Field(..., min_length=2, max_length=255)
    cnpj: Optional[str] = Field(None, max_length=20)
    phone: Optional[str] = Field(None, max_length=30)
    full_name: str = Field(..., min_length=2, max_length=255)
    username: Optional[str] = Field(None, min_length=3, max_length=80, description="Nome de usuário (login)")
    cpf: Optional[str] = Field(None, max_length=14, description="CPF no formato 000.000.000-00")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    accept_terms: bool = Field(True, description="Aceitou os termos de uso e política de privacidade")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_admin: bool
    is_active: bool
    company_id: int
    created_at: datetime


class CompanyRegisterRead(BaseModel):
    """Returned alongside the token right after registration."""

    user: UserRead
    company_id: int
    company_name: str
