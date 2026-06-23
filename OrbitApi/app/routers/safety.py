from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.safety import BlockRead, ReportCreate, ReportRead
from app.services.safety_service import block_user, report_user


router = APIRouter(prefix="/safety", tags=["safety"])


@router.post("/block/{user_id}", response_model=BlockRead)
def block_target_user(
    user_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BlockRead:
    return block_user(db, current_user=current_user, target_user_id=user_id)


@router.post("/report/{user_id}", response_model=ReportRead)
def report_target_user(
    user_id: UUID,
    payload: ReportCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ReportRead:
    return report_user(
        db,
        current_user=current_user,
        target_user_id=user_id,
        reason=payload.reason,
        details=payload.details,
    )
