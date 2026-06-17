import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { intentLabels } from "../constants/options";
import type { PreferencePayload } from "../services/preferenceService";
import type { ProfilePayload } from "../services/profileService";
import type { GenderOption, IntentKey } from "../types/profile";

type BasicInfoDraft = {
  publicName: string;
  birthDate: string;
  city: string;
  gender: GenderOption;
  bio: string;
};

type PreferenceDraft = {
  minAge: string;
  maxAge: string;
  distance: string;
  genders: GenderOption[];
  connection: string;
  dealbreakers: string[];
};

type OnboardingState = {
  basicInfo: BasicInfoDraft;
  intent: IntentKey;
  preferences: PreferenceDraft;
  interests: string[];
};

type OnboardingContextValue = OnboardingState & {
  setBasicInfo: (basicInfo: BasicInfoDraft) => void;
  setIntent: (intent: IntentKey) => void;
  setPreferences: (preferences: PreferenceDraft) => void;
  setInterests: (interests: string[]) => void;
  buildProfilePayload: () => ProfilePayload;
  buildPreferencePayload: () => PreferencePayload;
};

const defaultBasicInfo: BasicInfoDraft = {
  publicName: "",
  birthDate: "",
  city: "",
  gender: "Prefiro não informar",
  bio: "",
};

const defaultPreferences: PreferenceDraft = {
  minAge: "23",
  maxAge: "34",
  distance: "25",
  genders: ["Mulher"],
  connection: "Relacionamento",
  dealbreakers: ["Falta de respeito"],
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

type OnboardingProviderProps = {
  children: ReactNode;
};

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [basicInfo, setBasicInfo] = useState<BasicInfoDraft>(defaultBasicInfo);
  const [intent, setIntent] = useState<IntentKey>("serious");
  const [preferences, setPreferences] =
    useState<PreferenceDraft>(defaultPreferences);
  const [interests, setInterests] = useState<string[]>(["tecnologia", "cafés"]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      basicInfo,
      intent,
      preferences,
      interests,
      setBasicInfo,
      setIntent,
      setPreferences,
      setInterests,
      buildProfilePayload: () => ({
        display_name: basicInfo.publicName.trim(),
        bio: emptyToNull(basicInfo.bio),
        birth_date: toApiDate(basicInfo.birthDate),
        gender: emptyToNull(basicInfo.gender),
        city: emptyToNull(basicInfo.city),
        country: "Brasil",
        intention: intentLabels[intent],
        is_visible: true,
        interests,
      }),
      buildPreferencePayload: () => ({
        min_age: toBoundedAge(preferences.minAge, 18),
        max_age: toBoundedAge(preferences.maxAge, 120),
        city: emptyToNull(basicInfo.city),
        gender: preferences.genders[0] ?? null,
        intention: preferences.connection,
        interests,
      }),
    }),
    [basicInfo, intent, preferences, interests],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding deve ser usado dentro de OnboardingProvider");
  }

  return context;
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toApiDate(value: string) {
  const trimmed = value.trim();
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);

  if (!match) {
    return emptyToNull(trimmed);
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function toBoundedAge(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(18, Math.min(120, parsed));
}
