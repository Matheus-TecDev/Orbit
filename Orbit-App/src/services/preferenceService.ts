import { apiRequest } from "./apiClient";

export type PreferencePayload = {
  min_age?: number;
  max_age?: number;
  city?: string | null;
  gender?: string | null;
  intention?: string | null;
  interests?: string[];
};

export type PreferenceRead = {
  id: string;
  user_id: string;
  min_age: number;
  max_age: number;
  city: string | null;
  gender: string | null;
  intention: string | null;
  interests: string[];
  created_at: string;
  updated_at: string;
};

export async function createPreference(payload: PreferencePayload, token: string) {
  return apiRequest<PreferenceRead>("/preferences", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function getPreference(token: string) {
  return apiRequest<PreferenceRead>("/preferences/me", {
    method: "GET",
    token,
  });
}

export async function updatePreference(
  payload: Partial<PreferencePayload>,
  token: string,
) {
  return apiRequest<PreferenceRead>("/preferences/me", {
    method: "PATCH",
    body: payload,
    token,
  });
}
