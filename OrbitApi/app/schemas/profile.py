from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.intent_mode_config import (
    IntentMode,
    legacy_intention_for_mode,
    mode_from_legacy_intention,
)

DATING_INTENTIONS = {"serious", "casual", "exploring"}


def normalize_interest_names(value: list[str] | None) -> list[str] | None:
    if value is None:
        return None
    seen: set[str] = set()
    normalized: list[str] = []
    for item in value:
        name = item.strip().lower()
        if name and name not in seen:
            normalized.append(name)
            seen.add(name)
    return normalized


def normalize_intention(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip().lower()
    if normalized in DATING_INTENTIONS:
        return normalized

    raise ValueError("intention must be one of: serious, casual, exploring")


class ProfileBase(BaseModel):
    display_name: str = Field(min_length=2, max_length=80)
    bio: str | None = Field(default=None, max_length=1000)
    birth_date: date | None = None
    gender: str | None = Field(default=None, max_length=40)
    city: str | None = Field(default=None, max_length=120)
    country: str | None = Field(default=None, max_length=120)
    intention: str | None = Field(default=None, max_length=80)
    intent_mode: IntentMode | None = None
    photo_url: str | None = Field(default=None, max_length=500)
    is_visible: bool = True
    interests: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("interests")
    @classmethod
    def normalize_interests(cls, value: list[str]) -> list[str]:
        return normalize_interest_names(value) or []

    @field_validator("intention")
    @classmethod
    def validate_intention(cls, value: str | None) -> str | None:
        return normalize_intention(value)

    @model_validator(mode="after")
    def synchronize_intent_mode(self) -> "ProfileBase":
        mode_was_sent = "intent_mode" in self.model_fields_set
        intention_was_sent = "intention" in self.model_fields_set
        mode = self.intent_mode if self.intent_mode is not None else IntentMode.SERIOUS
        legacy_mode = mode_from_legacy_intention(self.intention)
        if mode_was_sent and intention_was_sent and mode != legacy_mode:
            raise ValueError("intent_mode and intention must represent the same intent")
        if not mode_was_sent and intention_was_sent:
            mode = legacy_mode
        self.intent_mode = mode
        self.intention = legacy_intention_for_mode(mode)
        return self


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=80)
    bio: str | None = Field(default=None, max_length=1000)
    birth_date: date | None = None
    gender: str | None = Field(default=None, max_length=40)
    city: str | None = Field(default=None, max_length=120)
    country: str | None = Field(default=None, max_length=120)
    intention: str | None = Field(default=None, max_length=80)
    intent_mode: IntentMode | None = None
    photo_url: str | None = Field(default=None, max_length=500)
    is_visible: bool | None = None
    interests: list[str] | None = Field(default=None, max_length=20)

    @field_validator("interests")
    @classmethod
    def normalize_interests(cls, value: list[str] | None) -> list[str] | None:
        return normalize_interest_names(value)

    @field_validator("intention")
    @classmethod
    def validate_intention(cls, value: str | None) -> str | None:
        return normalize_intention(value)

    @model_validator(mode="after")
    def synchronize_intent_mode(self) -> "ProfileUpdate":
        mode_was_sent = "intent_mode" in self.model_fields_set
        intention_was_sent = "intention" in self.model_fields_set
        if not mode_was_sent and not intention_was_sent:
            return self

        mode = self.intent_mode if self.intent_mode is not None else IntentMode.SERIOUS
        legacy_mode = mode_from_legacy_intention(self.intention)
        if mode_was_sent and intention_was_sent and mode != legacy_mode:
            raise ValueError("intent_mode and intention must represent the same intent")
        if not mode_was_sent:
            mode = legacy_mode
        self.intent_mode = mode
        self.intention = legacy_intention_for_mode(mode)
        return self


class ProfileRead(BaseModel):
    id: UUID
    user_id: UUID
    display_name: str
    bio: str | None
    birth_date: date | None
    gender: str | None
    city: str | None
    country: str | None
    intention: str | None
    intent_mode: IntentMode
    photo_url: str | None
    is_visible: bool
    interests: list[str]
    created_at: datetime
    updated_at: datetime
