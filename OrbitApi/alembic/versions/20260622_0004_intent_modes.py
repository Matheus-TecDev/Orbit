"""add canonical intent modes

Revision ID: 20260622_0004
Revises: 20260617_0003
Create Date: 2026-06-22 12:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260622_0004"
down_revision: str | None = "20260617_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


intent_mode_enum = postgresql.ENUM(
    "SERIOUS",
    "EXPLORING",
    "CASUAL",
    name="intent_mode_enum",
    create_type=False,
)


def upgrade() -> None:
    intent_mode_enum.create(op.get_bind(), checkfirst=True)
    op.execute(
        """
        UPDATE preferences
        SET intention = CASE lower(trim(coalesce(intention, '')))
            WHEN 'casual' THEN 'casual'
            WHEN 'exploring' THEN 'exploring'
            WHEN 'serious' THEN 'serious'
            ELSE 'serious'
        END
        """
    )
    op.add_column(
        "profiles",
        sa.Column(
            "intent_mode",
            intent_mode_enum,
            server_default="SERIOUS",
            nullable=False,
        ),
    )
    op.execute(
        """
        UPDATE profiles AS profile
        SET
            intent_mode = CASE coalesce(
                CASE lower(trim(coalesce(profile.intention, '')))
                    WHEN 'casual' THEN 'casual'
                    WHEN 'exploring' THEN 'exploring'
                    WHEN 'serious' THEN 'serious'
                    ELSE NULL
                END,
                (
                    SELECT preference.intention
                    FROM preferences AS preference
                    WHERE preference.user_id = profile.user_id
                ),
                'serious'
            )
                WHEN 'casual' THEN 'CASUAL'::intent_mode_enum
                WHEN 'exploring' THEN 'EXPLORING'::intent_mode_enum
                ELSE 'SERIOUS'::intent_mode_enum
            END,
            intention = coalesce(
                CASE lower(trim(coalesce(profile.intention, '')))
                    WHEN 'casual' THEN 'casual'
                    WHEN 'exploring' THEN 'exploring'
                    WHEN 'serious' THEN 'serious'
                    ELSE NULL
                END,
                (
                    SELECT preference.intention
                    FROM preferences AS preference
                    WHERE preference.user_id = profile.user_id
                ),
                'serious'
            )
        """
    )
    op.execute(
        """
        UPDATE preferences AS preference
        SET intention = profile.intention
        FROM profiles AS profile
        WHERE profile.user_id = preference.user_id
        """
    )


def downgrade() -> None:
    op.drop_column("profiles", "intent_mode")
    intent_mode_enum.drop(op.get_bind(), checkfirst=True)
