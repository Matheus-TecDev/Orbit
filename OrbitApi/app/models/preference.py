from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.interest import preference_interests

if TYPE_CHECKING:
    from app.models.interest import Interest
    from app.models.user import User


class Preference(TimestampMixin, Base):
    __tablename__ = "preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    min_age: Mapped[int] = mapped_column(Integer, default=18, nullable=False)
    max_age: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(40), nullable=True)
    intention: Mapped[str | None] = mapped_column(String(80), nullable=True)

    user: Mapped[User] = relationship(back_populates="preference")
    interests: Mapped[list[Interest]] = relationship(
        secondary=preference_interests,
        back_populates="preferences",
        lazy="selectin",
    )
