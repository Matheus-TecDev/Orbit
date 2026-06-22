import { apiRequest } from "./apiClient";
import type { IntentMode, LegacyIntention } from "../types/profile";

export type ProfilePayload = {
  display_name: string;
  bio?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  city?: string | null;
  country?: string | null;
  intention?: LegacyIntention | null;
  intent_mode?: IntentMode | null;
  photo_url?: string | null;
  is_visible?: boolean;
  interests?: string[];
};

export type ProfileRead = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  birth_date: string | null;
  gender: string | null;
  city: string | null;
  country: string | null;
  intention: string | null;
  intent_mode: IntentMode;
  photo_url: string | null;
  is_visible: boolean;
  interests: string[];
  created_at: string;
  updated_at: string;
};

export async function createProfile(payload: ProfilePayload, token: string) {
  return apiRequest<ProfileRead>("/profiles", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function getProfile(token: string) {
  return apiRequest<ProfileRead>("/profiles/me", {
    method: "GET",
    token,
  });
}

export async function updateProfile(
  payload: Partial<ProfilePayload>,
  token: string,
) {
  return apiRequest<ProfileRead>("/profiles/me", {
    method: "PATCH",
    body: payload,
    token,
  });
}
