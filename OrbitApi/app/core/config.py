from functools import lru_cache
import json

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Orbit AI API"
    environment: str = "development"
    debug: bool = False
    database_url: str = "postgresql+psycopg://orbit:orbit@localhost:5432/orbit_ai"
    secret_key: str = "change-me-use-a-strong-secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    media_root: str = "media"
    media_url_path: str = "/media"
    max_profile_photo_bytes: int = 5 * 1024 * 1024

    @property
    def cors_origin_list(self) -> list[str]:
        value = self.cors_origins
        if not value:
            return []
        if value.startswith("["):
            return json.loads(value)
        return [origin.strip() for origin in value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
