from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.chat import Chat
    from app.models.match import Match
    from app.models.message import Message
    from app.models.preference import Preference
    from app.models.profile import Profile


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    profile: Mapped[Profile | None] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    preference: Mapped[Preference | None] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    sent_matches: Mapped[list[Match]] = relationship(
        back_populates="actor",
        cascade="all, delete-orphan",
        foreign_keys="Match.actor_user_id",
    )
    chats: Mapped[list[Chat]] = relationship(
        secondary="chat_participants",
        back_populates="participants",
    )
    messages: Mapped[list[Message]] = relationship(back_populates="sender")
