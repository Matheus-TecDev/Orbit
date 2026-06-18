export type CompatibilityQuestion = {
  id: string;
  key: string;
  dimension: string;
  text: string;
  answer_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CompatibilityAnswerPayload = {
  question_key: string;
  answer_value: number;
};

export type CompatibilityAnswerRead = CompatibilityAnswerPayload & {
  id: string;
  user_id: string;
  dimension: string;
  created_at: string;
  updated_at: string;
};

export type CompatibilityPriorityPayload = {
  dimension: string;
  weight: number;
};

export type CompatibilityPriorityRead = CompatibilityPriorityPayload & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type CompatibilityDealbreakerPayload = {
  rule_key: string;
  value?: string | null;
};

export type CompatibilityDealbreakerRead = CompatibilityDealbreakerPayload & {
  id: string;
  user_id: string;
  value: string | null;
  created_at: string;
  updated_at: string;
};

export type CompatibilityProfileRead = {
  questions: CompatibilityQuestion[];
  answers: CompatibilityAnswerRead[];
  priorities: CompatibilityPriorityRead[];
  dealbreakers: CompatibilityDealbreakerRead[];
  completion_percentage: number;
};

export type CompatibilityPayload = {
  answers: CompatibilityAnswerPayload[];
  priorities: CompatibilityPriorityPayload[];
  dealbreakers: CompatibilityDealbreakerPayload[];
};

export const priorityDimensionOptions = [
  { key: "communication_frequency", label: "Comunicação" },
  { key: "emotional_stability", label: "Estabilidade emocional" },
  { key: "future_plans", label: "Planos de futuro" },
  { key: "routine", label: "Rotina" },
  { key: "ambition", label: "Ambição" },
  { key: "social_life", label: "Vida social" },
  { key: "family", label: "Família" },
  { key: "privacy", label: "Privacidade" },
  { key: "agreeableness", label: "Valores" },
  { key: "personal_space", label: "Liberdade individual" },
  { key: "lifestyle", label: "Estilo de vida" },
] as const;

export const dealbreakerOptions = [
  { key: "wants_children_incompatible", label: "Planos diferentes sobre filhos" },
  { key: "does_not_want_children_incompatible", label: "Expectativas incompatíveis sobre filhos" },
  { key: "smoker", label: "Fumo" },
  { key: "frequent_drinking", label: "Bebida frequente" },
  { key: "long_distance", label: "Distância longa" },
  { key: "casual_only", label: "Busca apenas algo casual" },
  { key: "different_spirituality", label: "Valores espirituais muito diferentes" },
  { key: "incompatible_routine", label: "Rotina incompatível" },
  { key: "poor_communication", label: "Pouca comunicação" },
  { key: "disrespect", label: "Falta de respeito" },
] as const;

export function getDimensionLabel(dimension: string) {
  return priorityDimensionOptions.find((option) => option.key === dimension)?.label ?? dimension;
}
