from datetime import date
from uuid import UUID

from pydantic import BaseModel

from app.core.intent_mode_config import IntentMode


class ParticipantSummary(BaseModel):
    user_id: UUID
    profile_id: UUID | None
    name: str
    age: int | None
    city: str | None
    short_bio: str | None
    intent_mode: IntentMode | None
    interests: list[str]
    photo_url: str | None


def calculate_age(birth_date: date | None) -> int | None:
    if birth_date is None:
        return None

    today = date.today()
    age = today.year - birth_date.year
    has_not_had_birthday = (today.month, today.day) < (birth_date.month, birth_date.day)
    return age - 1 if has_not_had_birthday else age


def summarize_bio(bio: str | None, *, max_length: int = 120) -> str | None:
    if bio is None:
        return None

    normalized = " ".join(bio.split())
    if not normalized:
        return None

    if len(normalized) <= max_length:
        return normalized

    return f"{normalized[: max_length - 3].rstrip()}..."
