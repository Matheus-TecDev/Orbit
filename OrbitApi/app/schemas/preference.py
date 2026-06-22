from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.intent_mode_config import legacy_intention_for_mode, mode_from_legacy_intention
from app.schemas.profile import normalize_interest_names, normalize_intention


class PreferenceBase(BaseModel):
    min_age: int = Field(default=18, ge=18, le=120)
    max_age: int = Field(default=85, ge=18, le=85)
    max_distance_km: int = Field(default=100, ge=1, le=20000)
    city: str | None = Field(default=None, max_length=120)
    gender: str | None = Field(default=None, max_length=40)
    preferred_genders: list[str] = Field(default_factory=list, max_length=4)
    intention: str | None = Field(default=None, max_length=80)
    interests: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("interests")
    @classmethod
    def normalize_interests(cls, value: list[str]) -> list[str]:
        return normalize_interest_names(value) or []

    @field_validator("preferred_genders")
    @classmethod
    def normalize_preferred_genders(cls, value: list[str]) -> list[str]:
        return normalize_interest_names(value) or []

    @field_validator("intention")
    @classmethod
    def validate_intention(cls, value: str | None) -> str | None:
        return normalize_intention(value)

    @model_validator(mode="after")
    def validate_age_range(self) -> "PreferenceBase":
        if self.max_age < self.min_age:
            raise ValueError("max_age must be greater than or equal to min_age")
        return self


class PreferenceCreate(PreferenceBase):
    pass


class PreferenceUpdate(BaseModel):
    min_age: int | None = Field(default=None, ge=18, le=120)
    max_age: int | None = Field(default=None, ge=18, le=85)
    max_distance_km: int | None = Field(default=None, ge=1, le=20000)
    city: str | None = Field(default=None, max_length=120)
    gender: str | None = Field(default=None, max_length=40)
    preferred_genders: list[str] | None = Field(default=None, max_length=4)
    intention: str | None = Field(default=None, max_length=80)
    interests: list[str] | None = Field(default=None, max_length=20)

    @field_validator("interests")
    @classmethod
    def normalize_interests(cls, value: list[str] | None) -> list[str] | None:
        return normalize_interest_names(value)

    @field_validator("preferred_genders")
    @classmethod
    def normalize_preferred_genders(cls, value: list[str] | None) -> list[str] | None:
        return normalize_interest_names(value)

    @field_validator("intention")
    @classmethod
    def validate_intention(cls, value: str | None) -> str | None:
        return normalize_intention(value)

    @model_validator(mode="after")
    def validate_age_range(self) -> "PreferenceUpdate":
        if self.min_age is not None and self.max_age is not None and self.max_age < self.min_age:
            raise ValueError("max_age must be greater than or equal to min_age")
        if "intention" in self.model_fields_set:
            self.intention = legacy_intention_for_mode(mode_from_legacy_intention(self.intention))
        return self


class PreferenceRead(BaseModel):
    id: UUID
    user_id: UUID
    min_age: int
    max_age: int
    max_distance_km: int
    city: str | None
    gender: str | None
    preferred_genders: list[str]
    intention: str | None
    interests: list[str]
    created_at: datetime
    updated_at: datetime
