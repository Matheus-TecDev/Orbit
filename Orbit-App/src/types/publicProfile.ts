import type {
  RecommendationReasonGroup,
  RecommendationScoreBreakdown,
} from "./recommendation";
import type { IntentMode } from "./profile";

export type PublicProfileCompatibility = {
  mutual_score: number;
  coverage_percentage: number;
  common_interests: string[];
  score_breakdown: RecommendationScoreBreakdown | null;
  reason_groups: RecommendationReasonGroup[];
};

export type PublicProfileRead = {
  profile_id: string;
  user_id: string;
  name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  photo_url: string | null;
  intent_mode: IntentMode;
  interests: string[];
  compatibility: PublicProfileCompatibility | null;
};
