import { apiRequest } from "./apiClient";

export type ReportPayload = {
  reason?: string | null;
  details?: string | null;
};

export async function blockUser(userId: string, token: string) {
  return apiRequest<unknown>(`/safety/block/${userId}`, {
    method: "POST",
    token,
  });
}

export async function reportUser(
  userId: string,
  payload: ReportPayload,
  token: string,
) {
  return apiRequest<unknown>(`/safety/report/${userId}`, {
    method: "POST",
    body: payload,
    token,
  });
}
