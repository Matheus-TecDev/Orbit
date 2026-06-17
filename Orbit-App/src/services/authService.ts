import { apiRequest } from "./apiClient";

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type?: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function register(payload: RegisterPayload) {
  return apiRequest<CurrentUser>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest<CurrentUser>("/auth/me", {
    method: "GET",
    token,
  });
}
