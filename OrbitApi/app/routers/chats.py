from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.chat_repository import create_message, get_chat_for_user, list_chats_for_user
from app.schemas.chat import ChatRead
from app.schemas.mappers import chat_to_read
from app.schemas.message import MessageCreate, MessageRead


router = APIRouter(prefix="/chats", tags=["chats"])


@router.get("", response_model=list[ChatRead])
def list_chats(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[ChatRead]:
    return [chat_to_read(chat) for chat in list_chats_for_user(db, user_id=current_user.id)]


@router.get("/{chat_id}/messages", response_model=list[MessageRead])
def list_chat_messages(
    chat_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[MessageRead]:
    chat = get_chat_for_user(db, chat_id=chat_id, user_id=current_user.id)
    if chat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    return chat.messages


@router.post("/{chat_id}/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def send_chat_message(
    chat_id: UUID,
    payload: MessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> MessageRead:
    chat = get_chat_for_user(db, chat_id=chat_id, user_id=current_user.id)
    if chat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    return create_message(db, chat_id=chat.id, sender_id=current_user.id, content=payload.content)
