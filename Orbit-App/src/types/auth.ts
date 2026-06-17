import type { CurrentUser, RegisterPayload } from "../services/authService";
import type { PreferencePayload, PreferenceRead } from "../services/preferenceService";
import type { ProfilePayload, ProfileRead } from "../services/profileService";

export type AuthStatus = "signedOut" | "onboarding" | "signedIn";

export type AuthContextShape = {
  token: string | null;
  user: CurrentUser | null;
  profile: ProfileRead | null;
  preferences: PreferenceRead | null;
  loading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => void;
  loadCurrentUser: () => Promise<void>;
  clearError: () => void;
  completeOnboarding: (
    profilePayload: ProfilePayload,
    preferencePayload: PreferencePayload,
  ) => Promise<void>;
};
