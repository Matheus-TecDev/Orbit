from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.participant import ParticipantSummary


class ChatRead(BaseModel):
    id: UUID
    match_id: UUID | None
    participant_ids: list[UUID]
    other_participant: ParticipantSummary | None
    last_message: str | None
    last_message_at: datetime | None
    created_at: datetime
    updated_at: datetime
