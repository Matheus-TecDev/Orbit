from __future__ import annotations

from datetime import date
from typing import Literal, TypedDict
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_password_hash, verify_password
from app.models.message import Message
from app.models.profile import Profile
from app.models.user import User
from app.repositories.chat_repository import get_chat_between_users
from app.repositories.city_repository import get_or_create_city
from app.repositories.compatibility_repository import (
    replace_dealbreakers,
    replace_priorities,
    upsert_answers,
    upsert_official_questions,
)
from app.repositories.match_repository import get_match_by_actor_and_target
from app.repositories.preference_repository import (
    create_preference,
    get_preference_by_user_id,
    update_preference,
)
from app.repositories.profile_repository import (
    create_profile,
    get_profile_by_user_id,
    update_profile,
)
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.preference import PreferenceCreate, PreferenceUpdate
from app.schemas.compatibility import (
    CompatibilityAnswerUpsert,
    CompatibilityDealbreakerUpsert,
    CompatibilityPriorityUpsert,
    OFFICIAL_QUESTIONS,
)
from app.schemas.profile import ProfileCreate, ProfileUpdate
from app.services.match_service import like_profile, pass_profile


DEMO_EMAIL = "demo@orbit.ai"
DEMO_PASSWORD = "orbit123"
DEFAULT_PASSWORD = "orbit123"

CITY_SEEDS = [
    ("Fortaleza", "CE"),
    ("Recife", "PE"),
    ("Natal", "RN"),
    ("São Paulo", "SP"),
    ("Rio de Janeiro", "RJ"),
    ("Belo Horizonte", "MG"),
    ("Salvador", "BA"),
    ("Curitiba", "PR"),
    ("Porto Alegre", "RS"),
    ("Brasília", "DF"),
]


class ProfileSeed(TypedDict):
    display_name: str
    bio: str
    birth_date: date
    gender: str
    city: str
    country: str
    intention: str
    interests: list[str]


class PreferenceSeed(TypedDict):
    min_age: int
    max_age: int
    city: str | None
    gender: str | None
    intention: str | None
    interests: list[str]


SeedRole = Literal["demo", "match", "liked", "passed", "recommendation"]


class UserSeed(TypedDict):
    email: str
    full_name: str
    role: SeedRole
    profile: ProfileSeed
    preference: PreferenceSeed


DEMO_USER: UserSeed = {
    "email": DEMO_EMAIL,
    "full_name": "Demo Orbit",
    "role": "demo",
    "profile": {
        "display_name": "Demo",
        "bio": "Perfil demo para testar o Orbit AI com dados reais de desenvolvimento.",
        "birth_date": date(1997, 5, 14),
        "gender": "masculino",
        "city": "Fortaleza",
        "country": "Brasil",
        "intention": "serious",
        "interests": ["tecnologia", "musica", "cafes", "corrida", "cinema"],
    },
    "preference": {
        "min_age": 24,
        "max_age": 35,
        "max_distance_km": 100,
        "city": "Fortaleza",
        "gender": None,
        "preferred_genders": ["feminino"],
        "intention": "serious",
        "interests": ["tecnologia", "musica", "cafes", "viagens", "cinema"],
    },
}


