from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.participant import ParticipantSummary
from app.schemas.profile import ProfileRead


class MatchRead(BaseModel):
    id: UUID
    status: str
    target_profile: ProfileRead
    other_participant: ParticipantSummary
    chat_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
