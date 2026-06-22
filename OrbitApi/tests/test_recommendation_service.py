from datetime import date
from types import SimpleNamespace
from uuid import UUID, uuid4

from app.core.intent_mode_config import IntentMode
from app.models.preference import Preference
from app.models.profile import Profile
from app.services import recommendation_service
from app.services.recommendation_service import (
    CompatibilitySnapshot,
    DirectionalScore,
    PreferenceSnapshot,
    ProfileSnapshot,
    RecommendationSubject,
    _build_breakdown,
    calculate_directional_score,
)


def make_subject(
    mode: IntentMode,
    *,
    gender: str = "feminino",
    city: str = "Fortaleza",
    age_year: int = 1995,
    answers: dict[str, int | dict[str, int]] | None = None,
    priorities: dict[str, int] | None = None,
    dealbreakers: frozenset[str] = frozenset(),
    min_age: int = 18,
    max_age: int = 85,
    preferred_genders: frozenset[str] = frozenset({"feminino"}),
) -> RecommendationSubject:
    normalized_answers: dict[str, dict[str, int]] = {}
    for dimension, value in (answers or {}).items():
        normalized_answers[dimension] = (
            value if isinstance(value, dict) else {dimension: value}
        )
    return RecommendationSubject(
        profile=ProfileSnapshot(
            profile_id=uuid4(),
            user_id=uuid4(),
            display_name="Pessoa",
            bio=None,
            birth_date=date(age_year, 1, 1),
            gender=gender,
            city=city,
            intention=mode.value.lower(),
            intent_mode=mode,
            interests=frozenset({"cinema", "cafe"}),
        ),
        preference=PreferenceSnapshot(
            min_age=min_age,
            max_age=max_age,
            city="Fortaleza",
            preferred_genders=preferred_genders,
            interests=frozenset({"cinema", "cafe"}),
        ),
        compatibility=CompatibilitySnapshot(
            answers=normalized_answers,
            priorities=priorities or {},
            dealbreakers=dealbreakers,
        ),
    )


def active_questions(**dimensions: tuple[str, ...]) -> dict[str, frozenset[str]]:
    return {
        dimension: frozenset(question_keys)
        for dimension, question_keys in dimensions.items()
    }


def test_mutual_score_uses_the_weaker_direction() -> None:
    left = make_subject(
        IntentMode.SERIOUS,
        answers={"future_plans": 5, "communication_frequency": 4},
        priorities={"future_plans": 5},
    )
    right = make_subject(
        IntentMode.SERIOUS,
        answers={"future_plans": 5, "communication_frequency": 4},
        priorities={"future_plans": 3},
        min_age=80,
        max_age=85,
    )
    active = active_questions(
        future_plans=("future_plans",),
        communication_frequency=("communication_frequency",),
    )

    a_to_b = calculate_directional_score(left, right, active_questions=active)
    b_to_a = calculate_directional_score(right, left, active_questions=active)

    assert a_to_b.score != b_to_a.score
    assert min(a_to_b.score, b_to_a.score) == b_to_a.score


def test_empty_preferred_genders_does_not_score_gender() -> None:
    subject = make_subject(IntentMode.EXPLORING, preferred_genders=frozenset())
    same_gender = make_subject(IntentMode.EXPLORING, gender="feminino")
    different_gender = make_subject(IntentMode.EXPLORING, gender="masculino")

    same_score = calculate_directional_score(
        subject,
        same_gender,
        active_questions={},
    )
    different_score = calculate_directional_score(
        subject,
        different_gender,
        active_questions={},
    )

    assert same_score.score == different_score.score
    assert (
        same_score.components["objective_preferences"]
        == different_score.components["objective_preferences"]
    )


def test_coverage_partial_none_and_inactive_questions() -> None:
    complete = make_subject(
        IntentMode.SERIOUS,
        answers={"communication": {"q1": 5, "q2": 3}},
    )
    partial = make_subject(
        IntentMode.SERIOUS,
        answers={"communication": {"q1": 5}},
    )
    empty = make_subject(IntentMode.SERIOUS)
    active = active_questions(communication=("q1", "q2"))

    partial_result = calculate_directional_score(
        complete,
        partial,
        active_questions=active,
    )
    empty_result = calculate_directional_score(
        complete,
        empty,
        active_questions=active,
    )
    inactive_result = calculate_directional_score(
        complete,
        partial,
        active_questions={},
    )

    assert partial_result.coverage == 50
    assert empty_result.coverage == 0
    assert empty_result.components["compatibility_answers"] is None
    assert inactive_result.coverage == 0
    assert inactive_result.components["compatibility_answers"] is None


def test_multiple_questions_in_same_dimension_are_aggregated() -> None:
    left = make_subject(
        IntentMode.SERIOUS,
        answers={"communication": {"q1": 5, "q2": 1}},
    )
    right = make_subject(
        IntentMode.SERIOUS,
        answers={"communication": {"q1": 5, "q2": 5}},
    )

    result = calculate_directional_score(
        left,
        right,
        active_questions=active_questions(communication=("q1", "q2")),
    )

    assert result.coverage == 100
    assert result.components["compatibility_answers"] == 60


def test_sensitive_answers_never_generate_explicit_reasons() -> None:
    left = make_subject(IntentMode.SERIOUS, answers={"children": 5})
    right = make_subject(IntentMode.SERIOUS, answers={"children": 5})

    result = calculate_directional_score(
        left,
        right,
        active_questions=active_questions(children=("children",)),
    )
    rendered_reasons = " ".join(result.reasons).lower()

    assert "filho" not in rendered_reasons
    assert "dinheiro" not in rendered_reasons
    assert "espiritual" not in rendered_reasons
    assert "valores de futuro parecidos" in result.reasons


