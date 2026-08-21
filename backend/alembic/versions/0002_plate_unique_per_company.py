"""plate unique per company

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_vehicles_plate", table_name="vehicles")
    op.create_index(
        "ix_vehicles_plate",
        "vehicles",
        ["plate"],
        unique=False,
    )
    op.create_unique_constraint(
        "uq_vehicle_company_plate",
        "vehicles",
        ["company_id", "plate"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_vehicle_company_plate", "vehicles", type_="unique")
    op.drop_index("ix_vehicles_plate", table_name="vehicles")
    op.create_index(
        "ix_vehicles_plate",
        "vehicles",
        ["plate"],
        unique=True,
    )
