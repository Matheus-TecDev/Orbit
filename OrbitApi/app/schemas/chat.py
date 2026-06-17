from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ChatRead(BaseModel):
    id: UUID
    match_id: UUID | None
    participant_ids: list[UUID]
    last_message: str | None
    created_at: datetime
    updated_at: datetime
