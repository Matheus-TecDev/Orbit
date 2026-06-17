from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.compatibility import (
    CompatibilityAnswerRead,
    CompatibilityAnswerUpsert,
    CompatibilityDealbreakerRead,
    CompatibilityDealbreakerUpsert,
    CompatibilityPriorityRead,
    CompatibilityPriorityUpsert,
    CompatibilityProfileRead,
    CompatibilityQuestionRead,
)
from app.services.compatibility_service import (
    get_current_profile,
    get_questions,
    save_answers,
    save_dealbreakers,
    save_priorities,
)


router = APIRouter(prefix="/compatibility", tags=["compatibility"])


@router.get("/questions", response_model=list[CompatibilityQuestionRead])
def read_compatibility_questions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CompatibilityQuestionRead]:
    return get_questions(db)


@router.get("/me", response_model=CompatibilityProfileRead)
def read_current_compatibility_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> CompatibilityProfileRead:
    return get_current_profile(db, user_id=current_user.id)


@router.put("/answers", response_model=list[CompatibilityAnswerRead])
def put_current_compatibility_answers(
    payload: list[CompatibilityAnswerUpsert],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CompatibilityAnswerRead]:
    return save_answers(db, user_id=current_user.id, payload=payload)


@router.put("/priorities", response_model=list[CompatibilityPriorityRead])
def put_current_compatibility_priorities(
    payload: list[CompatibilityPriorityUpsert],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CompatibilityPriorityRead]:
    return save_priorities(db, user_id=current_user.id, payload=payload)


@router.put("/dealbreakers", response_model=list[CompatibilityDealbreakerRead])
def put_current_compatibility_dealbreakers(
    payload: list[CompatibilityDealbreakerUpsert],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[CompatibilityDealbreakerRead]:
    return save_dealbreakers(db, user_id=current_user.id, payload=payload)
