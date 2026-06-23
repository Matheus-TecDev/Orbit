from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.safety import UserBlock, UserReport


def get_block(
    db: Session,
    *,
    blocker_user_id: UUID,
    blocked_user_id: UUID,
) -> UserBlock | None:
    return db.scalar(
        select(UserBlock).where(
            UserBlock.blocker_user_id == blocker_user_id,
            UserBlock.blocked_user_id == blocked_user_id,
        )
    )


def create_block(
    db: Session,
    *,
    blocker_user_id: UUID,
    blocked_user_id: UUID,
) -> UserBlock:
    block = get_block(
        db,
        blocker_user_id=blocker_user_id,
        blocked_user_id=blocked_user_id,
    )
    if block is not None:
        return block

    block = UserBlock(
        blocker_user_id=blocker_user_id,
        blocked_user_id=blocked_user_id,
    )
    db.add(block)
    db.flush()
    return block


def create_report(
    db: Session,
    *,
    reporter_user_id: UUID,
    reported_user_id: UUID,
    reason: str | None,
    details: str | None,
) -> UserReport:
    report = UserReport(
        reporter_user_id=reporter_user_id,
        reported_user_id=reported_user_id,
        reason=reason,
        details=details,
    )
    db.add(report)
    db.flush()
    return report


def is_blocked_between(db: Session, *, left_user_id: UUID, right_user_id: UUID) -> bool:
    return db.scalar(
        select(UserBlock.id).where(
            or_(
                (
                    (UserBlock.blocker_user_id == left_user_id)
                    & (UserBlock.blocked_user_id == right_user_id)
                ),
                (
                    (UserBlock.blocker_user_id == right_user_id)
                    & (UserBlock.blocked_user_id == left_user_id)
                ),
            )
        )
    ) is not None


def list_blocked_user_ids(db: Session, *, user_id: UUID) -> set[UUID]:
    blocks = db.execute(
        select(UserBlock.blocker_user_id, UserBlock.blocked_user_id).where(
            or_(
                UserBlock.blocker_user_id == user_id,
                UserBlock.blocked_user_id == user_id,
            )
        )
    )
    blocked_user_ids: set[UUID] = set()
    for blocker_user_id, blocked_user_id in blocks:
        blocked_user_ids.add(blocked_user_id if blocker_user_id == user_id else blocker_user_id)
    return blocked_user_ids
