from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    state: str | None
    country: str
    created_at: datetime
    updated_at: datetime
