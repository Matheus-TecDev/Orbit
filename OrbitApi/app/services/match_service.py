from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.match import Match
from app.models.user import User
from app.repositories.chat_repository import get_chat_between_users, get_or_create_chat_between_users
from app.repositories.match_repository import (
    get_match_by_actor_and_target,
    get_match_for_user,
    list_matches_between_users,
    list_matches_by_user,
    upsert_match,
)
from app.repositories.profile_repository import get_profile_by_id, get_profile_by_user_id
from app.repositories.safety_repository import is_blocked_between


LIKE_STATUS = "liked"
PASS_STATUS = "passed"
MATCHED_STATUS = "matched"
UNMATCHED_STATUS = "unmatched"


def like_profile(db: Session, *, current_user: User, target_profile_id: UUID) -> Match:
    current_profile = get_profile_by_user_id(db, current_user.id)
    if current_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create a profile before liking other profiles",
        )

    target_profile = get_profile_by_id(db, target_profile_id)
    if target_profile is None or not target_profile.is_visible:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if target_profile.user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot like your own profile")
    if is_blocked_between(db, left_user_id=current_user.id, right_user_id=target_profile.user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    match = upsert_match(
        db,
        actor_user_id=current_user.id,
        target_profile_id=target_profile.id,
        status=LIKE_STATUS,
    )
    reciprocal = get_match_by_actor_and_target(
        db,
        actor_user_id=target_profile.user_id,
        target_profile_id=current_profile.id,
    )

    if reciprocal and reciprocal.status in {LIKE_STATUS, MATCHED_STATUS}:
        match.status = MATCHED_STATUS
        reciprocal.status = MATCHED_STATUS
        get_or_create_chat_between_users(
            db,
            participant_ids=[current_user.id, target_profile.user_id],
            match_id=match.id,
        )

    db.commit()
    db.refresh(match)
    return match


def pass_profile(db: Session, *, current_user: User, target_profile_id: UUID) -> Match:
    target_profile = get_profile_by_id(db, target_profile_id)
    if target_profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    if target_profile.user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot pass your own profile")
    if is_blocked_between(db, left_user_id=current_user.id, right_user_id=target_profile.user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    existing_match = get_match_by_actor_and_target(
        db,
        actor_user_id=current_user.id,
        target_profile_id=target_profile.id,
    )
    if existing_match and existing_match.status == MATCHED_STATUS:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Matched profiles cannot be passed")

    match = upsert_match(
        db,
        actor_user_id=current_user.id,
        target_profile_id=target_profile.id,
        status=PASS_STATUS,
    )
    db.commit()
    db.refresh(match)
    return match


def get_user_matches(db: Session, *, current_user: User) -> list[Match]:
    return [
        match
        for match in list_matches_by_user(db, user_id=current_user.id, status=MATCHED_STATUS)
        if not is_blocked_between(
            db,
            left_user_id=current_user.id,
            right_user_id=match.target_profile.user_id,
        )
    ]


def unmatch(db: Session, *, current_user: User, match_id: UUID) -> Match:
    match = get_match_for_user(db, match_id=match_id, user_id=current_user.id)
    if match is None or match.status != MATCHED_STATUS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    other_user_id = get_other_user_id_for_match(match, current_user_id=current_user.id)
    for related_match in list_matches_between_users(
        db,
        left_user_id=current_user.id,
        right_user_id=other_user_id,
    ):
        related_match.status = UNMATCHED_STATUS

    db.commit()
    db.refresh(match)
    return match


def unmatch_between_users(db: Session, *, left_user_id: UUID, right_user_id: UUID) -> None:
    for related_match in list_matches_between_users(
        db,
        left_user_id=left_user_id,
        right_user_id=right_user_id,
    ):
        if related_match.status == MATCHED_STATUS:
            related_match.status = UNMATCHED_STATUS


def get_other_user_id_for_match(match: Match, *, current_user_id: UUID) -> UUID:
    if match.actor_user_id == current_user_id:
        return match.target_profile.user_id
    if match.target_profile.user_id == current_user_id:
        return match.actor_user_id
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")


def get_chat_id_for_match(db: Session, *, match: Match) -> UUID | None:
    if match.chat is not None:
        return match.chat.id

    chat = get_chat_between_users(
        db,
        user_ids=[match.actor_user_id, match.target_profile.user_id],
    )
    return chat.id if chat is not None else None
