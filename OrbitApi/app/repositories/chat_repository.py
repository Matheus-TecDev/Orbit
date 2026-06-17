from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.chat import Chat, chat_participants
from app.models.message import Message
from app.models.user import User


def get_chat_between_users(db: Session, *, user_ids: list[UUID]) -> Chat | None:
    unique_user_ids = list(set(user_ids))
    return db.scalar(
        select(Chat)
        .join(chat_participants, Chat.id == chat_participants.c.chat_id)
        .where(chat_participants.c.user_id.in_(unique_user_ids))
        .group_by(Chat.id)
        .having(func.count(chat_participants.c.user_id) == len(unique_user_ids))
        .options(selectinload(Chat.participants), selectinload(Chat.messages))
    )


def create_chat(db: Session, *, participant_ids: list[UUID], match_id: UUID | None = None) -> Chat:
    participants = list(db.scalars(select(User).where(User.id.in_(participant_ids))))
    chat = Chat(match_id=match_id, participants=participants)
    db.add(chat)
    db.flush()
    return chat


def get_or_create_chat_between_users(
    db: Session,
    *,
    participant_ids: list[UUID],
    match_id: UUID | None = None,
) -> Chat:
    chat = get_chat_between_users(db, user_ids=participant_ids)
    if chat is not None:
        if match_id is not None and chat.match_id is None:
            chat.match_id = match_id
            db.flush()
        return chat
    return create_chat(db, participant_ids=participant_ids, match_id=match_id)


def list_chats_for_user(db: Session, *, user_id: UUID) -> list[Chat]:
    return list(
        db.scalars(
            select(Chat)
            .join(chat_participants, Chat.id == chat_participants.c.chat_id)
            .where(chat_participants.c.user_id == user_id)
            .options(selectinload(Chat.participants), selectinload(Chat.messages))
            .order_by(Chat.updated_at.desc())
        )
    )


def get_chat_for_user(db: Session, *, chat_id: UUID, user_id: UUID) -> Chat | None:
    return db.scalar(
        select(Chat)
        .join(chat_participants, Chat.id == chat_participants.c.chat_id)
        .where(Chat.id == chat_id, chat_participants.c.user_id == user_id)
        .options(selectinload(Chat.participants), selectinload(Chat.messages))
    )


def list_messages(db: Session, *, chat_id: UUID) -> list[Message]:
    return list(db.scalars(select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)))


def create_message(db: Session, *, chat_id: UUID, sender_id: UUID, content: str) -> Message:
    message = Message(chat_id=chat_id, sender_id=sender_id, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
