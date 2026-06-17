import { apiRequest } from "./apiClient";
import {
  mapApiRecommendationToFeedUser,
  type ApiRecommendation,
  type UserRecommendation,
} from "../types/recommendation";

export async function getRecommendations(token: string) {
  return apiRequest<ApiRecommendation[]>("/recommendations", {
    method: "GET",
    token,
  });
}

export async function getFeedRecommendations(token: string) {
  const recommendations = await getRecommendations(token);
  return recommendations.map<UserRecommendation>((recommendation, index) =>
    mapApiRecommendationToFeedUser(recommendation, index),
  );
}
