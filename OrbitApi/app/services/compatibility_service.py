from uuid import UUID

from sqlalchemy.orm import Session

from app.models.compatibility import (
    CompatibilityAnswer,
    CompatibilityDealbreaker,
    CompatibilityPriority,
)
from app.repositories.compatibility_repository import (
    list_active_questions,
    list_answers_by_user_id,
    list_dealbreakers_by_user_id,
    list_priorities_by_user_id,
    replace_dealbreakers,
    replace_priorities,
    upsert_answers,
)
from app.schemas.compatibility import (
    CompatibilityAnswerRead,
    CompatibilityAnswerUpsert,
    CompatibilityDealbreakerRead,
    CompatibilityDealbreakerUpsert,
    CompatibilityPriorityRead,
    CompatibilityPriorityUpsert,
    CompatibilityProfileRead,
    CompatibilityQuestionRead,
)


def get_questions(db: Session) -> list[CompatibilityQuestionRead]:
    return [question_to_read(question) for question in list_active_questions(db)]


def get_current_profile(db: Session, *, user_id: UUID) -> CompatibilityProfileRead:
    questions = list_active_questions(db)
    answers = list_answers_by_user_id(db, user_id)
    priorities = list_priorities_by_user_id(db, user_id)
    dealbreakers = list_dealbreakers_by_user_id(db, user_id)
    active_question_keys = {question.key for question in questions}
    answered_keys = {
        answer.question_key
        for answer in answers
        if answer.question_key in active_question_keys
    }
    completion_percentage = (
        round((len(answered_keys) / len(active_question_keys)) * 100)
        if active_question_keys
        else 0
    )

    return CompatibilityProfileRead(
        questions=[question_to_read(question) for question in questions],
        answers=[answer_to_read(answer) for answer in answers],
        priorities=[priority_to_read(priority) for priority in priorities],
        dealbreakers=[dealbreaker_to_read(dealbreaker) for dealbreaker in dealbreakers],
        completion_percentage=completion_percentage,
    )


def save_answers(
    db: Session,
    *,
    user_id: UUID,
    payload: list[CompatibilityAnswerUpsert],
) -> list[CompatibilityAnswerRead]:
    return [answer_to_read(answer) for answer in upsert_answers(db, user_id=user_id, payload=payload)]


def save_priorities(
    db: Session,
    *,
    user_id: UUID,
    payload: list[CompatibilityPriorityUpsert],
) -> list[CompatibilityPriorityRead]:
    return [
        priority_to_read(priority)
        for priority in replace_priorities(db, user_id=user_id, payload=payload)
    ]


def save_dealbreakers(
    db: Session,
    *,
    user_id: UUID,
    payload: list[CompatibilityDealbreakerUpsert],
) -> list[CompatibilityDealbreakerRead]:
    return [
        dealbreaker_to_read(dealbreaker)
        for dealbreaker in replace_dealbreakers(db, user_id=user_id, payload=payload)
    ]


def question_to_read(question) -> CompatibilityQuestionRead:
    return CompatibilityQuestionRead(
        id=question.id,
        key=question.key,
        dimension=question.dimension,
        text=question.text,
        answer_type=question.answer_type,
        is_active=question.is_active,
        created_at=question.created_at,
        updated_at=question.updated_at,
    )


def answer_to_read(answer: CompatibilityAnswer) -> CompatibilityAnswerRead:
    return CompatibilityAnswerRead(
        id=answer.id,
        user_id=answer.user_id,
        question_key=answer.question_key,
        dimension=answer.dimension,
        answer_value=answer.answer_value,
        created_at=answer.created_at,
        updated_at=answer.updated_at,
    )


def priority_to_read(priority: CompatibilityPriority) -> CompatibilityPriorityRead:
    return CompatibilityPriorityRead(
        id=priority.id,
        user_id=priority.user_id,
        dimension=priority.dimension,
        weight=priority.weight,
        created_at=priority.created_at,
        updated_at=priority.updated_at,
    )


def dealbreaker_to_read(dealbreaker: CompatibilityDealbreaker) -> CompatibilityDealbreakerRead:
    return CompatibilityDealbreakerRead(
        id=dealbreaker.id,
        user_id=dealbreaker.user_id,
        rule_key=dealbreaker.rule_key,
        value=dealbreaker.value,
        created_at=dealbreaker.created_at,
        updated_at=dealbreaker.updated_at,
    )
