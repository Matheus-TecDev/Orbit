import { apiFormRequest } from "./apiClient";
import type { ProfileRead } from "./profileService";

export type LocalProfilePhoto = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export async function uploadProfilePhoto(photo: LocalProfilePhoto, token: string) {
  const formData = new FormData();
  formData.append("file", {
    uri: photo.uri,
    name: photo.fileName ?? "foto-perfil.jpg",
    type: photo.mimeType ?? "image/jpeg",
  } as unknown as Blob);

  return apiFormRequest<ProfileRead>("/profiles/me/photo", {
    method: "POST",
    body: formData,
    token,
  });
}
