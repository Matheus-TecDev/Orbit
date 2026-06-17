from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class CompatibilityQuestion(TimestampMixin, Base):
    __tablename__ = "compatibility_questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    dimension: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    answer_type: Mapped[str] = mapped_column(String(30), default="scale_1_5", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class CompatibilityAnswer(TimestampMixin, Base):
    __tablename__ = "compatibility_answers"
    __table_args__ = (
        UniqueConstraint("user_id", "question_key", name="uq_compatibility_answer_user_question"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    question_key: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    dimension: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    answer_value: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped[User] = relationship(back_populates="compatibility_answers")


class CompatibilityPriority(TimestampMixin, Base):
    __tablename__ = "compatibility_priorities"
    __table_args__ = (
        UniqueConstraint("user_id", "dimension", name="uq_compatibility_priority_user_dimension"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    dimension: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    weight: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped[User] = relationship(back_populates="compatibility_priorities")


class CompatibilityDealbreaker(TimestampMixin, Base):
    __tablename__ = "compatibility_dealbreakers"
    __table_args__ = (
        UniqueConstraint("user_id", "rule_key", name="uq_compatibility_dealbreaker_user_rule"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    rule_key: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    value: Mapped[str | None] = mapped_column(String(120), nullable=True)

    user: Mapped[User] = relationship(back_populates="compatibility_dealbreakers")
