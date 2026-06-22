from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.profile import Profile
from app.core.intent_mode_config import legacy_intention_for_mode, mode_from_legacy_intention
from app.schemas.profile import ProfileCreate, ProfileUpdate
from app.repositories.interest_repository import get_or_create_interests


def get_profile_by_id(db: Session, profile_id: UUID) -> Profile | None:
    return db.scalar(
        select(Profile)
        .where(Profile.id == profile_id)
        .options(selectinload(Profile.interests))
    )


def get_profile_by_user_id(db: Session, user_id: UUID) -> Profile | None:
    return db.scalar(
        select(Profile)
        .where(Profile.user_id == user_id)
        .options(selectinload(Profile.interests))
    )


def create_profile(
    db: Session,
    *,
    user_id: UUID,
    data: ProfileCreate,
    commit: bool = True,
) -> Profile:
    payload = data.model_dump(exclude={"interests"})
    profile = Profile(user_id=user_id, **payload)
    profile.interests = get_or_create_interests(db, data.interests)
    db.add(profile)
    if commit:
        db.commit()
    else:
        db.flush()
    db.refresh(profile)
    return profile


def update_profile(
    db: Session,
    *,
    profile: Profile,
    data: ProfileUpdate,
    commit: bool = True,
) -> Profile:
    payload = data.model_dump(exclude_unset=True, exclude={"interests"})
    if data.intent_mode is not None or data.intention is not None:
        mode = data.intent_mode or mode_from_legacy_intention(data.intention)
        payload["intent_mode"] = mode
        payload["intention"] = legacy_intention_for_mode(mode)
    for field, value in payload.items():
        setattr(profile, field, value)

    if data.interests is not None:
        profile.interests = get_or_create_interests(db, data.interests)

    db.add(profile)
    if commit:
        db.commit()
    else:
        db.flush()
    db.refresh(profile)
    return profile


def list_visible_profiles(db: Session, *, excluded_user_id: UUID) -> list[Profile]:
    return list(
        db.scalars(
            select(Profile)
            .where(Profile.user_id != excluded_user_id, Profile.is_visible.is_(True))
            .options(selectinload(Profile.interests))
        )
    )
