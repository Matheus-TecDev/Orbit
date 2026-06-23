from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.match import Match
from app.models.profile import Profile


def get_match_by_actor_and_target(db: Session, *, actor_user_id: UUID, target_profile_id: UUID) -> Match | None:
    return db.scalar(
        select(Match)
        .where(Match.actor_user_id == actor_user_id, Match.target_profile_id == target_profile_id)
        .options(
            selectinload(Match.chat),
            selectinload(Match.target_profile).selectinload(Profile.interests),
        )
    )


def upsert_match(db: Session, *, actor_user_id: UUID, target_profile_id: UUID, status: str) -> Match:
    match = get_match_by_actor_and_target(
        db,
        actor_user_id=actor_user_id,
        target_profile_id=target_profile_id,
    )
    if match is None:
        match = Match(actor_user_id=actor_user_id, target_profile_id=target_profile_id, status=status)
        db.add(match)
        db.flush()
    else:
        match.status = status
    return match


def list_matches_by_user(db: Session, *, user_id: UUID, status: str | None = None) -> list[Match]:
    stmt = (
        select(Match)
        .where(Match.actor_user_id == user_id)
        .options(
            selectinload(Match.chat),
            selectinload(Match.target_profile).selectinload(Profile.interests),
        )
        .order_by(Match.updated_at.desc())
    )
    if status is not None:
        stmt = stmt.where(Match.status == status)
    return list(db.scalars(stmt))


def get_match_for_user(db: Session, *, match_id: UUID, user_id: UUID) -> Match | None:
    return db.scalar(
        select(Match)
        .where(
            Match.id == match_id,
            or_(
                Match.actor_user_id == user_id,
                Match.target_profile.has(Profile.user_id == user_id),
            ),
        )
        .options(
            selectinload(Match.chat),
            selectinload(Match.target_profile).selectinload(Profile.interests),
        )
    )


def list_matches_between_users(db: Session, *, left_user_id: UUID, right_user_id: UUID) -> list[Match]:
    return list(
        db.scalars(
            select(Match)
            .join(Profile, Match.target_profile_id == Profile.id)
            .where(
                or_(
                    (
                        (Match.actor_user_id == left_user_id)
                        & (Profile.user_id == right_user_id)
                    ),
                    (
                        (Match.actor_user_id == right_user_id)
                        & (Profile.user_id == left_user_id)
                    ),
                )
            )
            .options(
                selectinload(Match.chat),
                selectinload(Match.target_profile).selectinload(Profile.interests),
            )
        )
    )


def list_acted_profile_ids(db: Session, *, user_id: UUID) -> set[UUID]:
    return set(db.scalars(select(Match.target_profile_id).where(Match.actor_user_id == user_id)))