DEVELOPMENT_USERS: list[UserSeed] = [
    {
        "email": "lara@orbit.ai",
        "full_name": "Lara Nogueira",
        "role": "match",
        "profile": {
            "display_name": "Lara",
            "bio": "Produto digital, cafeterias tranquilas e cinema de rua.",
            "birth_date": date(1998, 4, 12),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "serious",
            "interests": ["tecnologia", "cafes", "cinema", "design"],
        },
        "preference": {
            "min_age": 25,
            "max_age": 36,
            "city": "Fortaleza",
            "gender": "masculino",
            "intention": "serious",
            "interests": ["tecnologia", "cafes", "musica"],
        },
    },
    {
        "email": "bianca@orbit.ai",
        "full_name": "Bianca Freitas",
        "role": "match",
        "profile": {
            "display_name": "Bianca",
            "bio": "Musica ao vivo, praia no fim da tarde e viagens curtas.",
            "birth_date": date(1996, 9, 21),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "casual",
            "interests": ["musica", "viagens", "praia", "cafes"],
        },
        "preference": {
            "min_age": 24,
            "max_age": 34,
            "city": "Fortaleza",
            "gender": "masculino",
            "intention": "casual",
            "interests": ["musica", "viagens", "corrida"],
        },
    },
    {
        "email": "camila@orbit.ai",
        "full_name": "Camila Torres",
        "role": "match",
        "profile": {
            "display_name": "Camila",
            "bio": "Jogos cooperativos, tecnologia aplicada e bons restaurantes.",
            "birth_date": date(1999, 1, 9),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "exploring",
            "interests": ["tecnologia", "games", "gastronomia", "cinema"],
        },
        "preference": {
            "min_age": 24,
            "max_age": 35,
            "city": "Fortaleza",
            "gender": "masculino",
            "intention": "exploring",
            "interests": ["tecnologia", "games", "cinema"],
        },
    },
    {
        "email": "marina@orbit.ai",
        "full_name": "Marina Duarte",
        "role": "liked",
        "profile": {
            "display_name": "Marina",
            "bio": "Arquitetura, playlists longas e cafe coado sem pressa.",
            "birth_date": date(1995, 7, 3),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "serious",
            "interests": ["arquitetura", "musica", "cafes", "arte"],
        },
        "preference": {
            "min_age": 25,
            "max_age": 38,
            "city": "Fortaleza",
            "gender": None,
            "intention": "serious",
            "interests": ["musica", "arte", "cafes"],
        },
    },
    {
        "email": "renata@orbit.ai",
        "full_name": "Renata Melo",
        "role": "passed",
        "profile": {
            "display_name": "Renata",
            "bio": "Eventos grandes, viagens espontaneas e uma agenda sempre movimentada.",
            "birth_date": date(1994, 11, 18),
            "gender": "feminino",
            "city": "Recife",
            "country": "Brasil",
            "intention": "casual",
            "interests": ["eventos", "musica", "viagens"],
        },
        "preference": {
            "min_age": 26,
            "max_age": 40,
            "city": "Recife",
            "gender": None,
            "intention": "casual",
            "interests": ["eventos", "viagens", "gastronomia"],
        },
    },
    {
        "email": "julia@orbit.ai",
        "full_name": "Julia Andrade",
        "role": "recommendation",
        "profile": {
            "display_name": "Julia",
            "bio": "UX research, livros de psicologia e caminhadas pela cidade.",
            "birth_date": date(1997, 2, 27),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "serious",
            "interests": ["design", "psicologia", "cafes", "corrida"],
        },
        "preference": {
            "min_age": 24,
            "max_age": 35,
            "city": "Fortaleza",
            "gender": None,
            "intention": "serious",
            "interests": ["design", "cafes", "corrida"],
        },
    },
    {
        "email": "sofia@orbit.ai",
        "full_name": "Sofia Barros",
        "role": "recommendation",
        "profile": {
            "display_name": "Sofia",
            "bio": "Dados, jazz brasileiro e conversas longas em cafeterias.",
            "birth_date": date(1998, 10, 6),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "casual",
            "interests": ["dados", "musica", "cafes", "tecnologia"],
        },
        "preference": {
            "min_age": 24,
            "max_age": 34,
            "city": "Fortaleza",
            "gender": "masculino",
            "intention": "casual",
            "interests": ["tecnologia", "musica", "cafes"],
        },
    },
    {
        "email": "isabela@orbit.ai",
        "full_name": "Isabela Rocha",
        "role": "recommendation",
        "profile": {
            "display_name": "Isabela",
            "bio": "Fotografia, trilhas leves e novos restaurantes no fim de semana.",
            "birth_date": date(1995, 12, 1),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "exploring",
            "interests": ["fotografia", "trilhas", "gastronomia", "viagens"],
        },
        "preference": {
            "min_age": 26,
            "max_age": 38,
            "city": "Fortaleza",
            "gender": None,
            "intention": "exploring",
            "interests": ["viagens", "gastronomia", "fotografia"],
        },
    },
    {
        "email": "helena@orbit.ai",
        "full_name": "Helena Martins",
        "role": "recommendation",
        "profile": {
            "display_name": "Helena",
            "bio": "Medicina preventiva, corrida de rua e filmes independentes.",
            "birth_date": date(1993, 6, 25),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "serious",
            "interests": ["corrida", "cinema", "saude", "musica"],
        },
        "preference": {
            "min_age": 27,
            "max_age": 39,
            "city": "Fortaleza",
            "gender": None,
            "intention": "serious",
            "interests": ["corrida", "cinema", "musica"],
        },
    },
    {
        "email": "maite@orbit.ai",
        "full_name": "Maite Cavalcante",
        "role": "recommendation",
        "profile": {
            "display_name": "Maite",
            "bio": "Startups, culinaria autoral e planejamento de viagens.",
            "birth_date": date(1996, 3, 17),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "casual",
            "interests": ["startups", "gastronomia", "viagens", "tecnologia"],
        },
        "preference": {
            "min_age": 25,
            "max_age": 36,
            "city": "Fortaleza",
            "gender": "masculino",
            "intention": "casual",
            "interests": ["tecnologia", "viagens", "gastronomia"],
        },
    },
    {
        "email": "alice@orbit.ai",
        "full_name": "Alice Vieira",
        "role": "recommendation",
        "profile": {
            "display_name": "Alice",
            "bio": "Educacao, podcasts de ciencia e encontros sem pressa.",
            "birth_date": date(2000, 8, 5),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "exploring",
            "interests": ["educacao", "ciencia", "cafes", "musica"],
        },
        "preference": {
            "min_age": 24,
            "max_age": 32,
            "city": "Fortaleza",
            "gender": None,
            "intention": "exploring",
            "interests": ["ciencia", "musica", "cafes"],
        },
    },
    {
        "email": "nina@orbit.ai",
        "full_name": "Nina Santiago",
        "role": "recommendation",
        "profile": {
            "display_name": "Nina",
            "bio": "Marketing de produto, yoga e restaurantes pequenos.",
            "birth_date": date(1999, 5, 30),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "serious",
            "interests": ["produto", "yoga", "gastronomia", "design"],
        },
        "preference": {
            "min_age": 24,
            "max_age": 35,
            "city": "Fortaleza",
            "gender": "masculino",
            "intention": "serious",
            "interests": ["produto", "design", "gastronomia"],
        },
    },
    {
        "email": "clara@orbit.ai",
        "full_name": "Clara Sampaio",
        "role": "recommendation",
        "profile": {
            "display_name": "Clara",
            "bio": "Cinema, tecnologia social e planos culturais durante a semana.",
            "birth_date": date(1997, 9, 13),
            "gender": "feminino",
            "city": "Fortaleza",
            "country": "Brasil",
            "intention": "serious",
            "interests": ["cinema", "tecnologia", "cultura", "arte"],
        },
        "preference": {
            "min_age": 24,
            "max_age": 36,
            "city": "Fortaleza",
            "gender": None,
            "intention": "serious",
            "interests": ["cinema", "tecnologia", "arte"],
        },
    },
]


