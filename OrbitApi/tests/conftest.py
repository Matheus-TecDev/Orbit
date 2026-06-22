from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.core.database import SessionLocal
from app.core.intent_mode_config import IntentMode
from app.core.security import create_access_token
from app.main import app
from app.models.preference import Preference
from app.models.profile import Profile
from app.models.user import User


@pytest.fixture
def api_client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def intent_user() -> dict[str, object]:
    user_id = uuid4()
    profile_id = uuid4()
    preference_id = uuid4()
    db = SessionLocal()
    user = User(
        id=user_id,
        email=f"intent-{user_id}@orbit.test",
        hashed_password="not-used",
        full_name="Intent Test",
        is_active=True,
    )
    profile = Profile(
        id=profile_id,
        user_id=user_id,
        display_name="Intent Test",
        intention="serious",
        intent_mode=IntentMode.SERIOUS,
        is_visible=True,
    )
    preference = Preference(
        id=preference_id,
        user_id=user_id,
        min_age=18,
        max_age=85,
        max_distance_km=100,
        preferred_genders=[],
        intention="serious",
    )
    db.add_all([user, profile, preference])
    db.commit()
    db.close()

    yield {
        "user_id": user_id,
        "profile_id": profile_id,
        "preference_id": preference_id,
        "headers": {"Authorization": f"Bearer {create_access_token(user_id)}"},
    }

    db = SessionLocal()
    db.execute(delete(User).where(User.id == user_id))
    db.commit()
    db.close()
