from uuid import uuid4

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text

from app.core.database import engine


def test_migration_normalizes_invalid_missing_and_divergent_intents() -> None:
    config = Config("alembic.ini")
    command.upgrade(config, "head")
    command.downgrade(config, "20260617_0003")
    engine.dispose()

    cases = [
        (uuid4(), uuid4(), uuid4(), "legacy-invalid", "casual", "CASUAL", "casual"),
        (uuid4(), uuid4(), uuid4(), None, "exploring", "EXPLORING", "exploring"),
        (uuid4(), uuid4(), uuid4(), "casual", "serious", "CASUAL", "casual"),
    ]
    try:
        with engine.begin() as connection:
            for index, (user_id, profile_id, preference_id, profile_intent, preference_intent, _, _) in enumerate(cases):
                connection.execute(
                    text(
                        """
                        INSERT INTO users (id, email, hashed_password, full_name)
                        VALUES (:id, :email, 'not-used', 'Migration Test')
                        """
                    ),
                    {"id": user_id, "email": f"migration-{index}-{user_id}@orbit.test"},
                )
                connection.execute(
                    text(
                        """
                        INSERT INTO profiles (id, user_id, display_name, intention)
                        VALUES (:id, :user_id, 'Migration Test', :intention)
                        """
                    ),
                    {"id": profile_id, "user_id": user_id, "intention": profile_intent},
                )
                connection.execute(
                    text(
                        """
                        INSERT INTO preferences (
                            id, user_id, min_age, max_age, max_distance_km,
                            preferred_genders, intention
                        )
                        VALUES (:id, :user_id, 18, 85, 100, '[]'::jsonb, :intention)
                        """
                    ),
                    {
                        "id": preference_id,
                        "user_id": user_id,
                        "intention": preference_intent,
                    },
                )

        command.upgrade(config, "head")
        engine.dispose()
        with engine.connect() as connection:
            for user_id, _, _, _, _, expected_mode, expected_legacy in cases:
                row = connection.execute(
                    text(
                        """
                        SELECT profile.intent_mode::text, profile.intention, preference.intention
                        FROM profiles AS profile
                        JOIN preferences AS preference ON preference.user_id = profile.user_id
                        WHERE profile.user_id = :user_id
                        """
                    ),
                    {"user_id": user_id},
                ).one()
                assert tuple(row) == (expected_mode, expected_legacy, expected_legacy)

        command.downgrade(config, "20260617_0003")
        engine.dispose()
        assert "intent_mode" not in {
            column["name"] for column in inspect(engine).get_columns("profiles")
        }
        with engine.connect() as connection:
            for user_id, _, _, _, _, _, expected_legacy in cases:
                row = connection.execute(
                    text(
                        """
                        SELECT profile.intention, preference.intention
                        FROM profiles AS profile
                        JOIN preferences AS preference ON preference.user_id = profile.user_id
                        WHERE profile.user_id = :user_id
                        """
                    ),
                    {"user_id": user_id},
                ).one()
                assert tuple(row) == (expected_legacy, expected_legacy)
    finally:
        command.upgrade(config, "head")
        engine.dispose()
        with engine.begin() as connection:
            connection.execute(
                text("DELETE FROM users WHERE id = ANY(:user_ids)"),
                {"user_ids": [case[0] for case in cases]},
            )
