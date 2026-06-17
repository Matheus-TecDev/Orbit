from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.preference import Preference
from app.repositories.interest_repository import get_or_create_interests
from app.schemas.preference import PreferenceCreate, PreferenceUpdate


def get_preference_by_user_id(db: Session, user_id: UUID) -> Preference | None:
    return db.scalar(
        select(Preference)
        .where(Preference.user_id == user_id)
        .options(selectinload(Preference.interests))
    )


def create_preference(db: Session, *, user_id: UUID, data: PreferenceCreate) -> Preference:
    payload = data.model_dump(exclude={"interests"})
    preference = Preference(user_id=user_id, **payload)
    preference.interests = get_or_create_interests(db, data.interests)
    db.add(preference)
    db.commit()
    db.refresh(preference)
    return preference


def update_preference(db: Session, *, preference: Preference, data: PreferenceUpdate) -> Preference:
    payload = data.model_dump(exclude_unset=True, exclude={"interests"})
    for field, value in payload.items():
        setattr(preference, field, value)

    if data.interests is not None:
        preference.interests = get_or_create_interests(db, data.interests)

    db.add(preference)
    db.commit()
    db.refresh(preference)
    return preference
