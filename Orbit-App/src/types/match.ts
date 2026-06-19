import type { ProfileRead } from "../services/profileService";

export type ApiMatch = {
  id: string;
  status: string;
  target_profile: ProfileRead;
  chat_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchListItem = {
  id: string;
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  status: string;
  chatId: string | null;
  compatibility: number;
  photoColor: string;
  isNew: boolean;
};

const fallbackColors = ["#7C5CFC", "#5B7FFF", "#2DD4BF", "#E85B7A"] as const;

export function mapApiMatchToListItem(
  match: ApiMatch,
  index: number,
): MatchListItem {
  return {
    id: match.id,
    userId: match.target_profile.id,
    name: match.target_profile.display_name,
    age: getAge(match.target_profile.birth_date),
    city: match.target_profile.city,
    status: match.status,
    chatId: match.chat_id,
    compatibility: getCompatibilityFromStatus(match.status),
    photoColor: fallbackColors[index % fallbackColors.length],
    isNew: index === 0,
  };
}

function getCompatibilityFromStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("match")) {
    return 100;
  }

  return 87;
}

function getAge(birthDate: string | null) {
  if (!birthDate) {
    return null;
  }

  const parsed = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  const hasNotHadBirthday =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age;
}
