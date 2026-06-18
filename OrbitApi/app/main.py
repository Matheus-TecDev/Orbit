from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.routers import auth, chats, cities, compatibility, matches, preferences, profiles, recommendations, users


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.debug,
)

cors_origins = settings.cors_origin_list
allow_credentials = "*" not in cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def healthcheck(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "ok"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cities.router)
app.include_router(profiles.router)
app.include_router(preferences.router)
app.include_router(compatibility.router)
app.include_router(recommendations.router)
app.include_router(matches.router)
app.include_router(chats.router)
