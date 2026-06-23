import { getIntentMode } from "../constants/options";
import type { IntentMode } from "./profile";

export type DirectionalMetric = {
  score_a_to_b: number | null;
  score_b_to_a: number | null;
};

export type RecommendationScoreBreakdown = {
  mode_alignment: DirectionalMetric;
  objective_preferences: DirectionalMetric;
  compatibility_answers: DirectionalMetric;
  priorities: DirectionalMetric;
  dealbreaker_penalty: DirectionalMetric;
  mode_penalty: DirectionalMetric;
};

export type RecommendationReasonGroup = {
  category: string;
  reasons: string[];
};

export type UserRecommendation = {
  id: string;
  profileId: string;
  name: string;
  age: number | null;
  city: string | null;
  intentMode: IntentMode;
  bio: string | null;
  interests: string[];
  photoUrl: string | null;
  photoColor: string;
  mutualScore: number;
  scoreAToB: number;
  scoreBToA: number;
  coveragePercentage: number;
  commonInterests: string[];
  scoreBreakdown: RecommendationScoreBreakdown | null;
  reasons: string[];
  reasonGroups: RecommendationReasonGroup[];
};

export type ApiRecommendation = {
  profile_id: string;
  display_name: string;
  bio: string | null;
  age: number | null;
  city: string | null;
  photo_url: string | null;
  intention: string | null;
  intent_mode: IntentMode;
  interests: string[];
  score: number;
  mutual_score: number;
  score_a_to_b: number;
  score_b_to_a: number;
  coverage_percentage: number;
  common_interests: string[];
  score_breakdown: RecommendationScoreBreakdown | null;
  reasons: string[];
  reason_groups: RecommendationReasonGroup[];
};

const fallbackColors = ["#7A1F32", "#53354A", "#3F3B6C", "#5E2C46"] as const;

export function mapApiRecommendationToFeedUser(
  recommendation: ApiRecommendation,
  index: number,
): UserRecommendation {
  return {
    id: recommendation.profile_id,
    profileId: recommendation.profile_id,
    name: recommendation.display_name,
    age: recommendation.age,
    city: recommendation.city,
    intentMode: getIntentMode(recommendation.intent_mode ?? recommendation.intention),
    bio: recommendation.bio,
    interests: recommendation.interests ?? [],
    photoUrl: recommendation.photo_url,
    photoColor: fallbackColors[index % fallbackColors.length],
    mutualScore: clampScore(recommendation.mutual_score),
    scoreAToB: clampScore(recommendation.score_a_to_b),
    scoreBToA: clampScore(recommendation.score_b_to_a),
    coveragePercentage: clampScore(recommendation.coverage_percentage),
    commonInterests: recommendation.common_interests ?? [],
    scoreBreakdown: recommendation.score_breakdown,
    reasons: recommendation.reasons ?? [],
    reasonGroups: recommendation.reason_groups ?? [],
  };
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
