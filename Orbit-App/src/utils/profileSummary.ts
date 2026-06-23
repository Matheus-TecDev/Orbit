import { getIntentLabel } from "../constants/options";
import { interestOptions } from "../constants/interests";
import type { CurrentUser } from "../services/authService";
import type { PreferenceRead } from "../services/preferenceService";
import type { ProfileRead } from "../services/profileService";

export function getAge(birthDate: string | null | undefined) {
  if (!birthDate) {
    return null;
  }

  const parsed = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  const hasNotHadBirthday =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age;
}

export function getProfileName(profile: ProfileRead | null, user: CurrentUser | null) {
  return profile?.display_name ?? user?.full_name ?? "Perfil Orbit";
}

export function getProfileMeta(profile: ProfileRead | null) {
  const age = getAge(profile?.birth_date);
  const pieces = [age ? `${age} anos` : null, profile?.city ?? null].filter(Boolean);

  return pieces.length > 0 ? pieces.join(" · ") : "Dados pessoais incompletos";
}

export function getInterestLabel(value: string) {
  return interestOptions.find((option) => option.value === value)?.label ?? value;
}

export function buildListSummary(
  values: readonly string[],
  emptyText: string,
  maxItems = 3,
) {
  if (values.length === 0) {
    return emptyText;
  }

  const labels = values.slice(0, maxItems).map(getInterestLabel);
  const remaining = values.length - labels.length;

  return remaining > 0 ? `${labels.join(", ")} e mais ${remaining}` : labels.join(", ");
}

export function summarizeBio(bio: string | null | undefined) {
  if (!bio?.trim()) {
    return "Bio ainda não preenchida.";
  }

  const trimmed = bio.trim();
  return trimmed.length > 110 ? `${trimmed.slice(0, 107).trim()}...` : trimmed;
}

export function buildPreferenceSummary(
  preferences: PreferenceRead | null,
  profileIntention: string | null | undefined,
) {
  if (!preferences) {
    return "Preferências ainda não criadas.";
  }

  const pieces = [`${preferences.min_age}-${preferences.max_age} anos`];

  if (preferences.preferred_genders.length > 0) {
    pieces.push(preferences.preferred_genders.join(", "));
  }

  if (preferences.city) {
    pieces.push(preferences.city);
  }

  if (preferences.max_distance_km !== null && preferences.max_distance_km !== undefined) {
    pieces.push(`${preferences.max_distance_km} km`);
  }

  if (preferences.intention && preferences.intention !== profileIntention) {
    pieces.push(getIntentLabel(preferences.intention));
  }

  return pieces.join(" · ");
}

type CompletionInput = {
  profile: ProfileRead | null;
  preferences: PreferenceRead | null;
  compatibilityProgress: number | null;
};

export function calculateProfileCompletion({
  profile,
  preferences,
  compatibilityProgress,
}: CompletionInput) {
  const checks = [
    { done: Boolean(profile?.display_name), suggestion: "Adicione seu nome público." },
    { done: Boolean(profile?.birth_date), suggestion: "Informe sua data de nascimento." },
    { done: Boolean(profile?.city), suggestion: "Informe sua cidade." },
    { done: Boolean(profile?.intent_mode), suggestion: "Escolha sua intenção." },
    {
      done: Boolean(profile?.interests && profile.interests.length >= 3),
      suggestion: "Adicione pelo menos 3 interesses.",
    },
    { done: Boolean(profile?.bio), suggestion: "Escreva uma bio curta." },
    { done: Boolean(profile?.photo_url), suggestion: "Adicione fotos quando o upload estiver disponível." },
    { done: Boolean(preferences), suggestion: "Complete suas preferências." },
    {
      done: Boolean(compatibilityProgress && compatibilityProgress >= 50),
      suggestion: "Responda perguntas de compatibilidade.",
    },
  ];
  const doneCount = checks.filter((item) => item.done).length;

  return {
    percentage: Math.round((doneCount / checks.length) * 100),
    suggestions: checks.filter((item) => !item.done).map((item) => item.suggestion),
  };
}
