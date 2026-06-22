from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class IntentMode(str, Enum):
    SERIOUS = "SERIOUS"
    EXPLORING = "EXPLORING"
    CASUAL = "CASUAL"


CONFIDENCE_BASE_FACTOR = 0.70
CONFIDENCE_COVERAGE_FACTOR = 0.30
ANSWER_SIMILARITY_BY_DIFFERENCE: dict[int, float] = {
    0: 1.0,
    1: 0.75,
    2: 0.5,
}
ANSWER_SIMILARITY_FLOOR = 0.2
DEFAULT_PRIORITY_WEIGHT = 3
REASON_SCORE_THRESHOLD = 0.7
DEALBREAKER_DIFFERENCE_THRESHOLD = 3
COMMON_INTEREST_NORMALIZATION_COUNT = 3
PRIORITY_SIMILARITY_NORMALIZER = 4
MAX_RECOMMENDATION_REASONS = 5


@dataclass(frozen=True)
class ComponentWeights:
    mode_alignment: int
    objective_preferences: int
    compatibility_answers: int
    priorities: int


@dataclass(frozen=True)
class IntentModeProfile:
    minimum_score: int
    default_limit: int
    maximum_limit: int
    component_weights: ComponentWeights
    dimension_multipliers: dict[str, float]
    dealbreaker_penalty: int
    dealbreaker_penalty_cap: int


DIMENSION_GROUPS: dict[str, str] = {
    "family": "future",
    "ambition": "future",
    "stability": "future",
    "spirituality": "future",
    "future_plans": "future",
    "money": "future",
    "children": "future",
    "communication_frequency": "communication",
    "conflict_resolution": "communication",
    "affection": "communication",
    "personal_space": "communication",
    "jealousy": "communication",
    "relationship_pace": "communication",
    "social_life": "lifestyle",
    "privacy": "lifestyle",
    "lifestyle": "lifestyle",
    "routine": "lifestyle",
    "nightlife": "lifestyle",
    "fitness": "lifestyle",
    "travel": "lifestyle",
    "openness": "personality",
    "conscientiousness": "personality",
    "extraversion": "personality",
    "agreeableness": "personality",
    "emotional_stability": "personality",
}


INTENT_MODE_PROFILES: dict[IntentMode, IntentModeProfile] = {
    IntentMode.SERIOUS: IntentModeProfile(
        minimum_score=55,
        default_limit=10,
        maximum_limit=10,
        component_weights=ComponentWeights(20, 20, 40, 20),
        dimension_multipliers={
            "future": 1.4,
            "communication": 1.3,
            "lifestyle": 0.8,
            "personality": 0.8,
        },
        dealbreaker_penalty=25,
        dealbreaker_penalty_cap=50,
    ),
    IntentMode.EXPLORING: IntentModeProfile(
        minimum_score=45,
        default_limit=25,
        maximum_limit=25,
        component_weights=ComponentWeights(15, 40, 35, 10),
        dimension_multipliers={
            "future": 0.25,
            "communication": 1.0,
            "lifestyle": 1.4,
            "personality": 1.2,
        },
        dealbreaker_penalty=20,
        dealbreaker_penalty_cap=40,
    ),
    IntentMode.CASUAL: IntentModeProfile(
        minimum_score=40,
        default_limit=40,
        maximum_limit=40,
        component_weights=ComponentWeights(15, 50, 30, 5),
        dimension_multipliers={
            "future": 0.0,
            "communication": 0.6,
            "lifestyle": 1.5,
            "personality": 1.0,
        },
        dealbreaker_penalty=15,
        dealbreaker_penalty_cap=30,
    ),
}


LEGACY_INTENTION_BY_MODE: dict[IntentMode, str] = {
    IntentMode.SERIOUS: "serious",
    IntentMode.EXPLORING: "exploring",
    IntentMode.CASUAL: "casual",
}
MODE_BY_LEGACY_INTENTION = {
    legacy: mode for mode, legacy in LEGACY_INTENTION_BY_MODE.items()
}


MODE_ALIGNMENT: dict[tuple[IntentMode, IntentMode], float] = {
    (left, right): (
        1.0
        if left == right
        else 0.6
        if IntentMode.EXPLORING in {left, right}
        else 0.0
    )
    for left in IntentMode
    for right in IntentMode
}

MODE_PAIR_PENALTIES: dict[tuple[IntentMode, IntentMode], int] = {
    (left, right): (
        10
        if {left, right} == {IntentMode.SERIOUS, IntentMode.CASUAL}
        else 0
    )
    for left in IntentMode
    for right in IntentMode
}


def mode_from_legacy_intention(value: str | None) -> IntentMode:
    if not value:
        return IntentMode.SERIOUS
    return MODE_BY_LEGACY_INTENTION.get(value.strip().lower(), IntentMode.SERIOUS)


def legacy_intention_for_mode(mode: IntentMode) -> str:
    return LEGACY_INTENTION_BY_MODE[mode]


def get_intent_mode_profile(mode: IntentMode) -> IntentModeProfile:
    return INTENT_MODE_PROFILES[mode]


def get_dimension_group(dimension: str) -> str | None:
    return DIMENSION_GROUPS.get(dimension)


def get_dimension_multiplier(mode: IntentMode, dimension: str) -> float:
    group = get_dimension_group(dimension)
    if group is None:
        return 1.0
    return INTENT_MODE_PROFILES[mode].dimension_multipliers[group]


def get_mode_alignment(left: IntentMode, right: IntentMode) -> float:
    return MODE_ALIGNMENT[(left, right)]


def get_mode_pair_penalty(left: IntentMode, right: IntentMode) -> int:
    return MODE_PAIR_PENALTIES[(left, right)]
