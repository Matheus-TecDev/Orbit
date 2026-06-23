export type InterestOption = {
  value: string;
  label: string;
};

export type InterestCategory = {
  title: string;
  subtitle: string;
  options: readonly InterestOption[];
};

export const interestCategories: readonly InterestCategory[] = [
  {
    title: "Tecnologia",
    subtitle: "Tecnologia, inovação e interesses digitais.",
    options: [
      { value: "programação", label: "Programação" },
      { value: "games", label: "Games" },
      { value: "inteligência artificial", label: "Inteligência Artificial" },
      { value: "tecnologia", label: "Tecnologia" },
      { value: "empreendedorismo", label: "Empreendedorismo" },
      { value: "startups", label: "Startups" },
      { value: "gadgets", label: "Gadgets" },
      { value: "cybersegurança", label: "Cybersegurança" },
    ],
  },
  {
    title: "Música e entretenimento",
    subtitle: "O que você gosta de ouvir e assistir.",
    options: [
      { value: "pagode", label: "Pagode" },
      { value: "sertanejo", label: "Sertanejo" },
      { value: "trap e rap", label: "Trap e Rap" },
      { value: "rock", label: "Rock" },
      { value: "mpb", label: "MPB" },
      { value: "shows", label: "Shows" },
      { value: "séries", label: "Séries" },
      { value: "filmes", label: "Filmes" },
      { value: "anime", label: "Anime" },
    ],
  },
  {
    title: "Estilo de vida",
    subtitle: "Como você aproveita seu tempo e cuida da rotina.",
    options: [
      { value: "academia", label: "Academia" },
      { value: "corrida", label: "Corrida" },
      { value: "futebol", label: "Futebol" },
      { value: "crossfit", label: "Crossfit" },
      { value: "caminhadas", label: "Caminhadas" },
      { value: "praia", label: "Praia" },
      { value: "viagens", label: "Viagens" },
      { value: "cafeterias", label: "Cafeterias" },
      { value: "churrasco social", label: "Churrasco" },
      { value: "vida noturna", label: "Vida noturna" },
    ],
  },
  {
    title: "Gastronomia",
    subtitle: "Comidas, bebidas e experiências gastronômicas.",
    options: [
      { value: "hambúrguer", label: "Hambúrguer" },
      { value: "churrasco", label: "Churrasco" },
      { value: "comida japonesa", label: "Comida japonesa" },
      { value: "pizza", label: "Pizza" },
      { value: "cozinhar", label: "Cozinhar" },
      { value: "café", label: "Café" },
      { value: "doces", label: "Doces" },
      { value: "restaurantes", label: "Restaurantes" },
    ],
  },
  {
    title: "Relacionamentos e valores",
    subtitle: "Temas importantes para sua vida e futuro.",
    options: [
      { value: "família", label: "Família" },
      { value: "animais", label: "Animais" },
      { value: "espiritualidade", label: "Espiritualidade" },
      { value: "desenvolvimento pessoal", label: "Desenvolvimento pessoal" },
      { value: "carreira", label: "Carreira" },
      { value: "estabilidade financeira", label: "Estabilidade financeira" },
      { value: "filhos", label: "Filhos" },
    ],
  },
  {
    title: "Cultura e aprendizado",
    subtitle: "Curiosidade, conhecimento e experiências culturais.",
    options: [
      { value: "leitura", label: "Leitura" },
      { value: "história", label: "História" },
      { value: "arte", label: "Arte" },
      { value: "museus", label: "Museus" },
      { value: "fotografia", label: "Fotografia" },
      { value: "idiomas", label: "Idiomas" },
    ],
  },
] as const;

export const interestOptions = interestCategories.flatMap((category) => category.options);
