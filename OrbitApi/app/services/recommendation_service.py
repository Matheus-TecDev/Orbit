from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.intent_mode_config import (
    ANSWER_SIMILARITY_BY_DIFFERENCE,
    ANSWER_SIMILARITY_FLOOR,
    COMMON_INTEREST_NORMALIZATION_COUNT,
    CONFIDENCE_BASE_FACTOR,
    CONFIDENCE_COVERAGE_FACTOR,
    DEALBREAKER_DIFFERENCE_THRESHOLD,
    DEFAULT_PRIORITY_WEIGHT,
    IntentMode,
    MAX_RECOMMENDATION_REASONS,
    PRIORITY_SIMILARITY_NORMALIZER,
    REASON_SCORE_THRESHOLD,
    get_dimension_group,
    get_dimension_multiplier,
    get_intent_mode_profile,
    get_mode_alignment,
    get_mode_pair_penalty,
)
from app.models.preference import Preference
from app.models.profile import Profile
from app.models.user import User
from app.repositories.compatibility_repository import (
    list_active_questions,
    list_answers_by_user_ids,
    list_dealbreakers_by_user_ids,
    list_priorities_by_user_ids,
)
from app.repositories.match_repository import list_acted_profile_ids
from app.repositories.preference_repository import (
    get_preference_by_user_id,
    list_preferences_by_user_ids,
)
from app.repositories.profile_repository import get_profile_by_user_id, list_visible_profiles
from app.schemas.recommendation import (
    DirectionalMetricRead,
    RecommendationRead,
    RecommendationReasonGroupRead,
    RecommendationScoreBreakdownRead,
)


@dataclass(frozen=True)
class ProfileSnapshot:
    profile_id: UUID
    user_id: UUID
    display_name: str
    bio: str | None
    birth_date: date | None
    gender: str | None
    city: str | None
    intention: str | None
    intent_mode: IntentMode
    interests: frozenset[str]


@dataclass(frozen=True)
class PreferenceSnapshot:
    min_age: int
    max_age: int
    city: str | None
    preferred_genders: frozenset[str]
    interests: frozenset[str]


@dataclass(frozen=True)
class CompatibilitySnapshot:
    answers: dict[str, dict[str, int]]
    priorities: dict[str, int]
    dealbreakers: frozenset[str]


@dataclass(frozen=True)
class RecommendationSubject:
    profile: ProfileSnapshot
    preference: PreferenceSnapshot | None
    compatibility: CompatibilitySnapshot


@dataclass(frozen=True)
class DirectionalScore:
    score: int
    coverage: int
    components: dict[str, int | None]
    reasons: tuple[str, ...]
    reason_groups: dict[str, tuple[str, ...]]


def calculate_age(birth_date: date | None) -> int | None:
    if birth_date is None:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def resolve_recommendation_limit(mode: IntentMode, requested_limit: int | None) -> int:
    profile = get_intent_mode_profile(mode)
    requested = requested_limit if requested_limit is not None else profile.default_limit
    if requested < 1:
        raise ValueError("recommendation limit must be greater than zero")
    return min(requested, profile.maximum_limit)


def is_recommendation_relevant(mode: IntentMode, mutual_score: int) -> bool:
    return mutual_score >= get_intent_mode_profile(mode).minimum_score


