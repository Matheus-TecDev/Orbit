import type { ChatPreview } from "../types/chat";

export const mockChats: ChatPreview[] = [
  {
    id: "chat-1",
    userId: "1",
    name: "Lara",
    lastMessage: "Café e cinema é um plano forte.",
    time: "20:14",
    unread: true,
    online: true,
    aiSuggestion: "Também gosto desse combo. Qual filme você escolheria hoje?",
    messages: [
      {
        id: "m1",
        author: "match",
        text: "Vi que a gente combinou bastante em filmes.",
        time: "20:08",
      },
      {
        id: "m2",
        author: "me",
        text: "Sim, e cafés também apareceram em comum.",
        time: "20:10",
      },
      {
        id: "m3",
        author: "match",
        text: "Café e cinema é um plano forte.",
        time: "20:14",
      },
    ],
  },
  {
    id: "chat-2",
    userId: "2",
    name: "Bianca",
    lastMessage: "Praia no fim da tarde sempre funciona.",
    time: "18:42",
    unread: false,
    online: false,
    aiSuggestion: "Concordo. Você prefere algo mais tranquilo ou música ao vivo?",
    messages: [
      {
        id: "m1",
        author: "me",
        text: "Você parece curtir planos mais espontâneos.",
        time: "18:33",
      },
      {
        id: "m2",
        author: "match",
        text: "Praia no fim da tarde sempre funciona.",
        time: "18:42",
      },
    ],
  },
  {
    id: "chat-3",
    userId: "3",
    name: "Camila",
    lastMessage: "Jogos cooperativos contam muito.",
    time: "Ontem",
    unread: true,
    online: true,
    aiSuggestion: "Qual jogo cooperativo você recomendaria para começar?",
    messages: [
      {
        id: "m1",
        author: "match",
        text: "Jogos cooperativos contam muito.",
        time: "Ontem",
      },
    ],
  },
];
