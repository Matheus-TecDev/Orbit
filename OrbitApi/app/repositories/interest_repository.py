from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.interest import Interest


def normalize_interest_name(name: str) -> str:
    return name.strip().lower()


def get_or_create_interests(db: Session, names: list[str]) -> list[Interest]:
    interests: list[Interest] = []
    for raw_name in names:
        name = normalize_interest_name(raw_name)
        if not name:
            continue
        interest = db.scalar(select(Interest).where(Interest.name == name))
        if interest is None:
            interest = Interest(name=name)
            db.add(interest)
        interests.append(interest)
    return interests