def test_breakdown_hides_reverse_dealbreaker_penalty() -> None:
    left = DirectionalScore(
        score=60,
        coverage=50,
        components={"dealbreaker_penalty": 25},
        reasons=(),
        reason_groups={},
    )
    right = DirectionalScore(
        score=40,
        coverage=50,
        components={"dealbreaker_penalty": 40},
        reasons=(),
        reason_groups={},
    )

    breakdown = _build_breakdown(left, right)

    assert breakdown.dealbreaker_penalty.score_a_to_b == 25
    assert breakdown.dealbreaker_penalty.score_b_to_a is None
    for metric in (
        breakdown.mode_alignment,
        breakdown.objective_preferences,
        breakdown.compatibility_answers,
        breakdown.priorities,
        breakdown.dealbreaker_penalty,
        breakdown.mode_penalty,
    ):
        assert metric.score_b_to_a is None


def test_equal_scores_use_profile_id_as_stable_tiebreaker(monkeypatch) -> None:
    current_user_id = uuid4()
    current_profile = model_profile(current_user_id, IntentMode.SERIOUS, "Atual")
    first_profile = model_profile(
        uuid4(), IntentMode.SERIOUS, "Primeiro", profile_id=UUID(int=1)
    )
    second_profile = model_profile(
        uuid4(), IntentMode.SERIOUS, "Segundo", profile_id=UUID(int=2)
    )
    current_preference = model_preference(current_user_id)
    preferences = [
        model_preference(first_profile.user_id),
        model_preference(second_profile.user_id),
    ]
    mock_recommendation_repositories(
        monkeypatch,
        current_profile=current_profile,
        current_preference=current_preference,
        candidates=[second_profile, first_profile],
        preferences=preferences,
    )

    recommendations = recommendation_service.get_recommendations(
        SimpleNamespace(),
        current_user=SimpleNamespace(id=current_user_id),
    )

    assert [item.profile_id for item in recommendations] == [UUID(int=1), UUID(int=2)]


def test_recommendations_return_partial_real_contract(monkeypatch) -> None:
    current_user_id = uuid4()
    relevant_user_id = uuid4()
    irrelevant_user_id = uuid4()
    current_profile = model_profile(current_user_id, IntentMode.SERIOUS, "Atual")
    relevant_profile = model_profile(relevant_user_id, IntentMode.SERIOUS, "Relevante")
    irrelevant_profile = model_profile(irrelevant_user_id, IntentMode.CASUAL, "Irrelevante")
    current_preference = model_preference(current_user_id)
    preferences = [
        model_preference(relevant_user_id),
        model_preference(irrelevant_user_id),
    ]
    mock_recommendation_repositories(
        monkeypatch,
        current_profile=current_profile,
        current_preference=current_preference,
        candidates=[relevant_profile, irrelevant_profile],
        preferences=preferences,
    )

    recommendations = recommendation_service.get_recommendations(
        SimpleNamespace(),
        current_user=SimpleNamespace(id=current_user_id),
        limit=999,
    )

    assert len(recommendations) == 1
    result = recommendations[0]
    assert result.display_name == "Relevante"
    assert result.score == result.mutual_score
    assert result.intent_mode == IntentMode.SERIOUS
    assert result.score_breakdown is not None


def mock_recommendation_repositories(
    monkeypatch,
    *,
    current_profile: Profile,
    current_preference: Preference,
    candidates: list[Profile],
    preferences: list[Preference],
) -> None:
    monkeypatch.setattr(recommendation_service, "get_profile_by_user_id", lambda *_: current_profile)
    monkeypatch.setattr(recommendation_service, "get_preference_by_user_id", lambda *_: current_preference)
    monkeypatch.setattr(recommendation_service, "list_acted_profile_ids", lambda *_args, **_kwargs: set())
    monkeypatch.setattr(recommendation_service, "list_visible_profiles", lambda *_args, **_kwargs: candidates)
    monkeypatch.setattr(recommendation_service, "list_preferences_by_user_ids", lambda *_args, **_kwargs: preferences)
    monkeypatch.setattr(recommendation_service, "list_answers_by_user_ids", lambda *_: [])
    monkeypatch.setattr(recommendation_service, "list_priorities_by_user_ids", lambda *_: [])
    monkeypatch.setattr(recommendation_service, "list_dealbreakers_by_user_ids", lambda *_: [])
    monkeypatch.setattr(recommendation_service, "list_active_questions", lambda *_: [])


def model_profile(
    user_id,
    mode: IntentMode,
    name: str,
    *,
    profile_id=None,
) -> Profile:
    profile = Profile(
        id=profile_id or uuid4(),
        user_id=user_id,
        display_name=name,
        birth_date=date(1995, 1, 1),
        gender="feminino",
        city="Fortaleza",
        intention=mode.value.lower(),
        intent_mode=mode,
        is_visible=True,
    )
    profile.interests = []
    return profile


def model_preference(user_id) -> Preference:
    preference = Preference(
        id=uuid4(),
        user_id=user_id,
        min_age=18,
        max_age=85,
        max_distance_km=100,
        city="Fortaleza",
        gender="masculino",
        preferred_genders=[],
        intention="serious",
    )
    preference.interests = []
    return preference
