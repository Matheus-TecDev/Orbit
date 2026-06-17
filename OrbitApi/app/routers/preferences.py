from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.preference_repository import (
    create_preference,
    get_preference_by_user_id,
    update_preference,
)
from app.schemas.mappers import preference_to_read
from app.schemas.preference import PreferenceCreate, PreferenceRead, PreferenceUpdate


router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.post("", response_model=PreferenceRead, status_code=status.HTTP_201_CREATED)
def create_current_preference(
    payload: PreferenceCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> PreferenceRead:
    if get_preference_by_user_id(db, current_user.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Preferences already exist")
    preference = create_preference(db, user_id=current_user.id, data=payload)
    return preference_to_read(preference)


@router.get("/me", response_model=PreferenceRead)
def read_current_preference(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> PreferenceRead:
    preference = get_preference_by_user_id(db, current_user.id)
    if preference is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preferences not found")
    return preference_to_read(preference)


@router.patch("/me", response_model=PreferenceRead)
def patch_current_preference(
    payload: PreferenceUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> PreferenceRead:
    preference = get_preference_by_user_id(db, current_user.id)
    if preference is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preferences not found")

    next_min_age = payload.min_age if payload.min_age is not None else preference.min_age
    next_max_age = payload.max_age if payload.max_age is not None else preference.max_age
    if next_max_age < next_min_age:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="max_age must be greater than or equal to min_age",
        )

    updated_preference = update_preference(db, preference=preference, data=payload)
    return preference_to_read(updated_preference)
