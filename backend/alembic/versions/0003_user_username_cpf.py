"""add username + cpf columns to users

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-26 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("username", sa.String(length=80), nullable=True),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.add_column(
        "users",
        sa.Column("cpf", sa.String(length=14), nullable=True),
    )
    op.create_index("ix_users_cpf", "users", ["cpf"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_cpf", table_name="users")
    op.drop_column("users", "cpf")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_column("users", "username")