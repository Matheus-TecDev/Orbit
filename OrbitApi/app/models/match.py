from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.chat import Chat
    from app.models.profile import Profile
    from app.models.user import User


class Match(TimestampMixin, Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("actor_user_id", "target_profile_id", name="uq_match_actor_target"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    target_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(String(20), default="liked", nullable=False)

    actor: Mapped[User] = relationship(
        back_populates="sent_matches",
        foreign_keys=[actor_user_id],
    )
    target_profile: Mapped[Profile] = relationship(
        back_populates="received_matches",
        foreign_keys=[target_profile_id],
        lazy="selectin",
    )
    chat: Mapped[Chat | None] = relationship(back_populates="match", uselist=False)
