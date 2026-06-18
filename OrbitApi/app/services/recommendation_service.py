from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.preference import Preference
from app.models.profile import Profile
from app.models.user import User
from app.repositories.compatibility_repository import (
    list_answers_by_user_ids,
    list_dealbreakers_by_user_ids,
    list_priorities_by_user_ids,
)
from app.repositories.match_repository import list_acted_profile_ids
from app.repositories.preference_repository import get_preference_by_user_id
from app.repositories.profile_repository import get_profile_by_user_id, list_visible_profiles
from app.schemas.profile import DATING_INTENTIONS
from app.schemas.recommendation import RecommendationRead


FUTURE_VALUE_DIMENSIONS = {"family", "future_plans", "children", "money", "spirituality"}
COMMUNICATION_DIMENSIONS = {
    "communication_frequency",
    "conflict_resolution",
    "affection",
    "personal_space",
    "jealousy",
    "relationship_pace",
}
LIFESTYLE_DIMENSIONS = {"lifestyle", "routine", "nightlife", "fitness", "travel"}
SENSITIVE_DIMENSIONS = {"children", "spirituality", "money"}


def calculate_age(birth_date: date | None) -> int | None:
    if birth_date is None:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def _same_text(left: str | None, right: str | None) -> bool:
    return bool(left and right and left.strip().lower() == right.strip().lower())


def _same_intention(left: str | None, right: str | None) -> bool:
    left_intention = left.strip().lower() if left else None
    right_intention = right.strip().lower() if right else None

    return bool(
        left_intention
        and right_intention
        and left_intention in DATING_INTENTIONS
        and right_intention in DATING_INTENTIONS
        and left_intention == right_intention
    )


def _answer_similarity(left: int, right: int) -> float:
    diff = abs(left - right)
    if diff == 0:
        return 1.0
    if diff == 1:
        return 0.75
    if diff == 2:
        return 0.5
    return 0.2


def _score_intention(*, current_profile: Profile, preference: Preference | None, candidate: Profile) -> tuple[int, str | None]:
    if preference and _same_intention(candidate.intention, preference.intention):
        return 20, "intenção alinhada"
    if _same_intention(candidate.intention, current_profile.intention):
        return 12, "intenção alinhada"
    return 0, None


