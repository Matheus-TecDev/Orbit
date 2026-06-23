from uuid import UUID

from pydantic import BaseModel

from app.core.intent_mode_config import IntentMode


class DirectionalMetricRead(BaseModel):
    score_a_to_b: int | None
    score_b_to_a: int | None


class RecommendationScoreBreakdownRead(BaseModel):
    mode_alignment: DirectionalMetricRead
    objective_preferences: DirectionalMetricRead
    compatibility_answers: DirectionalMetricRead
    priorities: DirectionalMetricRead
    dealbreaker_penalty: DirectionalMetricRead
    mode_penalty: DirectionalMetricRead


class RecommendationReasonGroupRead(BaseModel):
    category: str
    reasons: list[str]


class RecommendationRead(BaseModel):
    profile_id: UUID
    display_name: str
    bio: str | None
    age: int | None
    city: str | None
    photo_url: str | None
    intention: str | None
    intent_mode: IntentMode
    interests: list[str]
    score: int
    mutual_score: int
    score_a_to_b: int
    score_b_to_a: int
    coverage_percentage: int
    common_interests: list[str]
    score_breakdown: RecommendationScoreBreakdownRead | None
    reasons: list[str]
    reason_groups: list[RecommendationReasonGroupRead]