def calculate_directional_score(
    subject: RecommendationSubject,
    candidate: RecommendationSubject,
    *,
    active_questions: dict[str, frozenset[str]],
) -> DirectionalScore:
    mode = subject.profile.intent_mode
    mode_profile = get_intent_mode_profile(mode)
    mode_alignment = get_mode_alignment(mode, candidate.profile.intent_mode)
    objective_score, objective_reasons = _score_objective_preferences(subject, candidate)
    compatibility_score, coverage, group_scores = _score_compatibility_answers(
        subject,
        candidate,
        active_questions=active_questions,
    )
    priority_score = _score_priority_alignment(subject, candidate)
    dealbreaker_penalty = _dealbreaker_penalty(subject, candidate)
    mode_penalty = get_mode_pair_penalty(mode, candidate.profile.intent_mode)

    component_ratios = {
        "mode_alignment": mode_alignment,
        "objective_preferences": objective_score,
        "compatibility_answers": compatibility_score,
        "priorities": priority_score,
    }
    component_weights = mode_profile.component_weights
    configured_weights = {
        "mode_alignment": component_weights.mode_alignment,
        "objective_preferences": component_weights.objective_preferences,
        "compatibility_answers": component_weights.compatibility_answers,
        "priorities": component_weights.priorities,
    }
    available_weight = sum(
        configured_weights[key]
        for key, value in component_ratios.items()
        if value is not None
    )
    weighted_score = sum(
        value * configured_weights[key]
        for key, value in component_ratios.items()
        if value is not None
    )
    raw_score = (weighted_score / available_weight) * 100 if available_weight else 0
    confidence_factor = CONFIDENCE_BASE_FACTOR + (
        CONFIDENCE_COVERAGE_FACTOR * coverage / 100
    )
    score = round(raw_score * confidence_factor) - dealbreaker_penalty - mode_penalty

    reason_groups = _build_reason_groups(
        mode_alignment=mode_alignment,
        objective_reasons=objective_reasons,
        group_scores=group_scores,
        priority_score=priority_score,
    )
    reasons = tuple(
        reason
        for grouped_reasons in reason_groups.values()
        for reason in grouped_reasons
    )
    components = {
        key: None if value is None else round(value * 100)
        for key, value in component_ratios.items()
    }
    components["dealbreaker_penalty"] = dealbreaker_penalty
    components["mode_penalty"] = mode_penalty

    return DirectionalScore(
        score=max(0, min(100, score)),
        coverage=coverage,
        components=components,
        reasons=tuple(_unique(reasons)),
        reason_groups=reason_groups,
    )


def get_recommendations(
    db: Session,
    *,
    current_user: User,
    limit: int | None = None,
) -> list[RecommendationRead]:
    current_profile_model = get_profile_by_user_id(db, current_user.id)
    if current_profile_model is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a profile before requesting recommendations",
        )

    current_preference_model = get_preference_by_user_id(db, current_user.id)
    acted_profile_ids = list_acted_profile_ids(db, user_id=current_user.id)

    # TODO: move stable eligibility filters (mode, age, gender, city and acted profiles)
    # into this repository query before the in-memory ranking pool grows.
    candidate_models = [
        profile
        for profile in list_visible_profiles(db, excluded_user_id=current_user.id)
        if profile.id not in acted_profile_ids
    ]
    user_ids = [current_user.id, *[candidate.user_id for candidate in candidate_models]]
    preferences_by_user = {
        preference.user_id: preference
        for preference in list_preferences_by_user_ids(db, user_ids)
    }
    answers_by_user = _answers_by_user(list_answers_by_user_ids(db, user_ids))
    priorities_by_user = _priorities_by_user(list_priorities_by_user_ids(db, user_ids))
    dealbreakers_by_user = _dealbreakers_by_user(list_dealbreakers_by_user_ids(db, user_ids))
    active_questions = _active_questions_by_dimension(list_active_questions(db))

    current_subject = _to_subject(
        current_profile_model,
        current_preference_model,
        answers_by_user,
        priorities_by_user,
        dealbreakers_by_user,
    )
    effective_limit = resolve_recommendation_limit(current_subject.profile.intent_mode, limit)
    ranked: list[tuple[int, RecommendationRead]] = []

    for candidate_model in candidate_models:
        candidate_subject = _to_subject(
            candidate_model,
            preferences_by_user.get(candidate_model.user_id),
            answers_by_user,
            priorities_by_user,
            dealbreakers_by_user,
        )
        a_to_b = calculate_directional_score(
            current_subject,
            candidate_subject,
            active_questions=active_questions,
        )
        b_to_a = calculate_directional_score(
            candidate_subject,
            current_subject,
            active_questions=active_questions,
        )
        mutual_score = min(a_to_b.score, b_to_a.score)
        if not is_recommendation_relevant(current_subject.profile.intent_mode, mutual_score):
            continue

        reasons = _unique([*a_to_b.reasons, *b_to_a.reasons])[
            :MAX_RECOMMENDATION_REASONS
        ]
        reason_groups = _merge_reason_groups(a_to_b.reason_groups, b_to_a.reason_groups)
        common_interests = sorted(
            current_subject.profile.interests & candidate_subject.profile.interests
        )
        recommendation = RecommendationRead(
            profile_id=candidate_subject.profile.profile_id,
            display_name=candidate_subject.profile.display_name,
            bio=candidate_subject.profile.bio,
            age=calculate_age(candidate_subject.profile.birth_date),
            city=candidate_subject.profile.city,
            intention=candidate_subject.profile.intention,
            intent_mode=candidate_subject.profile.intent_mode,
            interests=sorted(candidate_subject.profile.interests),
            score=mutual_score,
            mutual_score=mutual_score,
            score_a_to_b=a_to_b.score,
            score_b_to_a=b_to_a.score,
            coverage_percentage=min(a_to_b.coverage, b_to_a.coverage),
            common_interests=common_interests,
            score_breakdown=_build_breakdown(a_to_b, b_to_a),
            reasons=reasons,
            reason_groups=reason_groups,
        )
        ranked.append((mutual_score, recommendation))

    # TODO: add a coarse SQL rank before this final deterministic sort when the
    # candidate pool requires pagination; keep this pure scorer as the final ranker.
    ranked.sort(key=lambda item: (-item[0], str(item[1].profile_id)))
    return [recommendation for _, recommendation in ranked[:effective_limit]]


