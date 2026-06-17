from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.preference import Preference
    from app.models.profile import Profile


profile_interests = Table(
    "profile_interests",
    Base.metadata,
    Column("profile_id", UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("interest_id", UUID(as_uuid=True), ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True),
)

preference_interests = Table(
    "preference_interests",
    Base.metadata,
    Column("preference_id", UUID(as_uuid=True), ForeignKey("preferences.id", ondelete="CASCADE"), primary_key=True),
    Column("interest_id", UUID(as_uuid=True), ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True),
)


class Interest(Base):
    __tablename__ = "interests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)

    profiles: Mapped[list[Profile]] = relationship(
        secondary=profile_interests,
        back_populates="interests",
    )
    preferences: Mapped[list[Preference]] = relationship(
        secondary=preference_interests,
        back_populates="interests",
    )
