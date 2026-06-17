from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.profile_repository import create_profile, get_profile_by_user_id, update_profile
from app.schemas.mappers import profile_to_read
from app.schemas.profile import ProfileCreate, ProfileRead, ProfileUpdate


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=ProfileRead, status_code=status.HTTP_201_CREATED)
def create_current_profile(
    payload: ProfileCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileRead:
    if get_profile_by_user_id(db, current_user.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists")
    profile = create_profile(db, user_id=current_user.id, data=payload)
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
    updated_profile = update_profile(db, profile=profile, data=payload)
    return profile_to_read(updated_profile)
