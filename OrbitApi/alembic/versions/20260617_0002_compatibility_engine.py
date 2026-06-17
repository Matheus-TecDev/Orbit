"""compatibility engine

Revision ID: 20260617_0002
Revises: 20260614_0001
Create Date: 2026-06-17 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260617_0002"
down_revision: str | None = "20260614_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "compatibility_questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("key", sa.String(length=120), nullable=False),
        sa.Column("dimension", sa.String(length=80), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("answer_type", sa.String(length=30), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_compatibility_questions_dimension", "compatibility_questions", ["dimension"], unique=False)
    op.create_index("ix_compatibility_questions_key", "compatibility_questions", ["key"], unique=True)

    op.create_table(
        "compatibility_answers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("question_key", sa.String(length=120), nullable=False),
        sa.Column("dimension", sa.String(length=80), nullable=False),
        sa.Column("answer_value", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "question_key", name="uq_compatibility_answer_user_question"),
    )
    op.create_index("ix_compatibility_answers_dimension", "compatibility_answers", ["dimension"], unique=False)
    op.create_index("ix_compatibility_answers_question_key", "compatibility_answers", ["question_key"], unique=False)
    op.create_index("ix_compatibility_answers_user_id", "compatibility_answers", ["user_id"], unique=False)

    op.create_table(
        "compatibility_priorities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dimension", sa.String(length=80), nullable=False),
        sa.Column("weight", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "dimension", name="uq_compatibility_priority_user_dimension"),
    )
    op.create_index("ix_compatibility_priorities_dimension", "compatibility_priorities", ["dimension"], unique=False)
    op.create_index("ix_compatibility_priorities_user_id", "compatibility_priorities", ["user_id"], unique=False)

    op.create_table(
        "compatibility_dealbreakers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rule_key", sa.String(length=80), nullable=False),
        sa.Column("value", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "rule_key", name="uq_compatibility_dealbreaker_user_rule"),
    )
    op.create_index("ix_compatibility_dealbreakers_rule_key", "compatibility_dealbreakers", ["rule_key"], unique=False)
    op.create_index("ix_compatibility_dealbreakers_user_id", "compatibility_dealbreakers", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_compatibility_dealbreakers_user_id", table_name="compatibility_dealbreakers")
    op.drop_index("ix_compatibility_dealbreakers_rule_key", table_name="compatibility_dealbreakers")
    op.drop_table("compatibility_dealbreakers")
    op.drop_index("ix_compatibility_priorities_user_id", table_name="compatibility_priorities")
    op.drop_index("ix_compatibility_priorities_dimension", table_name="compatibility_priorities")
    op.drop_table("compatibility_priorities")
    op.drop_index("ix_compatibility_answers_user_id", table_name="compatibility_answers")
    op.drop_index("ix_compatibility_answers_question_key", table_name="compatibility_answers")
    op.drop_index("ix_compatibility_answers_dimension", table_name="compatibility_answers")
    op.drop_table("compatibility_answers")
    op.drop_index("ix_compatibility_questions_key", table_name="compatibility_questions")
    op.drop_index("ix_compatibility_questions_dimension", table_name="compatibility_questions")
    op.drop_table("compatibility_questions")
