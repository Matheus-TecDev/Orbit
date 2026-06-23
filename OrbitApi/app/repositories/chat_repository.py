from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session, selectinload

from app.models.chat import Chat, chat_participants
from app.models.match import Match
from app.models.message import Message
from app.models.profile import Profile
from app.models.user import User
from app.repositories.safety_repository import is_blocked_between


def _chat_read_options():
    return (
        selectinload(Chat.match).selectinload(Match.target_profile),
        selectinload(Chat.participants).selectinload(User.profile).selectinload(Profile.interests),
        selectinload(Chat.messages),
    )


def get_chat_between_users(db: Session, *, user_ids: list[UUID]) -> Chat | None:
    unique_user_ids = list(set(user_ids))
    return db.scalar(
        select(Chat)
        .join(chat_participants, Chat.id == chat_participants.c.chat_id)
        .where(chat_participants.c.user_id.in_(unique_user_ids))
        .group_by(Chat.id)
        .having(func.count(chat_participants.c.user_id) == len(unique_user_ids))
        .options(*_chat_read_options())
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
    chats = list(
        db.scalars(
            select(Chat)
            .join(chat_participants, Chat.id == chat_participants.c.chat_id)
            .where(chat_participants.c.user_id == user_id)
            .options(*_chat_read_options())
            .order_by(Chat.updated_at.desc())
        )
    )
    return [chat for chat in chats if _is_chat_available_for_user(db, chat=chat, user_id=user_id)]


def get_chat_for_user(db: Session, *, chat_id: UUID, user_id: UUID) -> Chat | None:
    chat = db.scalar(
        select(Chat)
        .join(chat_participants, Chat.id == chat_participants.c.chat_id)
        .where(Chat.id == chat_id, chat_participants.c.user_id == user_id)
        .options(*_chat_read_options())
    )
    if chat is None or not _is_chat_available_for_user(db, chat=chat, user_id=user_id):
        return None
    return chat


def list_messages(db: Session, *, chat_id: UUID) -> list[Message]:
    return list(db.scalars(select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)))


def create_message(db: Session, *, chat_id: UUID, sender_id: UUID, content: str) -> Message:
    message = Message(chat_id=chat_id, sender_id=sender_id, content=content)
    db.add(message)
    db.execute(update(Chat).where(Chat.id == chat_id).values(updated_at=func.now()))
    db.commit()
    db.refresh(message)
    return message


def _is_chat_available_for_user(db: Session, *, chat: Chat, user_id: UUID) -> bool:
    if chat.match is None or chat.match.status != "matched":
        return False

    other_user = next(
        (participant for participant in chat.participants if participant.id != user_id),
        None,
    )
    if other_user is None:
        return False

    return not is_blocked_between(db, left_user_id=user_id, right_user_id=other_user.id)