def _score_objective_preferences(
    subject: RecommendationSubject,
    candidate: RecommendationSubject,
) -> tuple[float | None, list[str]]:
    criteria: list[float] = []
    reasons: list[str] = []
    preference = subject.preference
    candidate_age = calculate_age(candidate.profile.birth_date)

    if preference is not None and candidate_age is not None:
        criteria.append(float(preference.min_age <= candidate_age <= preference.max_age))

    preferred_city = preference.city if preference and preference.city else subject.profile.city
    if preferred_city and candidate.profile.city:
        city_matches = _same_text(preferred_city, candidate.profile.city)
        criteria.append(float(city_matches))
        if city_matches:
            reasons.append("mesma cidade")

    preferred_genders = preference.preferred_genders if preference else frozenset()
    if preferred_genders and candidate.profile.gender:
        criteria.append(float(_normalized(candidate.profile.gender) in preferred_genders))

    reference_interests = (
        preference.interests
        if preference and preference.interests
        else subject.profile.interests
    )
    if reference_interests:
        common = reference_interests & candidate.profile.interests
        criteria.append(
            min(
                len(common)
                / min(COMMON_INTEREST_NORMALIZATION_COUNT, len(reference_interests)),
                1.0,
            )
        )
        if common:
            reasons.append("interesses em comum")

    if not criteria:
        return None, reasons
    return sum(criteria) / len(criteria), reasons


def _score_compatibility_answers(
    subject: RecommendationSubject,
    candidate: RecommendationSubject,
    *,
    active_questions: dict[str, frozenset[str]],
) -> tuple[float | None, int, dict[str, float]]:
    mode = subject.profile.intent_mode
    relevant_questions = {
        dimension: question_keys
        for dimension, question_keys in active_questions.items()
        if get_dimension_multiplier(mode, dimension) > 0
    }
    active_question_count = sum(len(keys) for keys in relevant_questions.values())
    shared_questions_by_dimension: dict[str, set[str]] = {}
    for dimension, question_keys in relevant_questions.items():
        shared = (
            subject.compatibility.answers.get(dimension, {}).keys()
            & candidate.compatibility.answers.get(dimension, {}).keys()
            & question_keys
        )
        if shared:
            shared_questions_by_dimension[dimension] = set(shared)
    shared_question_count = sum(len(keys) for keys in shared_questions_by_dimension.values())
    coverage = (
        round(shared_question_count / active_question_count * 100)
        if active_question_count
        else 0
    )
    if not shared_questions_by_dimension:
        return None, coverage, {}

    weighted_total = 0.0
    weight_sum = 0.0
    grouped_values: dict[str, list[float]] = {}
    for dimension, question_keys in shared_questions_by_dimension.items():
        multiplier = get_dimension_multiplier(mode, dimension)
        priority_weight = subject.compatibility.priorities.get(
            dimension,
            DEFAULT_PRIORITY_WEIGHT,
        )
        weight = priority_weight * multiplier
        similarities = [
            _answer_similarity(
                subject.compatibility.answers[dimension][question_key],
                candidate.compatibility.answers[dimension][question_key],
            )
            for question_key in question_keys
        ]
        similarity = sum(similarities) / len(similarities)
        weighted_total += similarity * weight
        weight_sum += weight
        group = get_dimension_group(dimension)
        if group:
            grouped_values.setdefault(group, []).append(similarity)

    group_scores = {
        group: sum(values) / len(values)
        for group, values in grouped_values.items()
    }
    return weighted_total / weight_sum if weight_sum else None, coverage, group_scores


