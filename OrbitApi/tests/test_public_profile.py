from uuid import uuid4

from sqlalchemy import delete

from app.core.database import SessionLocal
from app.core.intent_mode_config import IntentMode
from app.core.security import create_access_token
from app.models.match import Match
from app.models.preference import Preference
from app.models.profile import Profile
from app.models.safety import UserBlock
from app.models.user import User


def test_public_profile_is_available_for_current_recommendation(api_client) -> None:
    data = create_public_profile_fixture(matched=False)

    response = api_client.get(
        f"/profiles/{data['target_profile_id']}/public",
        headers=data["headers"],
    )

    assert response.status_code == 200
    body = response.json()
    assert body["profile_id"] == str(data["target_profile_id"])
    assert body["user_id"] == str(data["target_user_id"])
    assert body["name"] == "Public Target"
    assert body["intent_mode"] == "SERIOUS"
    assert body["compatibility"] is not None
    assert "birth_date" not in body
    assert "gender" not in body
    assert "intention" not in body

    cleanup_users(data["user_ids"])


def test_public_profile_is_available_for_active_match_without_fabricated_compatibility(api_client) -> None:
    data = create_public_profile_fixture(matched=True)

    response = api_client.get(
        f"/profiles/{data['target_profile_id']}/public",
        headers=data["headers"],
    )

    assert response.status_code == 200
    body = response.json()
    assert body["profile_id"] == str(data["target_profile_id"])
    assert body["compatibility"] is None

    cleanup_users(data["user_ids"])


def test_public_profile_respects_unmatch_and_blocks(api_client) -> None:
    unmatched = create_public_profile_fixture(matched=True, match_status="unmatched")
    unmatched_response = api_client.get(
        f"/profiles/{unmatched['target_profile_id']}/public",
        headers=unmatched["headers"],
    )
    assert unmatched_response.status_code == 404
    cleanup_users(unmatched["user_ids"])

    blocked = create_public_profile_fixture(matched=True, blocked=True)
    blocked_response = api_client.get(
        f"/profiles/{blocked['target_profile_id']}/public",
        headers=blocked["headers"],
    )
    assert blocked_response.status_code == 404
    cleanup_users(blocked["user_ids"])


def create_public_profile_fixture(
    *,
    matched: bool,
    match_status: str = "matched",
    blocked: bool = False,
) -> dict[str, object]:
    current_user_id = uuid4()
    target_user_id = uuid4()
    current_profile_id = uuid4()
    target_profile_id = uuid4()
    db = SessionLocal()

    current_user = make_user(current_user_id, "Current User")
    target_user = make_user(target_user_id, "Public Target")
    current_profile = make_profile(current_profile_id, current_user_id, "Current User")
    target_profile = make_profile(target_profile_id, target_user_id, "Public Target")

    records = [
        current_user,
        target_user,
        current_profile,
        target_profile,
        make_preference(current_user_id),
        make_preference(target_user_id),
    ]
    if matched:
        records.extend([
            Match(
                id=uuid4(),
                actor_user_id=current_user_id,
                target_profile_id=target_profile_id,
                status=match_status,
            ),
            Match(
                id=uuid4(),
                actor_user_id=target_user_id,
                target_profile_id=current_profile_id,
                status=match_status,
            ),
        ])
    if blocked:
        records.append(
            UserBlock(
                blocker_user_id=current_user_id,
                blocked_user_id=target_user_id,
            )
        )

    db.add_all(records)
    db.commit()
    db.close()

    return {
        "headers": {"Authorization": f"Bearer {create_access_token(current_user_id)}"},
        "user_ids": {current_user_id, target_user_id},
        "target_user_id": target_user_id,
        "target_profile_id": target_profile_id,
    }


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
        bio="Bio publica de teste.",
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
