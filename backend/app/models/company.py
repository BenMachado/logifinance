"""Company model — the tenant root."""
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    cnpj: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    expected_margin: Mapped[float] = mapped_column(default=0.20, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    drivers = relationship("Driver", back_populates="company", cascade="all, delete-orphan")
    vehicles = relationship("Vehicle", back_populates="company", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="company", cascade="all, delete-orphan")
    cost_entries = relationship("CostEntry", back_populates="company", cascade="all, delete-orphan")
    receipts = relationship("Receipt", back_populates="company", cascade="all, delete-orphan")
    maintenance = relationship("MaintenanceRecord", back_populates="company", cascade="all, delete-orphan")
    alerts = relationship("CostAlert", back_populates="company", cascade="all, delete-orphan")
