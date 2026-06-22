from uuid import UUID

from sqlalchemy.orm import Session

from app.core.intent_mode_config import legacy_intention_for_mode, mode_from_legacy_intention
from app.models.preference import Preference
from app.models.profile import Profile
from app.repositories.preference_repository import (
    create_preference,
    get_preference_by_user_id,
    update_preference,
)
from app.repositories.profile_repository import (
    create_profile,
    get_profile_by_user_id,
    update_profile,
)
from app.schemas.preference import PreferenceCreate, PreferenceUpdate
from app.schemas.profile import ProfileCreate, ProfileUpdate


def create_profile_with_intent_sync(
    db: Session,
    *,
    user_id: UUID,
    data: ProfileCreate,
) -> Profile:
    try:
        profile = create_profile(db, user_id=user_id, data=data, commit=False)
        synchronize_preference_from_profile(db, profile)
        db.commit()
        db.refresh(profile)
        return profile
    except Exception:
        db.rollback()
        raise


def update_profile_with_intent_sync(
    db: Session,
    *,
    profile: Profile,
    data: ProfileUpdate,
) -> Profile:
    try:
        updated = update_profile(db, profile=profile, data=data, commit=False)
        synchronize_preference_from_profile(db, updated)
        db.commit()
        db.refresh(updated)
        return updated
    except Exception:
        db.rollback()
        raise


def create_preference_with_intent_sync(
    db: Session,
    *,
    user_id: UUID,
    data: PreferenceCreate,
) -> Preference:
    try:
        preference = create_preference(db, user_id=user_id, data=data, commit=False)
        profile = get_profile_by_user_id(db, user_id)
        if profile is None:
            preference.intention = legacy_intention_for_mode(
                mode_from_legacy_intention(preference.intention)
            )
        elif "intention" not in data.model_fields_set:
            preference.intention = legacy_intention_for_mode(profile.intent_mode)
            db.add(preference)
        else:
            synchronize_profile_from_preference(db, preference, profile=profile)
        db.commit()
        db.refresh(preference)
        return preference
    except Exception:
        db.rollback()
        raise


def update_preference_with_intent_sync(
    db: Session,
    *,
    preference: Preference,
    data: PreferenceUpdate,
) -> Preference:
    try:
        updated = update_preference(db, preference=preference, data=data, commit=False)
        synchronize_profile_from_preference(db, updated)
        db.commit()
        db.refresh(updated)
        return updated
    except Exception:
        db.rollback()
        raise


def synchronize_preference_from_profile(db: Session, profile: Profile) -> None:
    preference = get_preference_by_user_id(db, profile.user_id)
    if preference is not None:
        preference.intention = legacy_intention_for_mode(profile.intent_mode)
        db.add(preference)


def synchronize_profile_from_preference(
    db: Session,
    preference: Preference,
    *,
    profile: Profile | None = None,
) -> None:
    resolved_profile = profile or get_profile_by_user_id(db, preference.user_id)
    mode = mode_from_legacy_intention(preference.intention)
    preference.intention = legacy_intention_for_mode(mode)
    db.add(preference)
    if resolved_profile is not None:
        resolved_profile.intent_mode = mode
        resolved_profile.intention = legacy_intention_for_mode(mode)
        db.add(resolved_profile)
