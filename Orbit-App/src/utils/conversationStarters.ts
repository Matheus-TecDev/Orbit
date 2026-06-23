import { getIntentMode } from "../constants/options";
import type { IntentMode } from "../types/profile";
import type { RecommendationReasonGroup } from "../types/recommendation";

export type ConversationStarterSource = "interest" | "reason" | "intent" | "fallback";

export type ConversationStarter = {
  id: string;
  text: string;
  source: ConversationStarterSource;
  category?: string;
};

export type ConversationStarterInput = {
  interests?: string[];
  commonInterests?: string[];
  reasonGroups?: RecommendationReasonGroup[];
  intentMode?: IntentMode | string | null;
};

const starterByInterest: Record<string, string[]> = {
  viagem: ["Qual viagem mais te marcou?", "Próximo destino ideal?"],
  viagens: ["Qual viagem mais te marcou?", "Próximo destino ideal?"],
  tecnologia: ["O que você está estudando?", "Qual tecnologia te anima?"],
  academia: ["Treino por saúde ou desafio?", "Qual treino você mais curte?"],
  fitness: ["Treino por saúde ou desafio?", "Qual treino você mais curte?"],
  música: ["Qual música não sai da cabeça?", "Show ou playlist em casa?"],
  musica: ["Qual música não sai da cabeça?", "Show ou playlist em casa?"],
  cinema: ["Filme leve ou intenso?", "Qual filme você reassistiria?"],
  leitura: ["Qual livro te marcou?", "Ficção ou não ficção?"],
  gastronomia: ["Qual prato você ama?", "Cozinhar ou descobrir lugares?"],
  café: ["Café em casa ou cafeteria?", "Qual café salva seu dia?"],
  cafe: ["Café em casa ou cafeteria?", "Qual café salva seu dia?"],
  trilhas: ["Trilha leve ou aventura?", "Qual lugar ao ar livre te chama?"],
  dança: ["Qual ritmo te anima?", "Dançar ou só curtir a música?"],
  danca: ["Qual ritmo te anima?", "Dançar ou só curtir a música?"],
  arte: ["Qual arte te prende?", "Museu ou rua?"],
  games: ["Qual jogo te prende hoje?", "Coop ou competitivo?"],
};

const starterByReasonCategory: Record<string, string[]> = {
  future: ["Como seria seu futuro ideal?", "O que você quer construir?"],
  communication: ["Como você gosta de conversar?", "Mensagem ou ligação?"],
  lifestyle: ["Fim de semana ideal?", "Rotina calma ou agitada?"],
  personality: ["O que te dá energia?", "Você improvisa ou planeja?"],
  priorities: ["O que mais importa hoje?", "Qual prioridade te move?"],
  preferences: ["O que faz um encontro fluir?", "Encontro simples ou diferente?"],
  intent: ["O que você busca agora?", "O que te faria querer repetir?"],
};

const starterByMode: Record<IntentMode, string[]> = {
  SERIOUS: [
    "O que você quer construir?",
    "Como seria seu domingo ideal?",
    "O que faz você confiar em alguém?",
  ],
  EXPLORING: [
    "O que te surpreende em alguém?",
    "Qual hobby ocupa seu tempo?",
    "Como seria seu fim de semana ideal?",
  ],
  CASUAL: [
    "Plano leve ou espontâneo?",
    "Qual rolê combina com você?",
    "O que anima sua semana?",
  ],
};

const fallbackStarters = [
  "Como seria seu fim de semana ideal?",
  "Qual hobby ocupa seu tempo?",
  "O que você está estudando?",
  "Qual viagem mais te marcou?",
];

export function buildConversationStarters(input: ConversationStarterInput) {
  const starters: ConversationStarter[] = [];
  const mode = getIntentMode(input.intentMode);
  const interestCandidates = unique([
    ...(input.commonInterests ?? []),
    ...(input.interests ?? []),
  ]);

  interestCandidates.forEach((interest) => {
    const normalized = normalize(interest);
    const templates = starterByInterest[normalized];
    if (!templates) {
      starters.push({
        id: `interest-${normalized}`,
        text: `Como ${shortenInterest(interest)} entrou na sua vida?`,
        source: "interest",
        category: interest,
      });
      return;
    }
    templates.forEach((text, index) => {
      starters.push({
        id: `interest-${normalized}-${index}`,
        text,
        source: "interest",
        category: interest,
      });
    });
  });

  (input.reasonGroups ?? []).forEach((group) => {
    (starterByReasonCategory[group.category] ?? []).forEach((text, index) => {
      starters.push({
        id: `reason-${group.category}-${index}`,
        text,
        source: "reason",
        category: group.category,
      });
    });
  });

  starterByMode[mode].forEach((text, index) => {
    starters.push({ id: `intent-${mode}-${index}`, text, source: "intent" });
  });

  fallbackStarters.forEach((text, index) => {
    starters.push({ id: `fallback-${index}`, text, source: "fallback" });
  });

  return uniqueByText(starters).slice(0, 9);
}

export function hasEnoughStarterContext(input: ConversationStarterInput) {
  return Boolean(
    input.intentMode ||
      (input.interests?.length ?? 0) > 0 ||
      (input.commonInterests?.length ?? 0) > 0 ||
      (input.reasonGroups?.length ?? 0) > 0,
  );
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function shortenInterest(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 18 ? trimmed.slice(0, 18).trim() : trimmed;
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function uniqueByText(starters: ConversationStarter[]) {
  const seen = new Set<string>();
  return starters.filter((starter) => {
    const key = normalize(starter.text);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