def _score_priority_alignment(
    subject: RecommendationSubject,
    candidate: RecommendationSubject,
) -> float | None:
    common_dimensions = (
        subject.compatibility.priorities.keys()
        & candidate.compatibility.priorities.keys()
    )
    weighted_total = 0.0
    weight_sum = 0.0
    for dimension in common_dimensions:
        multiplier = get_dimension_multiplier(subject.profile.intent_mode, dimension)
        if multiplier <= 0:
            continue
        subject_weight = subject.compatibility.priorities[dimension]
        candidate_weight = candidate.compatibility.priorities[dimension]
        similarity = 1 - (
            abs(subject_weight - candidate_weight) / PRIORITY_SIMILARITY_NORMALIZER
        )
        weight = subject_weight * multiplier
        weighted_total += similarity * weight
        weight_sum += weight
    return weighted_total / weight_sum if weight_sum else None


def _dealbreaker_penalty(
    subject: RecommendationSubject,
    candidate: RecommendationSubject,
) -> int:
    profile = get_intent_mode_profile(subject.profile.intent_mode)
    matches = 0
    rules = subject.compatibility.dealbreakers
    preferred_city = (
        subject.preference.city
        if subject.preference and subject.preference.city
        else subject.profile.city
    )

    def count_if(condition: bool) -> None:
        nonlocal matches
        if condition:
            matches += 1

    count_if("casual_only" in rules and candidate.profile.intent_mode == IntentMode.CASUAL)
    count_if(
        "long_distance" in rules
        and bool(candidate.profile.city)
        and bool(preferred_city)
        and not _same_text(candidate.profile.city, preferred_city)
    )
    count_if(
        "different_spirituality" in rules
        and _answer_difference_at_least(
            subject, candidate, "spirituality", DEALBREAKER_DIFFERENCE_THRESHOLD
        )
    )
    count_if(
        "incompatible_routine" in rules
        and (
            _answer_difference_at_least(
                subject, candidate, "routine", DEALBREAKER_DIFFERENCE_THRESHOLD
            )
            or _answer_difference_at_least(
                subject, candidate, "lifestyle", DEALBREAKER_DIFFERENCE_THRESHOLD
            )
        )
    )
    count_if(
        "poor_communication" in rules
        and (
            _answer_difference_at_least(
                subject,
                candidate,
                "communication_frequency",
                DEALBREAKER_DIFFERENCE_THRESHOLD,
            )
            or _answer_difference_at_least(
                subject,
                candidate,
                "conflict_resolution",
                DEALBREAKER_DIFFERENCE_THRESHOLD,
            )
        )
    )
    count_if(
        bool(
            {"wants_children_incompatible", "does_not_want_children_incompatible"}
            & rules
        )
        and _answer_difference_at_least(
            subject, candidate, "children", DEALBREAKER_DIFFERENCE_THRESHOLD
        )
    )
    return min(matches * profile.dealbreaker_penalty, profile.dealbreaker_penalty_cap)


def _build_reason_groups(
    *,
    mode_alignment: float,
    objective_reasons: list[str],
    group_scores: dict[str, float],
    priority_score: float | None,
) -> dict[str, tuple[str, ...]]:
    groups: dict[str, tuple[str, ...]] = {}
    if mode_alignment == 1:
        groups["intent"] = ("objetivos de relacionamento alinhados",)
    if objective_reasons:
        groups["preferences"] = tuple(_unique(objective_reasons))
    if group_scores.get("future", 0) >= REASON_SCORE_THRESHOLD:
        groups["future"] = ("valores de futuro parecidos",)
    if group_scores.get("communication", 0) >= REASON_SCORE_THRESHOLD:
        groups["communication"] = ("boa compatibilidade de comunicação",)
    if group_scores.get("lifestyle", 0) >= REASON_SCORE_THRESHOLD:
        groups["lifestyle"] = ("estilo de vida compatível",)
    if group_scores.get("personality", 0) >= REASON_SCORE_THRESHOLD:
        groups["personality"] = ("formas de viver e se expressar compatíveis",)
    if priority_score is not None and priority_score >= REASON_SCORE_THRESHOLD:
        groups["priorities"] = ("prioridades importantes em comum",)
    return groups


