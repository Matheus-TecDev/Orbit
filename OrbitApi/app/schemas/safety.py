from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class BlockRead(BaseModel):
    id: UUID
    blocker_user_id: UUID
    blocked_user_id: UUID
    created_at: datetime
    updated_at: datetime


class ReportCreate(BaseModel):
    reason: str | None = Field(default=None, max_length=80)
    details: str | None = Field(default=None, max_length=1000)


class ReportRead(BaseModel):
    id: UUID
    reporter_user_id: UUID
    reported_user_id: UUID
    reason: str | None
    details: str | None
    created_at: datetime
    updated_at: datetime
