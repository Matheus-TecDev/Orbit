import { apiRequest } from "./apiClient";
import type {
  CompatibilityAnswerPayload,
  CompatibilityAnswerRead,
  CompatibilityDealbreakerPayload,
  CompatibilityDealbreakerRead,
  CompatibilityPriorityPayload,
  CompatibilityPriorityRead,
  CompatibilityProfileRead,
  CompatibilityQuestion,
} from "../types/compatibility";

export async function getCompatibilityQuestions(token: string) {
  return apiRequest<CompatibilityQuestion[]>("/compatibility/questions", {
    method: "GET",
    token,
  });
}

export async function getMyCompatibilityProfile(token: string) {
  return apiRequest<CompatibilityProfileRead>("/compatibility/me", {
    method: "GET",
    token,
  });
}

export async function saveCompatibilityAnswers(
  token: string,
  answers: CompatibilityAnswerPayload[],
) {
  return apiRequest<CompatibilityAnswerRead[]>("/compatibility/answers", {
    method: "PUT",
    body: answers,
    token,
  });
}

export async function saveCompatibilityPriorities(
  token: string,
  priorities: CompatibilityPriorityPayload[],
) {
  return apiRequest<CompatibilityPriorityRead[]>("/compatibility/priorities", {
    method: "PUT",
    body: priorities,
    token,
  });
}

export async function saveCompatibilityDealbreakers(
  token: string,
  dealbreakers: CompatibilityDealbreakerPayload[],
) {
  return apiRequest<CompatibilityDealbreakerRead[]>("/compatibility/dealbreakers", {
    method: "PUT",
    body: dealbreakers,
    token,
  });
}
