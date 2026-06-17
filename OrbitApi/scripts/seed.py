from datetime import date

from app.core.database import SessionLocal
from app.repositories.preference_repository import create_preference, get_preference_by_user_id
from app.repositories.profile_repository import create_profile, get_profile_by_user_id
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.preference import PreferenceCreate
from app.schemas.profile import ProfileCreate
from app.core.security import get_password_hash
from app.services.match_service import like_profile


DEFAULT_PASSWORD = "Orbit123!"


MOCK_USERS = [
    {
        "email": "ana@orbitai.dev",
        "full_name": "Ana Lima",
        "profile": ProfileCreate(
            display_name="Ana",
            bio="Gosta de tecnologia, cafes e trilhas urbanas.",
            birth_date=date(1998, 4, 12),
            gender="feminino",
            city="Fortaleza",
            country="Brasil",
            intention="relacionamento serio",
            interests=["tecnologia", "cafes", "corrida"],
        ),
        "preference": PreferenceCreate(
            min_age=24,
            max_age=34,
            city="Fortaleza",
            intention="relacionamento serio",
            interests=["tecnologia", "musica", "cafes"],
        ),
    },
    {
        "email": "bruno@orbitai.dev",
        "full_name": "Bruno Costa",
        "profile": ProfileCreate(
            display_name="Bruno",
            bio="Produto, musica ao vivo e viagens curtas.",
            birth_date=date(1996, 8, 21),
            gender="masculino",
            city="Fortaleza",
            country="Brasil",
            intention="relacionamento serio",
            interests=["tecnologia", "musica", "viagens"],
        ),
        "preference": PreferenceCreate(
            min_age=23,
            max_age=32,
            city="Fortaleza",
            intention="relacionamento serio",
            interests=["cafes", "tecnologia", "viagens"],
        ),
    },
    {
        "email": "carla@orbitai.dev",
        "full_name": "Carla Mendes",
        "profile": ProfileCreate(
            display_name="Carla",
            bio="Design, cinema independente e gastronomia.",
            birth_date=date(2000, 1, 9),
            gender="feminino",
            city="Recife",
            country="Brasil",
            intention="amizade",
            interests=["design", "cinema", "gastronomia"],
        ),
        "preference": PreferenceCreate(
            min_age=22,
            max_age=35,
            intention="amizade",
            interests=["design", "cinema", "arte"],
        ),
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        users = []
        for item in MOCK_USERS:
            user = get_user_by_email(db, item["email"])
            if user is None:
                user = create_user(
                    db,
                    email=item["email"],
                    hashed_password=get_password_hash(DEFAULT_PASSWORD),
                    full_name=item["full_name"],
                )
            users.append(user)

            if get_profile_by_user_id(db, user.id) is None:
                create_profile(db, user_id=user.id, data=item["profile"])
            if get_preference_by_user_id(db, user.id) is None:
                create_preference(db, user_id=user.id, data=item["preference"])

        ana_profile = get_profile_by_user_id(db, users[0].id)
        bruno_profile = get_profile_by_user_id(db, users[1].id)
        if ana_profile and bruno_profile:
            like_profile(db, current_user=users[0], target_profile_id=bruno_profile.id)
            like_profile(db, current_user=users[1], target_profile_id=ana_profile.id)

        print(f"Seed completed. Mock password for all users: {DEFAULT_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
