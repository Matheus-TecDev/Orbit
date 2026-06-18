from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.city import City


def list_cities(db: Session, *, query: str | None = None, limit: int = 50) -> list[City]:
    stmt = select(City).order_by(City.name, City.state).limit(limit)
    if query:
        stmt = stmt.where(City.name.ilike(f"%{query.strip()}%"))
    return list(db.scalars(stmt))


def get_or_create_city(
    db: Session,
    *,
    name: str,
    state: str | None = None,
    country: str = "Brasil",
) -> City:
    normalized_name = name.strip()
    normalized_state = state.strip() if state else None
    normalized_country = country.strip() or "Brasil"
    city = db.scalar(
        select(City).where(
            City.name == normalized_name,
            City.state == normalized_state,
            City.country == normalized_country,
        )
    )
    if city is not None:
        return city

    city = City(name=normalized_name, state=normalized_state, country=normalized_country)
    db.add(city)
    db.flush()
    return city
