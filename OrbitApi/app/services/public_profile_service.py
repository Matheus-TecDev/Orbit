from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.match import Match
from app.models.profile import Profile
from app.models.user import User
from app.repositories.match_repository import list_matches_between_users
from app.repositories.profile_repository import get_profile_by_id
from app.repositories.safety_repository import is_blocked_between
from app.schemas.participant import calculate_age
from app.schemas.public_profile import PublicProfileCompatibilityRead, PublicProfileRead
from app.services.match_service import MATCHED_STATUS
from app.services.recommendation_service import get_recommendations


def get_public_profile(
    db: Session,
    *,
    current_user: User,
    profile_id: UUID,
) -> PublicProfileRead:
    profile = get_profile_by_id(db, profile_id)
    if profile is None or profile.user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    if is_blocked_between(db, left_user_id=current_user.id, right_user_id=profile.user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    matched = _has_active_match(db, current_user=current_user, profile=profile)
    recommendation = _find_current_recommendation(
        db,
        current_user=current_user,
        profile_id=profile.id,
    )

    if not matched and recommendation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    compatibility = None
    if recommendation is not None:
        compatibility = PublicProfileCompatibilityRead(
            mutual_score=recommendation.mutual_score,
            coverage_percentage=recommendation.coverage_percentage,
            common_interests=recommendation.common_interests,
            score_breakdown=recommendation.score_breakdown,
            reason_groups=recommendation.reason_groups,
        )

    return PublicProfileRead(
        profile_id=profile.id,
        user_id=profile.user_id,
        name=profile.display_name,
        age=calculate_age(profile.birth_date),
        city=profile.city,
        bio=profile.bio,
        photo_url=profile.photo_url,
        intent_mode=profile.intent_mode,
        interests=[interest.name for interest in profile.interests],
        compatibility=compatibility,
    )


def _has_active_match(db: Session, *, current_user: User, profile: Profile) -> bool:
    return any(
        _is_active_match(match)
        for match in list_matches_between_users(
            db,
            left_user_id=current_user.id,
            right_user_id=profile.user_id,
        )
    )


def _is_active_match(match: Match) -> bool:
    return match.status == MATCHED_STATUS


def _find_current_recommendation(
    db: Session,
    *,
    current_user: User,
    profile_id: UUID,
):
    try:
        recommendations = get_recommendations(db, current_user=current_user)
    except HTTPException:
        return None

    return next(
        (recommendation for recommendation in recommendations if recommendation.profile_id == profile_id),
        None,
    )
