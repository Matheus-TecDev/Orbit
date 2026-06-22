from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.recommendation import RecommendationRead
from app.services.recommendation_service import get_recommendations


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=list[RecommendationRead])
def list_recommendations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int | None, Query(ge=1)] = None,
) -> list[RecommendationRead]:
    return get_recommendations(db, current_user=current_user, limit=limit)
