import type { IntentMode } from "./profile";

export type OrbitUser = {
  id: string;
  name: string;
  age: number;
  city: string;
  intentMode: IntentMode;
  bio: string;
  interests: string[];
  photoColor: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  age: number;
  city: string;
  intentMode: IntentMode;
  bio: string;
  interests: string[];
  profileProgress: number;
};
