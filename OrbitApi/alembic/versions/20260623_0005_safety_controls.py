"""add post-match safety controls

Revision ID: 20260623_0005
Revises: 20260622_0004
Create Date: 2026-06-23 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260623_0005"
down_revision: str | None = "20260622_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "user_blocks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("blocker_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("blocked_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["blocked_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["blocker_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("blocker_user_id", "blocked_user_id", name="uq_user_block_pair"),
    )
    op.create_index("ix_user_blocks_blocked_user_id", "user_blocks", ["blocked_user_id"], unique=False)
    op.create_index("ix_user_blocks_blocker_user_id", "user_blocks", ["blocker_user_id"], unique=False)

    op.create_table(
        "user_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reporter_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reported_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reason", sa.String(length=80), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["reported_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reporter_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_reports_reported_user_id", "user_reports", ["reported_user_id"], unique=False)
    op.create_index("ix_user_reports_reporter_user_id", "user_reports", ["reporter_user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_user_reports_reporter_user_id", table_name="user_reports")
    op.drop_index("ix_user_reports_reported_user_id", table_name="user_reports")
    op.drop_table("user_reports")
    op.drop_index("ix_user_blocks_blocker_user_id", table_name="user_blocks")
    op.drop_index("ix_user_blocks_blocked_user_id", table_name="user_blocks")
    op.drop_table("user_blocks")
