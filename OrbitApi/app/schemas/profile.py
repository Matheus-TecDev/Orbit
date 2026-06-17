from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


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


class ProfileBase(BaseModel):
    display_name: str = Field(min_length=2, max_length=80)
    bio: str | None = Field(default=None, max_length=1000)
    birth_date: date | None = None
    gender: str | None = Field(default=None, max_length=40)
    city: str | None = Field(default=None, max_length=120)
    country: str | None = Field(default=None, max_length=120)
    intention: str | None = Field(default=None, max_length=80)
    photo_url: str | None = Field(default=None, max_length=500)
    is_visible: bool = True
    interests: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("interests")
    @classmethod
    def normalize_interests(cls, value: list[str]) -> list[str]:
        return normalize_interest_names(value) or []


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
    photo_url: str | None = Field(default=None, max_length=500)
    is_visible: bool | None = None
    interests: list[str] | None = Field(default=None, max_length=20)

    @field_validator("interests")
    @classmethod
    def normalize_interests(cls, value: list[str] | None) -> list[str] | None:
        return normalize_interest_names(value)


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
    photo_url: str | None
    is_visible: bool
    interests: list[str]
    created_at: datetime
    updated_at: datetime
