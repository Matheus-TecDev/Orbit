from uuid import uuid4

from sqlalchemy import delete, select

from app.core.database import SessionLocal
from app.core.intent_mode_config import IntentMode
from app.core.security import create_access_token
from app.models.chat import Chat
from app.models.match import Match
from app.models.message import Message
from app.models.preference import Preference
from app.models.profile import Profile
from app.models.safety import UserReport
from app.models.user import User


def test_blocked_user_is_hidden_from_recommendations_matches_and_chats(api_client) -> None:
    data = create_safety_fixture()
    headers = data["headers"]

    block_response = api_client.post(
        f"/safety/block/{data['matched_user_id']}",
        headers=headers,
    )

    assert block_response.status_code == 200
    matches = api_client.get("/matches", headers=headers)
    chats = api_client.get("/chats", headers=headers)
    blocked_message = api_client.post(
        f"/chats/{data['chat_id']}/messages",
        headers=headers,
        json={"content": "Não deve enviar."},
    )

    assert data["matched_profile_id"] not in [
        item["target_profile"]["id"] for item in matches.json()
    ]
    assert data["chat_id"] not in [item["id"] for item in chats.json()]
    assert blocked_message.status_code == 404

    api_client.post(f"/safety/block/{data['candidate_user_id']}", headers=headers).raise_for_status()
    recommendations = api_client.get("/recommendations", headers=headers)
    assert recommendations.status_code == 200
    assert data["candidate_profile_id"] not in [
        item["profile_id"] for item in recommendations.json()
    ]

    cleanup_users(data["user_ids"])


def test_unmatch_hides_match_and_prevents_chat_messages(api_client) -> None:
    data = create_safety_fixture()
    headers = data["headers"]

    response = api_client.post(f"/matches/{data['match_id']}/unmatch", headers=headers)

    assert response.status_code == 200
    assert response.json()["status"] == "unmatched"
    assert api_client.get("/matches", headers=headers).json() == []
    assert api_client.get("/chats", headers=headers).json() == []

    blocked_message = api_client.post(
        f"/chats/{data['chat_id']}/messages",
        headers=headers,
        json={"content": "Não deve enviar."},
    )
    assert blocked_message.status_code == 404

    cleanup_users(data["user_ids"])


def test_report_is_persisted(api_client) -> None:
    data = create_safety_fixture()
    headers = data["headers"]

    response = api_client.post(
        f"/safety/report/{data['matched_user_id']}",
        headers=headers,
        json={"reason": "comportamento_inadequado", "details": "Mensagem ofensiva."},
    )

    assert response.status_code == 200
    report_id = response.json()["id"]

    db = SessionLocal()
    report = db.scalar(select(UserReport).where(UserReport.id == report_id))
    assert report is not None
    assert report.reported_user_id == data["matched_user_id"]
    assert report.reason == "comportamento_inadequado"
    db.close()

    cleanup_users(data["user_ids"])


def test_user_cannot_unmatch_third_party_match(api_client) -> None:
    data = create_safety_fixture()
    third_party_match_id, third_party_user_ids = create_third_party_match()

    response = api_client.post(
        f"/matches/{third_party_match_id}/unmatch",
        headers=data["headers"],
    )

    assert response.status_code == 404

    cleanup_users(data["user_ids"])
    cleanup_users(third_party_user_ids)


def create_safety_fixture() -> dict[str, object]:
    user_id = uuid4()
    matched_user_id = uuid4()
    candidate_user_id = uuid4()
    user_profile_id = uuid4()
    matched_profile_id = uuid4()
    candidate_profile_id = uuid4()
    match_id = uuid4()
    reciprocal_match_id = uuid4()
    chat_id = uuid4()
    db = SessionLocal()

    current = make_user(user_id, "Atual")
    matched = make_user(matched_user_id, "Match")
    candidate = make_user(candidate_user_id, "Candidato")
    current_profile = make_profile(user_profile_id, user_id, "Atual")
    matched_profile = make_profile(matched_profile_id, matched_user_id, "Match")
    candidate_profile = make_profile(candidate_profile_id, candidate_user_id, "Candidato")
    current_preference = make_preference(user_id)
    matched_preference = make_preference(matched_user_id)
    candidate_preference = make_preference(candidate_user_id)
    match = Match(
        id=match_id,
        actor_user_id=user_id,
        target_profile_id=matched_profile_id,
        status="matched",
    )
    reciprocal_match = Match(
        id=reciprocal_match_id,
        actor_user_id=matched_user_id,
        target_profile_id=user_profile_id,
        status="matched",
    )
    chat = Chat(id=chat_id, match_id=match_id, participants=[current, matched])

    db.add_all([
        current,
        matched,
        candidate,
        current_profile,
        matched_profile,
        candidate_profile,
        current_preference,
        matched_preference,
        candidate_preference,
        match,
        reciprocal_match,
        chat,
    ])
    db.add(Message(chat_id=chat_id, sender_id=matched_user_id, content="Oi."))
    db.commit()
    db.close()

    return {
        "headers": {"Authorization": f"Bearer {create_access_token(user_id)}"},
        "user_ids": {user_id, matched_user_id, candidate_user_id},
        "match_id": match_id,
        "chat_id": chat_id,
        "matched_user_id": matched_user_id,
        "matched_profile_id": matched_profile_id,
        "candidate_user_id": candidate_user_id,
        "candidate_profile_id": candidate_profile_id,
    }


def create_third_party_match():
    first_user_id = uuid4()
    second_user_id = uuid4()
    first_profile_id = uuid4()
    second_profile_id = uuid4()
    match_id = uuid4()
    db = SessionLocal()
    db.add_all([
        make_user(first_user_id, "Terceiro A"),
        make_user(second_user_id, "Terceiro B"),
        make_profile(first_profile_id, first_user_id, "Terceiro A"),
        make_profile(second_profile_id, second_user_id, "Terceiro B"),
        make_preference(first_user_id),
        make_preference(second_user_id),
        Match(
            id=match_id,
            actor_user_id=first_user_id,
            target_profile_id=second_profile_id,
            status="matched",
        ),
    ])
    db.commit()
    db.close()
    return match_id, {first_user_id, second_user_id}


def make_user(user_id, name: str) -> User:
    return User(
        id=user_id,
        email=f"{user_id}@orbit.test",
        hashed_password="not-used",
        full_name=name,
        is_active=True,
    )


def make_profile(profile_id, user_id, name: str) -> Profile:
    profile = Profile(
        id=profile_id,
        user_id=user_id,
        display_name=name,
        birth_date=None,
        gender="Mulher",
        city="Fortaleza",
        intention="serious",
        intent_mode=IntentMode.SERIOUS,
        is_visible=True,
    )
    profile.interests = []
    return profile


def make_preference(user_id) -> Preference:
    preference = Preference(
        id=uuid4(),
        user_id=user_id,
        min_age=18,
        max_age=85,
        max_distance_km=100,
        city=None,
        gender=None,
        preferred_genders=[],
        intention="serious",
    )
    preference.interests = []
    return preference


def cleanup_users(user_ids: set) -> None:
    db = SessionLocal()
    db.execute(delete(User).where(User.id.in_(user_ids)))
    db.commit()
    db.close()
