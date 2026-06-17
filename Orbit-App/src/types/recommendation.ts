import type { OrbitUser } from "./user";
import type { IntentKey } from "./profile";

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

const fallbackColors = ["#B91C1C", "#9D174D", "#7F1D1D", "#991B1B"] as const;

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
        : ["Compatibilidade calculada pela API do Orbit AI"],
  };
}

function mapApiIntentionToIntentKey(intention: string | null): IntentKey {
  const normalized = (intention ?? "").toLowerCase();

  if (normalized.includes("casual")) {
    return "casual";
  }

  if (normalized.includes("amiz")) {
    return "friends";
  }

  if (normalized.includes("descobr")) {
    return "exploring";
  }

  return "serious";
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
