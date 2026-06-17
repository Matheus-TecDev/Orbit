from uuid import UUID

from pydantic import BaseModel


class RecommendationRead(BaseModel):
    profile_id: UUID
    display_name: str
    bio: str | None
    age: int | None
    city: str | None
    intention: str | None
    interests: list[str]
    score: int
    reasons: list[str]
