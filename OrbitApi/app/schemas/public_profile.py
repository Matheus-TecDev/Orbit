from uuid import UUID

from pydantic import BaseModel

from app.core.intent_mode_config import IntentMode
from app.schemas.recommendation import (
    RecommendationReasonGroupRead,
    RecommendationScoreBreakdownRead,
)


class PublicProfileCompatibilityRead(BaseModel):
    mutual_score: int
    coverage_percentage: int
    common_interests: list[str]
    score_breakdown: RecommendationScoreBreakdownRead | None
    reason_groups: list[RecommendationReasonGroupRead]


class PublicProfileRead(BaseModel):
    profile_id: UUID
    user_id: UUID
    name: str
    age: int | None
    city: str | None
    bio: str | None
    photo_url: str | None
    intent_mode: IntentMode
    interests: list[str]
    compatibility: PublicProfileCompatibilityRead | None
