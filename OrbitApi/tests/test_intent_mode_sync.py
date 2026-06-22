import pytest
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.intent_mode_config import IntentMode
from app.models.preference import Preference
from app.models.profile import Profile
from app.services import intent_mode_service


@pytest.mark.parametrize(
    "payload",
    [
        {"intention": None},
        {"intent_mode": None},
    ],
)
def test_profile_patch_null_resets_all_intent_fields(
    api_client,
    intent_user,
    payload,
) -> None:
    headers = intent_user["headers"]
    api_client.patch(
        "/profiles/me",
        headers=headers,
        json={"intent_mode": "CASUAL"},
    ).raise_for_status()

    response = api_client.patch("/profiles/me", headers=headers, json=payload)

    assert response.status_code == 200
    assert response.json()["intent_mode"] == "SERIOUS"
    assert response.json()["intention"] == "serious"
    preference = api_client.get("/preferences/me", headers=headers)
    assert preference.json()["intention"] == "serious"


def test_preference_patch_null_resets_all_intent_fields(api_client, intent_user) -> None:
    headers = intent_user["headers"]
    api_client.patch(
        "/profiles/me",
        headers=headers,
        json={"intent_mode": "CASUAL"},
    ).raise_for_status()

    response = api_client.patch(
        "/preferences/me",
        headers=headers,
        json={"intention": None},
    )

    assert response.status_code == 200
    assert response.json()["intention"] == "serious"
    profile = api_client.get("/profiles/me", headers=headers)
    assert profile.json()["intent_mode"] == "SERIOUS"
    assert profile.json()["intention"] == "serious"


def test_conflicting_profile_intent_payload_is_rejected(api_client, intent_user) -> None:
    response = api_client.patch(
        "/profiles/me",
        headers=intent_user["headers"],
        json={"intent_mode": "CASUAL", "intention": "serious"},
    )

    assert response.status_code == 422


def test_zero_recommendation_limit_is_rejected_by_api(api_client, intent_user) -> None:
    response = api_client.get(
        "/recommendations?limit=0",
        headers=intent_user["headers"],
    )

    assert response.status_code == 422


def test_intent_sync_rolls_back_if_secondary_update_fails(
    api_client,
    intent_user,
    monkeypatch,
) -> None:
    def fail_sync(*_args, **_kwargs) -> None:
        raise RuntimeError("forced sync failure")

    monkeypatch.setattr(
        intent_mode_service,
        "synchronize_preference_from_profile",
        fail_sync,
    )

    with pytest.raises(RuntimeError, match="forced sync failure"):
        api_client.patch(
            "/profiles/me",
            headers=intent_user["headers"],
            json={"intent_mode": "CASUAL"},
        )

    db = SessionLocal()
    profile = db.scalar(select(Profile).where(Profile.id == intent_user["profile_id"]))
    preference = db.scalar(
        select(Preference).where(Preference.id == intent_user["preference_id"])
    )
    assert profile is not None
    assert preference is not None
    assert profile.intent_mode == IntentMode.SERIOUS
    assert profile.intention == "serious"
    assert preference.intention == "serious"
    db.close()


def test_preference_intent_sync_rolls_back_if_profile_update_fails(
    api_client,
    intent_user,
    monkeypatch,
) -> None:
    def fail_sync(*_args, **_kwargs) -> None:
        raise RuntimeError("forced preference sync failure")

    monkeypatch.setattr(
        intent_mode_service,
        "synchronize_profile_from_preference",
        fail_sync,
    )

    with pytest.raises(RuntimeError, match="forced preference sync failure"):
        api_client.patch(
            "/preferences/me",
            headers=intent_user["headers"],
            json={"intention": "casual"},
        )

    db = SessionLocal()
    profile = db.scalar(select(Profile).where(Profile.id == intent_user["profile_id"]))
    preference = db.scalar(
        select(Preference).where(Preference.id == intent_user["preference_id"])
    )
    assert profile is not None
    assert preference is not None
    assert profile.intent_mode == IntentMode.SERIOUS
    assert profile.intention == "serious"
    assert preference.intention == "serious"
    db.close()
