from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


OFFICIAL_DIMENSIONS = {
    "family",
    "ambition",
    "stability",
    "spirituality",
    "social_life",
    "privacy",
    "future_plans",
    "money",
    "children",
    "communication_frequency",
    "conflict_resolution",
    "affection",
    "personal_space",
    "jealousy",
    "relationship_pace",
    "lifestyle",
    "routine",
    "nightlife",
    "fitness",
    "travel",
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "emotional_stability",
}

OFFICIAL_DEALBREAKERS = {
    "wants_children_incompatible",
    "does_not_want_children_incompatible",
    "smoker",
    "frequent_drinking",
    "long_distance",
    "casual_only",
    "different_spirituality",
    "incompatible_routine",
    "poor_communication",
    "disrespect",
}

OFFICIAL_QUESTIONS = [
    {
        "key": "family",
        "dimension": "family",
        "text": "Família tem um papel central na minha vida.",
    },
    {
        "key": "ambition",
        "dimension": "ambition",
        "text": "Ambição profissional é importante para mim.",
    },
    {
        "key": "stability",
        "dimension": "stability",
        "text": "Eu valorizo estabilidade e previsibilidade.",
    },
    {
        "key": "spirituality",
        "dimension": "spirituality",
        "text": "Fé ou espiritualidade influencia minhas decisões.",
    },
    {
        "key": "social_life",
        "dimension": "social_life",
        "text": "Ter uma vida social ativa é importante para mim.",
    },
    {
        "key": "privacy",
        "dimension": "privacy",
        "text": "Privacidade e limites pessoais são importantes para mim.",
    },
    {
        "key": "future_plans",
        "dimension": "future_plans",
        "text": "Quero construir planos de longo prazo com alguém.",
    },
    {
        "key": "money",
        "dimension": "money",
        "text": "A forma de lidar com dinheiro é importante em uma relação.",
    },
    {
        "key": "children",
        "dimension": "children",
        "text": "Ter filhos faz parte dos meus planos de futuro.",
    },
    {
        "key": "communication_frequency",
        "dimension": "communication_frequency",
        "text": "Gosto de conversar com frequência durante o dia.",
    },
    {
        "key": "conflict_resolution",
        "dimension": "conflict_resolution",
        "text": "Prefiro resolver conflitos logo em vez de deixar para depois.",
    },
    {
        "key": "affection",
        "dimension": "affection",
        "text": "Gosto de demonstrar afeto com frequência.",
    },
    {
        "key": "personal_space",
        "dimension": "personal_space",
        "text": "Preciso de bastante espaço individual.",
    },
    {
        "key": "jealousy",
        "dimension": "jealousy",
        "text": "Ciúmes em excesso é algo que me incomoda.",
    },
    {
        "key": "relationship_pace",
        "dimension": "relationship_pace",
        "text": "Prefiro que a relação evolua com calma.",
    },
    {
        "key": "lifestyle",
        "dimension": "lifestyle",
        "text": "Gosto de sair e viver experiências fora de casa.",
    },
    {
        "key": "routine",
        "dimension": "routine",
        "text": "Gosto de rotina planejada.",
    },
    {
        "key": "nightlife",
        "dimension": "nightlife",
        "text": "Vida noturna faz parte do meu estilo de vida.",
    },
    {
        "key": "fitness",
        "dimension": "fitness",
        "text": "Atividade física é importante na minha rotina.",
    },
    {
        "key": "travel",
        "dimension": "travel",
        "text": "Viajar e conhecer lugares novos é importante para mim.",
    },
    {
        "key": "openness",
        "dimension": "openness",
        "text": "Gosto de experimentar coisas novas.",
    },
    {
        "key": "conscientiousness",
        "dimension": "conscientiousness",
        "text": "Sou uma pessoa organizada e consistente.",
    },
    {
        "key": "extraversion",
        "dimension": "extraversion",
        "text": "Eu recarrego energia socializando.",
    },
    {
        "key": "agreeableness",
        "dimension": "agreeableness",
        "text": "Eu tento evitar conflitos desnecessários.",
    },
    {
        "key": "emotional_stability",
        "dimension": "emotional_stability",
        "text": "Consigo manter calma em situações difíceis.",
    },
]

OFFICIAL_QUESTION_KEYS = {question["key"] for question in OFFICIAL_QUESTIONS}
QUESTION_DIMENSIONS_BY_KEY = {
    question["key"]: question["dimension"] for question in OFFICIAL_QUESTIONS
}


def normalize_key(value: str) -> str:
    return value.strip().lower()


class CompatibilityQuestionRead(BaseModel):
    id: UUID
    key: str
    dimension: str
    text: str
    answer_type: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CompatibilityAnswerUpsert(BaseModel):
    question_key: str = Field(min_length=1, max_length=120)
    answer_value: int = Field(ge=1, le=5)

    @field_validator("question_key")
    @classmethod
    def validate_question_key(cls, value: str) -> str:
        normalized = normalize_key(value)
        if normalized not in OFFICIAL_QUESTION_KEYS:
            raise ValueError("question_key must be an official compatibility question")
        return normalized


class CompatibilityAnswerRead(BaseModel):
    id: UUID
    user_id: UUID
    question_key: str
    dimension: str
    answer_value: int
    created_at: datetime
    updated_at: datetime


class CompatibilityPriorityUpsert(BaseModel):
    dimension: str = Field(min_length=1, max_length=80)
    weight: int = Field(ge=1, le=5)

    @field_validator("dimension")
    @classmethod
    def validate_dimension(cls, value: str) -> str:
        normalized = normalize_key(value)
        if normalized not in OFFICIAL_DIMENSIONS:
            raise ValueError("dimension must be an official compatibility dimension")
        return normalized


class CompatibilityPriorityRead(BaseModel):
    id: UUID
    user_id: UUID
    dimension: str
    weight: int
    created_at: datetime
    updated_at: datetime


class CompatibilityDealbreakerUpsert(BaseModel):
    rule_key: str = Field(min_length=1, max_length=80)
    value: str | None = Field(default=None, max_length=120)

    @field_validator("rule_key")
    @classmethod
    def validate_rule_key(cls, value: str) -> str:
        normalized = normalize_key(value)
        if normalized not in OFFICIAL_DEALBREAKERS:
            raise ValueError("rule_key must be an official compatibility dealbreaker")
        return normalized


class CompatibilityDealbreakerRead(BaseModel):
    id: UUID
    user_id: UUID
    rule_key: str
    value: str | None
    created_at: datetime
    updated_at: datetime


class CompatibilityProfileRead(BaseModel):
    questions: list[CompatibilityQuestionRead]
    answers: list[CompatibilityAnswerRead]
    priorities: list[CompatibilityPriorityRead]
    dealbreakers: list[CompatibilityDealbreakerRead]
    completion_percentage: int
