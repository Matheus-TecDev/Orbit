import { apiRequest } from "./apiClient";
import {
  mapApiMatchToListItem,
  type ApiMatch,
  type MatchListItem,
} from "../types/match";

export async function getMatches(token: string) {
  return apiRequest<ApiMatch[]>("/matches", {
    method: "GET",
    token,
  });
}

export async function getMatchList(token: string) {
  const matches = await getMatches(token);
  return matches.map<MatchListItem>((match, index) =>
    mapApiMatchToListItem(match, index),
  );
}

export async function likeProfile(profileId: string, token: string) {
  return apiRequest<ApiMatch>(`/matches/like/${profileId}`, {
    method: "POST",
    token,
  });
}

export async function passProfile(profileId: string, token: string) {
  return apiRequest<ApiMatch>(`/matches/pass/${profileId}`, {
    method: "POST",
    token,
  });
}