CHAT_MESSAGES: dict[str, list[tuple[str, str]]] = {
    "lara@orbit.ai": [
        (DEMO_EMAIL, "Oi, Lara. Vi que tecnologia e cafes aparecem bastante no seu perfil."),
        ("lara@orbit.ai", "Sim, e cinema de rua tambem. Parece um bom primeiro plano."),
        (DEMO_EMAIL, "Fechado. Qual cafeteria voce escolheria para comecar?"),
    ],
    "bianca@orbit.ai": [
        ("bianca@orbit.ai", "Seu perfil tambem marcou musica ao vivo como interesse."),
        (DEMO_EMAIL, "Marcaria facil um show pequeno no fim de semana."),
        ("bianca@orbit.ai", "Boa. Depois a gente encaixa uma praia no fim da tarde."),
    ],
    "camila@orbit.ai": [
        (DEMO_EMAIL, "Jogos cooperativos contam muito para compatibilidade."),
        ("camila@orbit.ai", "Concordo. Melhor ainda quando vira conversa leve."),
        (DEMO_EMAIL, "Entao me indica um jogo para comecar bem."),
    ],
}


DEFAULT_COMPATIBILITY_ANSWERS = {question["key"]: 3 for question in OFFICIAL_QUESTIONS}

INTENTION_ANSWER_PROFILES: dict[str, dict[str, int]] = {
    "serious": {
        "family": 4,
        "ambition": 4,
        "stability": 5,
        "spirituality": 3,
        "social_life": 3,
        "privacy": 4,
        "future_plans": 5,
        "money": 4,
        "children": 4,
        "communication_frequency": 4,
        "conflict_resolution": 4,
        "affection": 4,
        "personal_space": 3,
        "jealousy": 5,
        "relationship_pace": 4,
        "lifestyle": 3,
        "routine": 4,
        "nightlife": 2,
        "fitness": 4,
        "travel": 4,
        "openness": 4,
        "conscientiousness": 4,
        "extraversion": 3,
        "agreeableness": 4,
        "emotional_stability": 4,
    },
    "casual": {
        "family": 3,
        "ambition": 4,
        "stability": 2,
        "spirituality": 2,
        "social_life": 5,
        "privacy": 4,
        "future_plans": 2,
        "money": 3,
        "children": 2,
        "communication_frequency": 3,
        "conflict_resolution": 3,
        "affection": 4,
        "personal_space": 4,
        "jealousy": 5,
        "relationship_pace": 2,
        "lifestyle": 5,
        "routine": 2,
        "nightlife": 5,
        "fitness": 3,
        "travel": 5,
        "openness": 5,
        "conscientiousness": 3,
        "extraversion": 5,
        "agreeableness": 4,
        "emotional_stability": 3,
    },
    "exploring": {
        "family": 3,
        "ambition": 4,
        "stability": 3,
        "spirituality": 3,
        "social_life": 4,
        "privacy": 4,
        "future_plans": 3,
        "money": 3,
        "children": 3,
        "communication_frequency": 4,
        "conflict_resolution": 4,
        "affection": 3,
        "personal_space": 4,
        "jealousy": 5,
        "relationship_pace": 4,
        "lifestyle": 4,
        "routine": 3,
        "nightlife": 3,
        "fitness": 3,
        "travel": 4,
        "openness": 5,
        "conscientiousness": 3,
        "extraversion": 4,
        "agreeableness": 4,
        "emotional_stability": 4,
    },
}

