import pytest

from app.core.intent_mode_config import (
    IntentMode,
    MAX_RECOMMENDATION_REASONS,
    PRIORITY_SIMILARITY_NORMALIZER,
    get_intent_mode_profile,
    get_mode_pair_penalty,
    legacy_intention_for_mode,
    mode_from_legacy_intention,
)
from app.schemas.profile import ProfileCreate, ProfileUpdate
from app.services.recommendation_service import (
    is_recommendation_relevant,
    resolve_recommendation_limit,
)


@pytest.mark.parametrize(
    ("legacy", "mode"),
    [
        ("serious", IntentMode.SERIOUS),
        ("exploring", IntentMode.EXPLORING),
        ("casual", IntentMode.CASUAL),
        (None, IntentMode.SERIOUS),
    ],
)
def test_legacy_intention_mapping(legacy, mode) -> None:
    assert mode_from_legacy_intention(legacy) == mode
    if legacy is not None:
        assert legacy_intention_for_mode(mode) == legacy


def test_profile_schema_synchronizes_canonical_and_legacy_values() -> None:
    created = ProfileCreate(display_name="Teste", intention="exploring")
    updated = ProfileUpdate(intent_mode=IntentMode.CASUAL)

    assert created.intent_mode == IntentMode.EXPLORING
    assert created.intention == "exploring"
    assert updated.intent_mode == IntentMode.CASUAL
    assert updated.intention == "casual"


@pytest.mark.parametrize(
    ("mode", "minimum", "maximum"),
    [
        (IntentMode.SERIOUS, 55, 10),
        (IntentMode.EXPLORING, 45, 25),
        (IntentMode.CASUAL, 40, 40),
    ],
)
def test_mode_limits_and_minimum_scores(mode, minimum, maximum) -> None:
    profile = get_intent_mode_profile(mode)

    assert profile.minimum_score == minimum
    assert resolve_recommendation_limit(mode, None) == maximum
    assert resolve_recommendation_limit(mode, maximum) == maximum
    assert resolve_recommendation_limit(mode, maximum + 100) == maximum
    assert not is_recommendation_relevant(mode, minimum - 1)
    assert is_recommendation_relevant(mode, minimum)


def test_zero_recommendation_limit_is_rejected() -> None:
    with pytest.raises(ValueError, match="greater than zero"):
        resolve_recommendation_limit(IntentMode.SERIOUS, 0)


def test_null_and_conflicting_profile_intents() -> None:
    assert ProfileUpdate(intention=None).intent_mode == IntentMode.SERIOUS
    assert ProfileUpdate(intent_mode=None).intent_mode == IntentMode.SERIOUS
    with pytest.raises(ValueError, match="same intent"):
        ProfileUpdate(intent_mode=IntentMode.CASUAL, intention="serious")


def test_serious_casual_penalty_is_moderate() -> None:
    assert get_mode_pair_penalty(IntentMode.SERIOUS, IntentMode.CASUAL) == 10
    assert get_mode_pair_penalty(IntentMode.CASUAL, IntentMode.SERIOUS) == 10


def test_remaining_recommendation_calibration_is_centralized() -> None:
    assert PRIORITY_SIMILARITY_NORMALIZER == 4
    assert MAX_RECOMMENDATION_REASONS == 5
