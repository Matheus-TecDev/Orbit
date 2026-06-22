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


def list_preferences_by_user_ids(db: Session, user_ids: list[UUID]) -> list[Preference]:
    if not user_ids:
        return []
    return list(
        db.scalars(
            select(Preference)
            .where(Preference.user_id.in_(user_ids))
            .options(selectinload(Preference.interests))
        )
    )


def create_preference(
    db: Session,
    *,
    user_id: UUID,
    data: PreferenceCreate,
    commit: bool = True,
) -> Preference:
    payload = data.model_dump(exclude={"interests"})
    preference = Preference(user_id=user_id, **payload)
    preference.interests = get_or_create_interests(db, data.interests)
    db.add(preference)
    if commit:
        db.commit()
    else:
        db.flush()
    db.refresh(preference)
    return preference


def update_preference(
    db: Session,
    *,
    preference: Preference,
    data: PreferenceUpdate,
    commit: bool = True,
) -> Preference:
    payload = data.model_dump(exclude_unset=True, exclude={"interests"})
    for field, value in payload.items():
        setattr(preference, field, value)

    if data.interests is not None:
        preference.interests = get_or_create_interests(db, data.interests)

    db.add(preference)
    if commit:
        db.commit()
    else:
        db.flush()
    db.refresh(preference)
    return preference
