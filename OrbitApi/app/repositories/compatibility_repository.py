from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.compatibility import (
    CompatibilityAnswer,
    CompatibilityDealbreaker,
    CompatibilityPriority,
    CompatibilityQuestion,
)
from app.schemas.compatibility import (
    CompatibilityAnswerUpsert,
    CompatibilityDealbreakerUpsert,
    CompatibilityPriorityUpsert,
    OFFICIAL_QUESTIONS,
    QUESTION_DIMENSIONS_BY_KEY,
)


def list_active_questions(db: Session) -> list[CompatibilityQuestion]:
    return list(
        db.scalars(
            select(CompatibilityQuestion)
            .where(CompatibilityQuestion.is_active.is_(True))
            .order_by(CompatibilityQuestion.dimension)
        )
    )


def list_all_questions(db: Session) -> list[CompatibilityQuestion]:
    return list(db.scalars(select(CompatibilityQuestion).order_by(CompatibilityQuestion.dimension)))


def upsert_official_questions(db: Session) -> list[CompatibilityQuestion]:
    existing = {
        question.key: question
        for question in db.scalars(select(CompatibilityQuestion)).all()
    }
    questions: list[CompatibilityQuestion] = []

    for item in OFFICIAL_QUESTIONS:
        question = existing.get(item["key"])
        if question is None:
            question = CompatibilityQuestion(
                key=item["key"],
                dimension=item["dimension"],
                text=item["text"],
                answer_type="scale_1_5",
                is_active=True,
            )
            db.add(question)
        else:
            question.dimension = item["dimension"]
            question.text = item["text"]
            question.answer_type = "scale_1_5"
            question.is_active = True
        questions.append(question)

    db.commit()
    for question in questions:
        db.refresh(question)
    return questions


def list_answers_by_user_id(db: Session, user_id: UUID) -> list[CompatibilityAnswer]:
    return list(
        db.scalars(
            select(CompatibilityAnswer)
            .where(CompatibilityAnswer.user_id == user_id)
            .order_by(CompatibilityAnswer.dimension)
        )
    )


def list_answers_by_user_ids(db: Session, user_ids: list[UUID]) -> list[CompatibilityAnswer]:
    if not user_ids:
        return []

    return list(
        db.scalars(
            select(CompatibilityAnswer)
            .where(CompatibilityAnswer.user_id.in_(user_ids))
            .order_by(CompatibilityAnswer.user_id, CompatibilityAnswer.dimension)
        )
    )


def upsert_answers(
    db: Session,
    *,
    user_id: UUID,
    payload: list[CompatibilityAnswerUpsert],
) -> list[CompatibilityAnswer]:
    existing = {
        answer.question_key: answer
        for answer in db.scalars(
            select(CompatibilityAnswer).where(CompatibilityAnswer.user_id == user_id)
        )
    }
    answers: list[CompatibilityAnswer] = []

    for item in payload:
        dimension = QUESTION_DIMENSIONS_BY_KEY[item.question_key]
        answer = existing.get(item.question_key)
        if answer is None:
            answer = CompatibilityAnswer(
                user_id=user_id,
                question_key=item.question_key,
                dimension=dimension,
                answer_value=item.answer_value,
            )
            db.add(answer)
            existing[item.question_key] = answer
        else:
            answer.dimension = dimension
            answer.answer_value = item.answer_value
        answers.append(answer)

    db.commit()
    for answer in answers:
        db.refresh(answer)
    return list_answers_by_user_id(db, user_id)


def list_priorities_by_user_id(db: Session, user_id: UUID) -> list[CompatibilityPriority]:
    return list(
        db.scalars(
            select(CompatibilityPriority)
            .where(CompatibilityPriority.user_id == user_id)
            .order_by(CompatibilityPriority.dimension)
        )
    )


def list_priorities_by_user_ids(db: Session, user_ids: list[UUID]) -> list[CompatibilityPriority]:
    if not user_ids:
        return []

    return list(
        db.scalars(
            select(CompatibilityPriority)
            .where(CompatibilityPriority.user_id.in_(user_ids))
            .order_by(CompatibilityPriority.user_id, CompatibilityPriority.dimension)
        )
    )


def replace_priorities(
    db: Session,
    *,
    user_id: UUID,
    payload: list[CompatibilityPriorityUpsert],
) -> list[CompatibilityPriority]:
    db.execute(delete(CompatibilityPriority).where(CompatibilityPriority.user_id == user_id))
    deduped = {item.dimension: item for item in payload}
    priorities = [
        CompatibilityPriority(user_id=user_id, dimension=item.dimension, weight=item.weight)
        for item in deduped.values()
    ]
    db.add_all(priorities)
    db.commit()
    return list_priorities_by_user_id(db, user_id)


def list_dealbreakers_by_user_id(db: Session, user_id: UUID) -> list[CompatibilityDealbreaker]:
    return list(
        db.scalars(
            select(CompatibilityDealbreaker)
            .where(CompatibilityDealbreaker.user_id == user_id)
            .order_by(CompatibilityDealbreaker.rule_key)
        )
    )


def list_dealbreakers_by_user_ids(db: Session, user_ids: list[UUID]) -> list[CompatibilityDealbreaker]:
    if not user_ids:
        return []

    return list(
        db.scalars(
            select(CompatibilityDealbreaker)
            .where(CompatibilityDealbreaker.user_id.in_(user_ids))
            .order_by(CompatibilityDealbreaker.user_id, CompatibilityDealbreaker.rule_key)
        )
    )


def replace_dealbreakers(
    db: Session,
    *,
    user_id: UUID,
    payload: list[CompatibilityDealbreakerUpsert],
) -> list[CompatibilityDealbreaker]:
    db.execute(delete(CompatibilityDealbreaker).where(CompatibilityDealbreaker.user_id == user_id))
    deduped = {item.rule_key: item for item in payload}
    dealbreakers = [
        CompatibilityDealbreaker(user_id=user_id, rule_key=item.rule_key, value=item.value)
        for item in deduped.values()
    ]
    db.add_all(dealbreakers)
    db.commit()
    return list_dealbreakers_by_user_id(db, user_id)
