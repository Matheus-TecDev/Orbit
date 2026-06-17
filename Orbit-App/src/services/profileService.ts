import { apiRequest } from "./apiClient";

export type ProfilePayload = {
  display_name: string;
  bio?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  city?: string | null;
  country?: string | null;
  intention?: string | null;
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