def _score_objective_preferences(
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
        score += 6
        reasons.append("perfil dentro das suas preferências")

    if preference and _same_text(candidate.city, preference.city):
        score += 6
        reasons.append("perfil dentro das suas preferências")
    elif _same_text(candidate.city, current_profile.city):
        score += 3

    preferred_genders = set(preference.preferred_genders) if preference else set()
    candidate_gender = candidate.gender.strip().lower() if candidate.gender else None
    if preference and candidate_gender and candidate_gender in preferred_genders:
        score += 5
        reasons.append("perfil dentro das suas preferências")
    elif preference and _same_text(candidate.gender, preference.gender):
        score += 5
        reasons.append("perfil dentro das suas preferências")

    reference_interests = preferred_interests or current_interests
    common_interests = candidate_interests & reference_interests
    if common_interests:
        score += min(len(common_interests) * 2, 8)
        reasons.append("interesses em comum")

    return min(score, 25), reasons


def _score_compatibility_answers(
    *,
    current_answers: dict[str, int],
    candidate_answers: dict[str, int],
    current_priorities: dict[str, int],
) -> tuple[int, list[str]]:
    weighted_total = 0.0
    weight_sum = 0
    dimension_scores: dict[str, float] = {}

    for dimension, current_value in current_answers.items():
        candidate_value = candidate_answers.get(dimension)
        if candidate_value is None:
            continue

        weight = current_priorities.get(dimension, 3)
        similarity = _answer_similarity(current_value, candidate_value)
        weighted_total += similarity * weight
        weight_sum += weight
        dimension_scores[dimension] = similarity

    if weight_sum == 0:
        return 0, []

    score = round((weighted_total / weight_sum) * 35)
    reasons: list[str] = []
    if _average_dimension_score(dimension_scores, FUTURE_VALUE_DIMENSIONS) >= 0.7:
        reasons.append("valores de futuro parecidos")
    if _average_dimension_score(dimension_scores, COMMUNICATION_DIMENSIONS) >= 0.7:
        reasons.append("boa compatibilidade de comunicação")
    if _average_dimension_score(dimension_scores, LIFESTYLE_DIMENSIONS) >= 0.7:
        reasons.append("estilo de vida compatível")
    if any(
        dimension in SENSITIVE_DIMENSIONS and score_value >= 0.75
        for dimension, score_value in dimension_scores.items()
    ):
        reasons.append("boa compatibilidade nos pontos mais importantes")

    return score, reasons


def _average_dimension_score(scores: dict[str, float], dimensions: set[str]) -> float:
    values = [score for dimension, score in scores.items() if dimension in dimensions]
    if not values:
        return 0.0
    return sum(values) / len(values)


def _score_priority_alignment(
    *,
    current_priorities: dict[str, int],
    candidate_priorities: dict[str, int],
) -> tuple[int, list[str]]:
    if not current_priorities:
        return 0, []

    total_weight = sum(current_priorities.values())
    aligned_weight = sum(
        weight
        for dimension, weight in current_priorities.items()
        if dimension in candidate_priorities
    )
    if total_weight == 0:
        return 0, []

    score = round((aligned_weight / total_weight) * 20)
    reasons = ["prioridades importantes em comum"] if score >= 8 else []
    return score, reasons


def _dealbreaker_penalty(
    *,
    current_dealbreakers: set[str],
    current_profile: Profile,
    preference: Preference | None,
    candidate: Profile,
    current_answers: dict[str, int],
    candidate_answers: dict[str, int],
) -> int:
    penalty = 0
    preferred_city = preference.city if preference and preference.city else current_profile.city

    def add_if(condition: bool) -> None:
        nonlocal penalty
        if condition:
            penalty += 25

    add_if("casual_only" in current_dealbreakers and candidate.intention == "casual")
    add_if(
        "long_distance" in current_dealbreakers
        and bool(candidate.city)
        and bool(preferred_city)
        and not _same_text(candidate.city, preferred_city)
    )
    add_if(
        "different_spirituality" in current_dealbreakers
        and _answer_difference_at_least(current_answers, candidate_answers, "spirituality", 3)
    )
    add_if(
        "incompatible_routine" in current_dealbreakers
        and (
            _answer_difference_at_least(current_answers, candidate_answers, "routine", 3)
            or _answer_difference_at_least(current_answers, candidate_answers, "lifestyle", 3)
        )
    )
    add_if(
        "poor_communication" in current_dealbreakers
        and (
            _answer_difference_at_least(current_answers, candidate_answers, "communication_frequency", 3)
            or _answer_difference_at_least(current_answers, candidate_answers, "conflict_resolution", 3)
        )
    )
    add_if(
        (
            "wants_children_incompatible" in current_dealbreakers
            or "does_not_want_children_incompatible" in current_dealbreakers
        )
        and _answer_difference_at_least(current_answers, candidate_answers, "children", 3)
    )

    return min(penalty, 50)


def _answer_difference_at_least(
    current_answers: dict[str, int],
    candidate_answers: dict[str, int],
    dimension: str,
    threshold: int,
) -> bool:
    current_value = current_answers.get(dimension)
    candidate_value = candidate_answers.get(dimension)
    return current_value is not None and candidate_value is not None and abs(current_value - candidate_value) >= threshold


def _score_profile(
    *,
    current_profile: Profile,
    preference: Preference | None,
    candidate: Profile,
    current_answers: dict[str, int],
    candidate_answers: dict[str, int],
    current_priorities: dict[str, int],
    candidate_priorities: dict[str, int],
    current_dealbreakers: set[str],
) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []

    intention_score, intention_reason = _score_intention(
        current_profile=current_profile,
        preference=preference,
        candidate=candidate,
    )
    score += intention_score
    if intention_reason:
        reasons.append(intention_reason)

    objective_score, objective_reasons = _score_objective_preferences(
        current_profile=current_profile,
        preference=preference,
        candidate=candidate,
    )
    score += objective_score
    reasons.extend(objective_reasons)

    answer_score, answer_reasons = _score_compatibility_answers(
        current_answers=current_answers,
        candidate_answers=candidate_answers,
        current_priorities=current_priorities,
    )
    score += answer_score
    reasons.extend(answer_reasons)

    priority_score, priority_reasons = _score_priority_alignment(
        current_priorities=current_priorities,
        candidate_priorities=candidate_priorities,
    )
    score += priority_score
    reasons.extend(priority_reasons)

    score -= _dealbreaker_penalty(
        current_dealbreakers=current_dealbreakers,
        current_profile=current_profile,
        preference=preference,
        candidate=candidate,
        current_answers=current_answers,
        candidate_answers=candidate_answers,
    )

    unique_reasons = _unique_reasons(reasons)
    if not unique_reasons:
        unique_reasons = ["perfil dentro das suas preferências"]

    return max(0, min(100, score)), unique_reasons[:5]


def _unique_reasons(reasons: list[str]) -> list[str]:
    unique: list[str] = []
    for reason in reasons:
        if reason not in unique:
            unique.append(reason)
    return unique


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
    compatibility_user_ids = [current_user.id, *[candidate.user_id for candidate in candidates]]
    answers_by_user = _answers_by_user(list_answers_by_user_ids(db, compatibility_user_ids))
    priorities_by_user = _priorities_by_user(list_priorities_by_user_ids(db, compatibility_user_ids))
    dealbreakers_by_user = _dealbreakers_by_user(list_dealbreakers_by_user_ids(db, [current_user.id]))
    current_answers = answers_by_user.get(current_user.id, {})
    current_priorities = priorities_by_user.get(current_user.id, {})
    current_dealbreakers = dealbreakers_by_user.get(current_user.id, set())

    ranked: list[tuple[int, RecommendationRead]] = []
    for candidate in candidates:
        score, reasons = _score_profile(
            current_profile=current_profile,
            preference=preference,
            candidate=candidate,
            current_answers=current_answers,
            candidate_answers=answers_by_user.get(candidate.user_id, {}),
            current_priorities=current_priorities,
            candidate_priorities=priorities_by_user.get(candidate.user_id, {}),
            current_dealbreakers=current_dealbreakers,
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


def _answers_by_user(answers) -> dict[UUID, dict[str, int]]:
    grouped: dict[UUID, dict[str, int]] = {}
    for answer in answers:
        grouped.setdefault(answer.user_id, {})[answer.dimension] = answer.answer_value
    return grouped


def _priorities_by_user(priorities) -> dict[UUID, dict[str, int]]:
    grouped: dict[UUID, dict[str, int]] = {}
    for priority in priorities:
        grouped.setdefault(priority.user_id, {})[priority.dimension] = priority.weight
    return grouped


def _dealbreakers_by_user(dealbreakers) -> dict[UUID, set[str]]:
    grouped: dict[UUID, set[str]] = {}
    for dealbreaker in dealbreakers:
        grouped.setdefault(dealbreaker.user_id, set()).add(dealbreaker.rule_key)
    return grouped
