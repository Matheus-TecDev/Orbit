import { apiRequest } from "./apiClient";
import type { PublicProfileRead } from "../types/publicProfile";

export async function getPublicProfile(profileId: string, token: string) {
  return apiRequest<PublicProfileRead>(`/profiles/${profileId}/public`, {
    method: "GET",
    token,
  });
}