INTENTION_PRIORITIES: dict[str, list[str]] = {
    "serious": ["family", "stability", "future_plans", "communication_frequency", "routine"],
    "casual": ["lifestyle", "nightlife", "travel", "affection", "openness"],
    "exploring": ["personal_space", "travel", "openness", "relationship_pace", "communication_frequency"],
}

INTENTION_DEALBREAKERS: dict[str, list[str]] = {
    "serious": ["disrespect", "poor_communication", "casual_only"],
    "casual": ["disrespect", "incompatible_routine"],
    "exploring": ["disrespect", "poor_communication"],
}


def seed() -> None:
    db = SessionLocal()
    try:
        seed_cities(db)
        upsert_official_questions(db)
        demo_user = upsert_user(db, DEMO_USER, password=DEMO_PASSWORD)
        demo_profile = upsert_profile(db, demo_user, DEMO_USER["profile"])
        upsert_preference(db, demo_user, DEMO_USER["preference"])
        upsert_seed_compatibility(db, demo_user, DEMO_USER)

        seeded_users: dict[str, User] = {DEMO_EMAIL: demo_user}
        seeded_profiles: dict[str, Profile] = {DEMO_EMAIL: demo_profile}

        for item in DEVELOPMENT_USERS:
            user = upsert_user(db, item, password=DEFAULT_PASSWORD)
            profile = upsert_profile(db, user, item["profile"])
            upsert_preference(db, user, item["preference"])
            upsert_seed_compatibility(db, user, item)
            seeded_users[item["email"]] = user
            seeded_profiles[item["email"]] = profile

        for item in DEVELOPMENT_USERS:
            profile = seeded_profiles[item["email"]]
            user = seeded_users[item["email"]]

            if item["role"] == "match":
                like_profile(db, current_user=user, target_profile_id=demo_profile.id)
                like_profile(db, current_user=demo_user, target_profile_id=profile.id)
                ensure_chat_messages(db, demo_user=demo_user, other_user=user)
            elif item["role"] == "liked":
                like_profile(db, current_user=demo_user, target_profile_id=profile.id)
            elif item["role"] == "passed":
                pass_profile(db, current_user=demo_user, target_profile_id=profile.id)

        recommendation_count = sum(1 for item in DEVELOPMENT_USERS if item["role"] == "recommendation")
        match_count = sum(1 for item in DEVELOPMENT_USERS if item["role"] == "match")
        print("Seed completed.")
        print(f"Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        print(f"Recommendation profiles available: {recommendation_count}")
        print(f"Demo matches with chats: {match_count}")
    finally:
        db.close()


def upsert_user(db: Session, item: UserSeed, *, password: str) -> User:
    user = get_user_by_email(db, item["email"])
    hashed_password = get_password_hash(password)

    if user is None:
        return create_user(
            db,
            email=item["email"],
            hashed_password=hashed_password,
            full_name=item["full_name"],
        )

    user.full_name = item["full_name"]
    user.is_active = True
    if not verify_password(password, user.hashed_password):
        user.hashed_password = hashed_password

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def upsert_profile(db: Session, user: User, data: ProfileSeed) -> Profile:
    payload = ProfileCreate(**data)
    profile = get_profile_by_user_id(db, user.id)

    if profile is None:
        return create_profile(db, user_id=user.id, data=payload)

    update_payload = ProfileUpdate(**payload.model_dump())
    return update_profile(db, profile=profile, data=update_payload)


def upsert_preference(db: Session, user: User, data: PreferenceSeed) -> None:
    normalized_data = {
        "max_distance_km": 100,
        "preferred_genders": [data["gender"]] if data.get("gender") else [],
        **data,
    }
    payload = PreferenceCreate(**normalized_data)
    preference = get_preference_by_user_id(db, user.id)

    if preference is None:
        create_preference(db, user_id=user.id, data=payload)
        return

    update_payload = PreferenceUpdate(**payload.model_dump())
    update_preference(db, preference=preference, data=update_payload)


def seed_cities(db: Session) -> None:
    for name, state in CITY_SEEDS:
        get_or_create_city(db, name=name, state=state, country="Brasil")
    db.commit()


def upsert_seed_compatibility(db: Session, user: User, item: UserSeed) -> None:
    intention = item["profile"]["intention"]
    answers = DEFAULT_COMPATIBILITY_ANSWERS | INTENTION_ANSWER_PROFILES.get(intention, {})
    answer_payload = [
        CompatibilityAnswerUpsert(question_key=question_key, answer_value=value)
        for question_key, value in answers.items()
    ]
    upsert_answers(db, user_id=user.id, payload=answer_payload)

    priority_payload = [
        CompatibilityPriorityUpsert(dimension=dimension, weight=5)
        for dimension in INTENTION_PRIORITIES.get(intention, [])
    ]
    replace_priorities(db, user_id=user.id, payload=priority_payload)

    dealbreaker_payload = [
        CompatibilityDealbreakerUpsert(rule_key=rule_key, value=None)
        for rule_key in INTENTION_DEALBREAKERS.get(intention, ["disrespect"])
    ]
    replace_dealbreakers(db, user_id=user.id, payload=dealbreaker_payload)


def ensure_chat_messages(db: Session, *, demo_user: User, other_user: User) -> None:
    chat = get_chat_between_users(db, user_ids=[demo_user.id, other_user.id])
    if chat is None:
        match = get_match_by_actor_and_target(
            db,
            actor_user_id=demo_user.id,
            target_profile_id=other_user.profile.id,
        )
        raise RuntimeError(f"Expected chat for match {match.id if match else 'missing'}")

    messages = CHAT_MESSAGES.get(other_user.email, [])
    for sender_email, content in messages:
        if chat_message_exists(db, chat_id=chat.id, content=content):
            continue

        sender = demo_user if sender_email == DEMO_EMAIL else other_user
        db.add(Message(chat_id=chat.id, sender_id=sender.id, content=content))

    db.commit()


def chat_message_exists(db: Session, *, chat_id: UUID, content: str) -> bool:
    return db.scalar(
        select(Message.id).where(Message.chat_id == chat_id, Message.content == content)
    ) is not None


if __name__ == "__main__":
    seed()
