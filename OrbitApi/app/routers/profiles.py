from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.profile_repository import get_profile_by_user_id, update_profile
from app.schemas.mappers import profile_to_read
from app.schemas.profile import ProfileCreate, ProfileRead, ProfileUpdate
from app.services.intent_mode_service import (
    create_profile_with_intent_sync,
    update_profile_with_intent_sync,
)
from app.services.profile_photo_service import save_profile_photo


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=ProfileRead, status_code=status.HTTP_201_CREATED)
def create_current_profile(
    payload: ProfileCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileRead:
    if get_profile_by_user_id(db, current_user.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists")
    profile = create_profile_with_intent_sync(db, user_id=current_user.id, data=payload)
    return profile_to_read(profile)


@router.get("/me", response_model=ProfileRead)
def read_current_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileRead:
    profile = get_profile_by_user_id(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile_to_read(profile)


@router.patch("/me", response_model=ProfileRead)
def patch_current_profile(
    payload: ProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileRead:
    profile = get_profile_by_user_id(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    intent_was_sent = bool({"intent_mode", "intention"} & payload.model_fields_set)
    updated_profile = (
        update_profile_with_intent_sync(db, profile=profile, data=payload)
        if intent_was_sent
        else update_profile(db, profile=profile, data=payload)
    )
    return profile_to_read(updated_profile)


@router.post("/me/photo", response_model=ProfileRead)
async def upload_current_profile_photo(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
) -> ProfileRead:
    profile = get_profile_by_user_id(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    updated_profile = await save_profile_photo(db, profile=profile, file=file)
    return profile_to_read(updated_profile)
