export const mockInterests = [
  "tecnologia",
  "música",
  "academia",
  "filmes",
  "viagens",
  "jogos",
  "leitura",
  "festas",
  "cafés",
  "praia",
  "pets",
  "carreira",
] as const;

export type MockInterest = (typeof mockInterests)[number];
