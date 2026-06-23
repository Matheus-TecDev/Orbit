from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.safety import UserBlock, UserReport
from app.models.user import User
from app.repositories.safety_repository import create_block, create_report
from app.repositories.user_repository import get_user_by_id
from app.services.match_service import unmatch_between_users


def block_user(db: Session, *, current_user: User, target_user_id: UUID) -> UserBlock:
    if target_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot block yourself")

    target_user = get_user_by_id(db, target_user_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    block = create_block(
        db,
        blocker_user_id=current_user.id,
        blocked_user_id=target_user.id,
    )
    unmatch_between_users(db, left_user_id=current_user.id, right_user_id=target_user.id)
    db.commit()
    db.refresh(block)
    return block


def report_user(
    db: Session,
    *,
    current_user: User,
    target_user_id: UUID,
    reason: str | None,
    details: str | None,
) -> UserReport:
    if target_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot report yourself")

    target_user = get_user_by_id(db, target_user_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    report = create_report(
        db,
        reporter_user_id=current_user.id,
        reported_user_id=target_user.id,
        reason=reason.strip() if reason else None,
        details=details.strip() if details else None,
    )
    db.commit()
    db.refresh(report)
    return report