def _build_breakdown(
    a_to_b: DirectionalScore,
    _b_to_a: DirectionalScore,
) -> RecommendationScoreBreakdownRead:
    def metric(key: str) -> DirectionalMetricRead:
        return DirectionalMetricRead(
            score_a_to_b=a_to_b.components.get(key),
            score_b_to_a=None,
        )

    return RecommendationScoreBreakdownRead(
        mode_alignment=metric("mode_alignment"),
        objective_preferences=metric("objective_preferences"),
        compatibility_answers=metric("compatibility_answers"),
        priorities=metric("priorities"),
        dealbreaker_penalty=DirectionalMetricRead(
            score_a_to_b=a_to_b.components.get("dealbreaker_penalty"),
            score_b_to_a=None,
        ),
        mode_penalty=metric("mode_penalty"),
    )


def _merge_reason_groups(
    left: dict[str, tuple[str, ...]],
    right: dict[str, tuple[str, ...]],
) -> list[RecommendationReasonGroupRead]:
    categories = list(dict.fromkeys([*left.keys(), *right.keys()]))
    return [
        RecommendationReasonGroupRead(
            category=category,
            reasons=_unique([*left.get(category, ()), *right.get(category, ())]),
        )
        for category in categories
    ]


def _to_subject(
    profile: Profile,
    preference: Preference | None,
    answers_by_user: dict[UUID, dict[str, dict[str, int]]],
    priorities_by_user: dict[UUID, dict[str, int]],
    dealbreakers_by_user: dict[UUID, set[str]],
) -> RecommendationSubject:
    profile_snapshot = ProfileSnapshot(
        profile_id=profile.id,
        user_id=profile.user_id,
        display_name=profile.display_name,
        bio=profile.bio,
        birth_date=profile.birth_date,
        gender=profile.gender,
        city=profile.city,
        intention=profile.intention,
        intent_mode=profile.intent_mode,
        interests=frozenset(interest.name for interest in profile.interests),
    )
    preference_snapshot = None
    if preference is not None:
        preference_snapshot = PreferenceSnapshot(
            min_age=preference.min_age,
            max_age=preference.max_age,
            city=preference.city,
            preferred_genders=frozenset(
                _normalized(gender) for gender in preference.preferred_genders
            ),
            interests=frozenset(interest.name for interest in preference.interests),
        )
    return RecommendationSubject(
        profile=profile_snapshot,
        preference=preference_snapshot,
        compatibility=CompatibilitySnapshot(
            answers=answers_by_user.get(profile.user_id, {}),
            priorities=priorities_by_user.get(profile.user_id, {}),
            dealbreakers=frozenset(dealbreakers_by_user.get(profile.user_id, set())),
        ),
    )


def _answer_similarity(left: int, right: int) -> float:
    difference = abs(left - right)
    return ANSWER_SIMILARITY_BY_DIFFERENCE.get(difference, ANSWER_SIMILARITY_FLOOR)


def _answer_difference_at_least(
    subject: RecommendationSubject,
    candidate: RecommendationSubject,
    dimension: str,
    threshold: int,
) -> bool:
    subject_answers = subject.compatibility.answers.get(dimension, {})
    candidate_answers = candidate.compatibility.answers.get(dimension, {})
    shared_question_keys = subject_answers.keys() & candidate_answers.keys()
    return any(
        abs(subject_answers[key] - candidate_answers[key]) >= threshold
        for key in shared_question_keys
    )


def _answers_by_user(answers) -> dict[UUID, dict[str, dict[str, int]]]:
    grouped: dict[UUID, dict[str, dict[str, int]]] = {}
    for answer in answers:
        grouped.setdefault(answer.user_id, {}).setdefault(answer.dimension, {})[
            answer.question_key
        ] = answer.answer_value
    return grouped


def _active_questions_by_dimension(questions) -> dict[str, frozenset[str]]:
    grouped: dict[str, set[str]] = {}
    for question in questions:
        grouped.setdefault(question.dimension, set()).add(question.key)
    return {dimension: frozenset(keys) for dimension, keys in grouped.items()}


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


def _normalized(value: str) -> str:
    return value.strip().lower()


def _same_text(left: str | None, right: str | None) -> bool:
    return bool(left and right and _normalized(left) == _normalized(right))


def _unique(values) -> list[str]:
    return list(dict.fromkeys(values))
