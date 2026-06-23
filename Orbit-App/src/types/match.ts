import type { ProfileRead } from "../services/profileService";
import type { ParticipantSummary } from "./chat";

export type ApiMatch = {
  id: string;
  status: string;
  target_profile: ProfileRead;
  other_participant: ParticipantSummary;
  chat_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchListItem = {
  id: string;
  userId: string;
  profileId: string;
  name: string;
  age: number | null;
  city: string | null;
  shortBio: string | null;
  interests: string[];
  photoUrl: string | null;
  intentMode: string | null;
  status: string;
  chatId: string | null;
  photoColor: string;
};

const fallbackColors = ["#7C5CFC", "#5B7FFF", "#2DD4BF", "#E85B7A"] as const;

export function mapApiMatchToListItem(
  match: ApiMatch,
  index: number,
): MatchListItem {
  const participant = match.other_participant;

  return {
    id: match.id,
    userId: participant.user_id,
    profileId: participant.profile_id ?? match.target_profile.id,
    name: participant.name,
    age: participant.age ?? getAge(match.target_profile.birth_date),
    city: participant.city,
    shortBio: participant.short_bio,
    interests: participant.interests,
    photoUrl: participant.photo_url,
    intentMode: participant.intent_mode,
    status: match.status,
    chatId: match.chat_id,
    photoColor: fallbackColors[index % fallbackColors.length],
  };
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
