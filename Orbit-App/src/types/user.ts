import type { IntentKey } from "./profile";

export type OrbitUser = {
  id: string;
  name: string;
  age: number;
  city: string;
  intent: IntentKey;
  bio: string;
  interests: string[];
  photoColor: string;
  distanceKm: number;
};

export type CurrentUser = {
  id: string;
  name: string;
  age: number;
  city: string;
  intent: IntentKey;
  bio: string;
  interests: string[];
  profileProgress: number;
};
