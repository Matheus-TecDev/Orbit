from uuid import uuid4

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.models.preference import Preference
from app.models.profile import Profile
from app.models.user import User


PNG_BYTES = b"\x89PNG\r\n\x1a\n" + (b"\x00" * 32)


def test_profile_photo_upload_requires_authentication(api_client) -> None:
    response = api_client.post(
        "/profiles/me/photo",
        files={"file": ("foto.png", PNG_BYTES, "image/png")},
    )

    assert response.status_code in {401, 403}


def test_profile_photo_upload_rejects_invalid_file_type(api_client, intent_user) -> None:
    response = api_client.post(
        "/profiles/me/photo",
        headers=intent_user["headers"],
        files={"file": ("arquivo.txt", b"nao-e-imagem", "text/plain")},
    )

    assert response.status_code == 400


def test_profile_photo_upload_updates_profile(api_client, intent_user, tmp_path) -> None:
    settings = get_settings()
    original_media_root = settings.media_root
    settings.media_root = str(tmp_path)

    try:
        response = api_client.post(
            "/profiles/me/photo",
            headers=intent_user["headers"],
            files={"file": ("foto.png", PNG_BYTES, "image/png")},
        )

        assert response.status_code == 200
        photo_url = response.json()["photo_url"]
        assert photo_url.startswith("/media/profile-photos/")
        assert (tmp_path / "profile-photos" / photo_url.rsplit("/", 1)[-1]).exists()

        profile = api_client.get("/profiles/me", headers=intent_user["headers"])
        assert profile.status_code == 200
        assert profile.json()["photo_url"] == photo_url
    finally:
        settings.media_root = original_media_root


def test_participant_and_recommendation_contracts_include_photo_url(api_client, tmp_path) -> None:
    settings = get_settings()
    original_media_root = settings.media_root
    settings.media_root = str(tmp_path)
    data = create_photo_contract_fixture()

    try:
        upload = api_client.post(
            "/profiles/me/photo",
            headers=data["other_headers"],
            files={"file": ("foto.png", PNG_BYTES, "image/png")},
        )
        upload.raise_for_status()
        photo_url = upload.json()["photo_url"]

        matches = api_client.get("/matches", headers=data["current_headers"])
        recommendations = api_client.get("/recommendations", headers=data["candidate_headers"])

        assert matches.status_code == 200
        assert matches.json()[0]["other_participant"]["photo_url"] == photo_url
        assert recommendations.status_code == 200
        assert any(item["photo_url"] == photo_url for item in recommendations.json())
    finally:
        settings.media_root = original_media_root
        cleanup_users(data["user_ids"])


def create_photo_contract_fixture() -> dict[str, object]:
    current_user_id = uuid4()
    other_user_id = uuid4()
    candidate_user_id = uuid4()
    current_profile_id = uuid4()
    other_profile_id = uuid4()
    candidate_profile_id = uuid4()
    db = SessionLocal()
    current_user = make_user(current_user_id, "Atual")
    other_user = make_user(other_user_id, "Foto Real")
    candidate_user = make_user(candidate_user_id, "Candidato")
    db.add_all([
        current_user,
        other_user,
        candidate_user,
        make_profile(current_profile_id, current_user_id, "Atual"),
        make_profile(other_profile_id, other_user_id, "Foto Real"),
        make_profile(candidate_profile_id, candidate_user_id, "Candidato"),
        make_preference(current_user_id),
        make_preference(other_user_id),
        make_preference(candidate_user_id),
    ])
    from app.models.match import Match

    db.add_all([
        Match(actor_user_id=current_user_id, target_profile_id=other_profile_id, status="matched"),
        Match(actor_user_id=other_user_id, target_profile_id=current_profile_id, status="matched"),
    ])
    db.commit()
    db.close()

    return {
        "user_ids": {current_user_id, other_user_id, candidate_user_id},
        "current_headers": {"Authorization": f"Bearer {create_access_token(current_user_id)}"},
        "other_headers": {"Authorization": f"Bearer {create_access_token(other_user_id)}"},
        "candidate_headers": {"Authorization": f"Bearer {create_access_token(candidate_user_id)}"},
    }


def make_user(user_id, name: str) -> User:
    return User(
        id=user_id,
        email=f"{user_id}@photo.orbit.test",
        hashed_password="not-used",
        full_name=name,
        is_active=True,
    )


def make_profile(profile_id, user_id, name: str) -> Profile:
    return Profile(
        id=profile_id,
        user_id=user_id,
        display_name=name,
        birth_date=None,
        gender="mulher",
        city="Fortaleza",
        intention="serious",
        is_visible=True,
    )


def make_preference(user_id) -> Preference:
    return Preference(
        id=uuid4(),
        user_id=user_id,
        min_age=18,
        max_age=85,
        max_distance_km=100,
        preferred_genders=[],
        intention="serious",
    )


def cleanup_users(user_ids: set) -> None:
    from sqlalchemy import delete

    db = SessionLocal()
    db.execute(delete(User).where(User.id.in_(user_ids)))
    db.commit()
    db.close()
