import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CompatibilityPayload } from "../types/compatibility";
import type { PreferencePayload } from "../services/preferenceService";
import type { ProfilePayload } from "../services/profileService";
import type { GenderOption, IntentKey } from "../types/profile";
import { parseBirthDateToApi } from "../utils/dateMask";

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
};

type OnboardingState = {
  basicInfo: BasicInfoDraft;
  intent: IntentKey;
  preferences: PreferenceDraft;
  interests: string[];
  compatibilityAnswers: Record<string, number>;
  compatibilityPriorities: Record<string, number>;
  compatibilityDealbreakers: string[];
};

type OnboardingContextValue = OnboardingState & {
  setBasicInfo: (basicInfo: BasicInfoDraft) => void;
  setIntent: (intent: IntentKey) => void;
  setPreferences: (preferences: PreferenceDraft) => void;
  setInterests: (interests: string[]) => void;
  setCompatibilityAnswers: (answers: Record<string, number>) => void;
  setCompatibilityPriorities: (priorities: Record<string, number>) => void;
  setCompatibilityDealbreakers: (dealbreakers: string[]) => void;
  buildProfilePayload: () => ProfilePayload;
  buildPreferencePayload: () => PreferencePayload;
  buildCompatibilityPayload: () => CompatibilityPayload;
};

const defaultBasicInfo: BasicInfoDraft = {
  publicName: "",
  birthDate: "",
  city: "",
  gender: "Prefiro não informar",
  bio: "",
};

const defaultPreferences: PreferenceDraft = {
  minAge: "18",
  maxAge: "85",
  distance: "100",
  genders: [],
};

const defaultInterests = ["tecnologia", "cafés tranquilos"];

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

type OnboardingProviderProps = {
  children: ReactNode;
};

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [basicInfo, setBasicInfo] = useState<BasicInfoDraft>(defaultBasicInfo);
  const [intent, setIntent] = useState<IntentKey>("serious");
  const [preferences, setPreferences] =
    useState<PreferenceDraft>(defaultPreferences);
  const [interests, setInterests] = useState<string[]>(defaultInterests);
  const [compatibilityAnswers, setCompatibilityAnswers] = useState<Record<string, number>>({});
  const [compatibilityPriorities, setCompatibilityPriorities] = useState<Record<string, number>>({});
  const [compatibilityDealbreakers, setCompatibilityDealbreakers] = useState<string[]>([]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      basicInfo,
      intent,
      preferences,
      interests,
      compatibilityAnswers,
      compatibilityPriorities,
      compatibilityDealbreakers,
      setBasicInfo,
      setIntent,
      setPreferences,
      setInterests,
      setCompatibilityAnswers,
      setCompatibilityPriorities,
      setCompatibilityDealbreakers,
      buildProfilePayload: () => ({
        display_name: basicInfo.publicName.trim(),
        bio: null,
        birth_date: toRequiredApiDate(basicInfo.birthDate),
        gender: null,
        city: emptyToNull(basicInfo.city),
        country: "Brasil",
        intention: intent,
        photo_url: null,
        is_visible: true,
        interests,
      }),
      buildPreferencePayload: () => ({
        min_age: toBoundedAge(preferences.minAge, 18),
        max_age: toBoundedAge(preferences.maxAge, 85),
        max_distance_km: toBoundedDistance(preferences.distance),
        city: null,
        gender: null,
        preferred_genders: preferences.genders
          .filter((gender) => gender !== "Prefiro não informar")
          .map(toBackendGender),
        intention: intent,
        interests,
      }),
      buildCompatibilityPayload: () => ({
        answers: Object.entries(compatibilityAnswers).map(([question_key, answer_value]) => ({
          question_key,
          answer_value,
        })),
        priorities: Object.entries(compatibilityPriorities).map(([dimension, weight]) => ({
          dimension,
          weight,
        })),
        dealbreakers: compatibilityDealbreakers.map((rule_key) => ({
          rule_key,
          value: null,
        })),
      }),
    }),
    [
      basicInfo,
      intent,
      preferences,
      interests,
      compatibilityAnswers,
      compatibilityPriorities,
      compatibilityDealbreakers,
    ],
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

function toRequiredApiDate(value: string) {
  const parsed = parseBirthDateToApi(value);
  if (!parsed) {
    throw new Error("Data de nascimento inválida.");
  }

  return parsed;
}

function toBoundedAge(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(18, Math.min(85, parsed));
}

function toBoundedDistance(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 100;
  }

  return Math.max(1, Math.min(20000, parsed));
}

function toBackendGender(gender: GenderOption) {
  const map: Record<GenderOption, string> = {
    Mulher: "mulher",
    Homem: "homem",
    "Pessoa não binária": "pessoa nao binaria",
    "Prefiro não informar": "prefiro nao informar",
  };

  return map[gender];
}
