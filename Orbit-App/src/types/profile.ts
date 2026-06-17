export type IntentKey = "serious" | "casual" | "friends" | "exploring";

export type GenderOption =
  | "Mulher"
  | "Homem"
  | "Pessoa não binária"
  | "Prefiro não informar";

export type BasicProfile = {
  publicName: string;
  birthDate: string;
  city: string;
  gender: GenderOption;
  bio: string;
};

export type ProfilePreference = {
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  interestedGenders: GenderOption[];
  connectionType: string;
  dealbreakers: string[];
};

export type CompatibilityQuestion = {
  id: string;
  text: string;
};

export type UserPhotoSlot = {
  id: string;
  label: string;
  isPrimary: boolean;
  filled: boolean;
};
