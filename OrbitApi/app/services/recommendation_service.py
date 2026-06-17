from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.preference import Preference
from app.models.profile import Profile
from app.models.user import User
from app.repositories.match_repository import list_acted_profile_ids
from app.repositories.preference_repository import get_preference_by_user_id
from app.repositories.profile_repository import get_profile_by_user_id, list_visible_profiles
from app.schemas.recommendation import RecommendationRead


def calculate_age(birth_date: date | None) -> int | None:
    if birth_date is None:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def _same_text(left: str | None, right: str | None) -> bool:
    return bool(left and right and left.strip().lower() == right.strip().lower())


def _score_profile(
    *,
    current_profile: Profile,
    preference: Preference | None,
    candidate: Profile,
) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []
    candidate_age = calculate_age(candidate.birth_date)
    candidate_interests = {interest.name for interest in candidate.interests}
    current_interests = {interest.name for interest in current_profile.interests}
    preferred_interests = {interest.name for interest in preference.interests} if preference else set()

    if preference and preference.min_age <= (candidate_age or 0) <= preference.max_age:
        score += 20
        reasons.append("idade dentro das preferencias")

    if preference and _same_text(candidate.city, preference.city):
        score += 20
        reasons.append("cidade preferida")
    elif _same_text(candidate.city, current_profile.city):
        score += 10
        reasons.append("mesma cidade")

    if preference and _same_text(candidate.intention, preference.intention):
        score += 25
        reasons.append("intencao alinhada")
    elif _same_text(candidate.intention, current_profile.intention):
        score += 15
        reasons.append("intencao em comum")

    if preference and _same_text(candidate.gender, preference.gender):
        score += 10
        reasons.append("genero preferido")

    reference_interests = preferred_interests or current_interests
    common_interests = candidate_interests & reference_interests
    if common_interests:
        score += min(len(common_interests) * 5, 25)
        reasons.append(f"{len(common_interests)} interesses em comum")

    if not reasons:
        score += 1
        reasons.append("perfil visivel para descoberta")

    return score, reasons


def get_recommendations(db: Session, *, current_user: User, limit: int = 20) -> list[RecommendationRead]:
    current_profile = get_profile_by_user_id(db, current_user.id)
    if current_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a profile before requesting recommendations",
        )

    preference = get_preference_by_user_id(db, current_user.id)
    acted_profile_ids = list_acted_profile_ids(db, user_id=current_user.id)
    candidates = [
        profile
        for profile in list_visible_profiles(db, excluded_user_id=current_user.id)
        if profile.id not in acted_profile_ids
    ]

    ranked: list[tuple[int, RecommendationRead]] = []
    for candidate in candidates:
        score, reasons = _score_profile(
            current_profile=current_profile,
            preference=preference,
            candidate=candidate,
        )
        ranked.append(
            (
                score,
                RecommendationRead(
                    profile_id=candidate.id,
                    display_name=candidate.display_name,
                    bio=candidate.bio,
                    age=calculate_age(candidate.birth_date),
                    city=candidate.city,
                    intention=candidate.intention,
                    interests=[interest.name for interest in candidate.interests],
                    score=score,
                    reasons=reasons,
                ),
            )
        )

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [recommendation for _, recommendation in ranked[:limit]]
