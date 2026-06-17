import type { IntentKey } from "../types/profile";

export const intentLabels: Record<IntentKey, string> = {
  serious: "Relacionamento sério",
  casual: "Algo casual",
  friends: "Amizades",
  exploring: "Ainda estou descobrindo",
};

export const genderOptions = [
  "Mulher",
  "Homem",
  "Pessoa não binária",
  "Prefiro não informar",
] as const;

export const connectionOptions = [
  "Relacionamento",
  "Casual",
  "Amizade",
  "Compatibilidade alta",
] as const;

export const dealbreakerOptions = [
  "Falta de respeito",
  "Objetivos incompatíveis",
  "Rotina muito distante",
  "Pouca comunicação",
] as const;
