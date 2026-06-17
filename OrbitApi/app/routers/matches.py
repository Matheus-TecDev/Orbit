from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.mappers import match_to_read
from app.schemas.match import MatchRead
from app.services.match_service import get_chat_id_for_match, get_user_matches, like_profile, pass_profile


router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("/like/{profile_id}", response_model=MatchRead)
def like_target_profile(
    profile_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> MatchRead:
    match = like_profile(db, current_user=current_user, target_profile_id=profile_id)
    return match_to_read(match, chat_id=get_chat_id_for_match(db, match=match))


@router.post("/pass/{profile_id}", response_model=MatchRead)
def pass_target_profile(
    profile_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> MatchRead:
    match = pass_profile(db, current_user=current_user, target_profile_id=profile_id)
    return match_to_read(match, chat_id=get_chat_id_for_match(db, match=match))


@router.get("", response_model=list[MatchRead])
def list_current_matches(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[MatchRead]:
    return [
        match_to_read(match, chat_id=get_chat_id_for_match(db, match=match))
        for match in get_user_matches(db, current_user=current_user)
    ]
