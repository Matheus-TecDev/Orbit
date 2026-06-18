import { apiRequest } from "./apiClient";

export type CityRead = {
  id: string;
  name: string;
  state: string | null;
  country: string;
  created_at: string;
  updated_at: string;
};

export async function getCities(query?: string) {
  const search = query?.trim();
  const suffix = search ? `?q=${encodeURIComponent(search)}` : "";
  return apiRequest<CityRead[]>(`/cities${suffix}`, {
    method: "GET",
  });
}
