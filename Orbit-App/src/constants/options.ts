import type { IntentKey } from "../types/profile";

export const intentLabels: Record<IntentKey, string> = {
  serious: "Relacionamento sério",
  casual: "Algo casual",
  exploring: "Ainda estou descobrindo",
};

export const intentOptions: IntentKey[] = ["serious", "casual", "exploring"];

export const genderOptions = [
  "Mulher",
  "Homem",
  "Pessoa não binária",
  "Prefiro não informar",
] as const;

export const connectionOptions = intentOptions;

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
  const normalized = intent?.trim().toLowerCase();

  if (normalized === "serious" || normalized === "casual" || normalized === "exploring") {
    return intentLabels[normalized];
  }

  return intentLabels.exploring;
}
