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

export function getIntentLabel(intent: string | null | undefined) {
  const normalized = intent?.trim().toLowerCase();

  if (normalized === "serious" || normalized === "casual" || normalized === "exploring") {
    return intentLabels[normalized];
  }

  return intentLabels.exploring;
}
