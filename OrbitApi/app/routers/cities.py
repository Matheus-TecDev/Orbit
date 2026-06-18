from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.city_repository import list_cities
from app.schemas.city import CityRead


router = APIRouter(prefix="/cities", tags=["cities"])


@router.get("", response_model=list[CityRead])
def read_cities(
    db: Annotated[Session, Depends(get_db)],
    q: Annotated[str | None, Query(max_length=120)] = None,
) -> list[CityRead]:
    return list_cities(db, query=q)
