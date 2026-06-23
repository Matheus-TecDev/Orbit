from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.profile import Profile
from app.repositories.profile_repository import update_profile
from app.schemas.profile import ProfileUpdate


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def save_profile_photo(db: Session, *, profile: Profile, file: UploadFile) -> Profile:
    settings = get_settings()
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Envie uma imagem JPG, PNG ou WebP.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo enviado precisa ser uma imagem.",
        )

    content = await file.read(settings.max_profile_photo_bytes + 1)
    if len(content) > settings.max_profile_photo_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="A foto deve ter no máximo 5 MB.",
        )

    if not has_valid_image_signature(content, file.content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo enviado não parece ser uma imagem válida.",
        )

    photo_dir = Path(settings.media_root) / "profile-photos"
    photo_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{profile.user_id}-{uuid4().hex}{extension}"
    destination = photo_dir / filename
    destination.write_bytes(content)

    photo_url = f"{settings.media_url_path.rstrip('/')}/profile-photos/{filename}"
    return update_profile(db, profile=profile, data=ProfileUpdate(photo_url=photo_url))


def has_valid_image_signature(content: bytes, content_type: str | None) -> bool:
    if content_type == "image/jpeg":
        return content.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    return False
