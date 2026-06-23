import { API_URL } from "../constants/env";

export function resolveMediaUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = API_URL.replace(/\/$/, "");
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${path}`;
}
