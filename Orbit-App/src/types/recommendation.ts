import type { IntentKey } from "./profile";
import type { OrbitUser } from "./user";

export type UserRecommendation = OrbitUser & {
  profileId: string;
  isApiBacked: boolean;
  compatibility: number;
  commonInterests: string[];
  reasons: string[];
};

export type ApiRecommendation = {
  profile_id: string;
  display_name: string;
  bio: string | null;
  age: number | null;
  city: string | null;
  intention: string | null;
  interests: string[];
  score: number;
  reasons: string[];
};

const fallbackColors = ["#7A1F32", "#53354A", "#3F3B6C", "#5E2C46"] as const;

export function mapApiRecommendationToFeedUser(
  recommendation: ApiRecommendation,
  index: number,
): UserRecommendation {
  const interests = recommendation.interests ?? [];

  return {
    id: recommendation.profile_id,
    profileId: recommendation.profile_id,
    isApiBacked: true,
    name: recommendation.display_name,
    age: recommendation.age ?? 18,
    city: recommendation.city ?? "Cidade não informada",
    intent: mapApiIntentionToIntentKey(recommendation.intention),
    bio: recommendation.bio ?? "Bio ainda não preenchida.",
    interests,
    photoColor: fallbackColors[index % fallbackColors.length],
    distanceKm: 0,
    compatibility: clampScore(recommendation.score),
    commonInterests: interests.slice(0, 4),
    reasons:
      recommendation.reasons.length > 0
        ? recommendation.reasons
        : ["Compatibilidade calculada pelo Orbit"],
  };
}

function mapApiIntentionToIntentKey(intention: string | null): IntentKey {
  const normalized = (intention ?? "").trim().toLowerCase();

  if (normalized === "casual") {
    return "casual";
  }

  if (normalized === "exploring") {
    return "exploring";
  }

  return "serious";
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
