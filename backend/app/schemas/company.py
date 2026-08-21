"""Company schemas for LogiFinance."""
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CompanyBase(BaseModel):
    name: str = Field(..., max_length=255, description="Nome da empresa / transportadora")
    cnpj: str | None = Field(None, max_length=20, description="CNPJ da empresa")
    phone: str | None = Field(None, max_length=30, description="Telefone de contato")
    expected_margin: float = Field(0.20, ge=0.0, le=1.0, description="Margem esperada (ex: 0.20 = 20%)")


class CompanyUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    cnpj: str | None = Field(None, max_length=20)
    phone: str | None = Field(None, max_length=30)
    expected_margin: float | None = Field(None, ge=0.0, le=1.0)


class CompanyRead(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class CompanyUserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime
