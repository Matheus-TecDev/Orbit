"""cities and preference fields

Revision ID: 20260617_0003
Revises: 20260617_0002
Create Date: 2026-06-17 12:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_0003"
down_revision: str | None = "20260617_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "cities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("state", sa.String(length=80), nullable=True),
        sa.Column("country", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", "state", "country", name="uq_city_name_state_country"),
    )
    op.create_index("ix_cities_name", "cities", ["name"], unique=False)

    op.add_column("preferences", sa.Column("max_distance_km", sa.Integer(), server_default="100", nullable=False))
    op.add_column(
        "preferences",
        sa.Column("preferred_genders", postgresql.JSONB(astext_type=sa.Text()), server_default="[]", nullable=False),
    )
    op.alter_column("preferences", "max_distance_km", server_default=None)
    op.alter_column("preferences", "preferred_genders", server_default=None)


def downgrade() -> None:
    op.drop_column("preferences", "preferred_genders")
    op.drop_column("preferences", "max_distance_km")
    op.drop_index("ix_cities_name", table_name="cities")
    op.drop_table("cities")
