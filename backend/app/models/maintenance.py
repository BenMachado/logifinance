"""MaintenanceRecord model — scheduled/realized vehicle maintenance."""
import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MaintenanceType(str, enum.Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    INSPECTION = "inspection"


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    vehicle_id: Mapped[int] = mapped_column(
        ForeignKey("vehicles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    type: Mapped[MaintenanceType] = mapped_column(
        Enum(MaintenanceType), default=MaintenanceType.PREVENTIVE, nullable=False
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    cost: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    performed_on: Mapped[date] = mapped_column(Date, nullable=False)
    next_due: Mapped[date | None] = mapped_column(Date, nullable=True)
    cost_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("cost_entries.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    company = relationship("Company", back_populates="maintenance")
    vehicle = relationship("Vehicle", back_populates="maintenance")
    cost_entry = relationship("CostEntry", back_populates="maintenance_record")
