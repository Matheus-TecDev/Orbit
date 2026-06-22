from uuid import UUID

from app.models.chat import Chat
from app.models.match import Match
from app.models.preference import Preference
from app.models.profile import Profile
from app.schemas.chat import ChatRead
from app.schemas.match import MatchRead
from app.schemas.preference import PreferenceRead
from app.schemas.profile import ProfileRead


def profile_to_read(profile: Profile) -> ProfileRead:
    return ProfileRead(
        id=profile.id,
        user_id=profile.user_id,
        display_name=profile.display_name,
        bio=profile.bio,
        birth_date=profile.birth_date,
        gender=profile.gender,
        city=profile.city,
        country=profile.country,
        intention=profile.intention,
        intent_mode=profile.intent_mode,
        photo_url=profile.photo_url,
        is_visible=profile.is_visible,
        interests=[interest.name for interest in profile.interests],
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


def preference_to_read(preference: Preference) -> PreferenceRead:
    return PreferenceRead(
        id=preference.id,
        user_id=preference.user_id,
        min_age=preference.min_age,
        max_age=preference.max_age,
        max_distance_km=preference.max_distance_km,
        city=preference.city,
        gender=preference.gender,
        preferred_genders=preference.preferred_genders,
        intention=preference.intention,
        interests=[interest.name for interest in preference.interests],
        created_at=preference.created_at,
        updated_at=preference.updated_at,
    )


def match_to_read(match: Match, *, chat_id: UUID | None = None) -> MatchRead:
    resolved_chat_id = chat_id
    if resolved_chat_id is None and match.chat is not None:
        resolved_chat_id = match.chat.id

    return MatchRead(
        id=match.id,
        status=match.status,
        target_profile=profile_to_read(match.target_profile),
        chat_id=resolved_chat_id,
        created_at=match.created_at,
        updated_at=match.updated_at,
    )


def chat_to_read(chat: Chat) -> ChatRead:
    last_message = chat.messages[-1].content if chat.messages else None
    return ChatRead(
        id=chat.id,
        match_id=chat.match_id,
        participant_ids=[participant.id for participant in chat.participants],
        last_message=last_message,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
    )
