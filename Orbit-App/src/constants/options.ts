import type { IntentMode, LegacyIntention } from "../types/profile";

export const intentModeLabels: Record<IntentMode, string> = {
  SERIOUS: "Construir algo sério",
  EXPLORING: "Ainda estou descobrindo",
  CASUAL: "Algo casual",
};

export const intentModeOptions: IntentMode[] = ["SERIOUS", "EXPLORING", "CASUAL"];

export const legacyIntentionByMode: Record<IntentMode, LegacyIntention> = {
  SERIOUS: "serious",
  EXPLORING: "exploring",
  CASUAL: "casual",
};

export const genderOptions = [
  "Mulher",
  "Homem",
  "Pessoa não binária",
  "Prefiro não informar",
] as const;

export const connectionOptions = intentModeOptions;

export const ageOptions = Array.from({ length: 68 }, (_, index) => String(index + 18));

export const distanceOptions = [
  "1",
  "5",
  "10",
  "25",
  "50",
  "100",
  "250",
  "500",
  "1000",
  "20000",
] as const;

export function getDistanceLabel(distance: string) {
  return distance === "20000" ? "1000+ km" : `${distance} km`;
}

export function getIntentLabel(intent: string | null | undefined) {
  return intentModeLabels[getIntentMode(intent)];
}

export function getIntentMode(intent: string | null | undefined): IntentMode {
  const normalized = intent?.trim().toUpperCase();
  if (normalized === "SERIOUS" || normalized === "EXPLORING" || normalized === "CASUAL") {
    return normalized;
  }
  return "SERIOUS";
}
