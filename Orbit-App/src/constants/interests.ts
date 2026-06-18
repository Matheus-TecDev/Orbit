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
    title: "Tecnologia e estudos",
    subtitle: "Curiosidades, aprendizado e assuntos que rendem conversa.",
    options: [
      { value: "tecnologia", label: "Tecnologia" },
      { value: "dados e IA", label: "Dados e IA" },
      { value: "ciência", label: "Ciência" },
      { value: "design", label: "Design" },
      { value: "idiomas", label: "Idiomas" },
    ],
  },
  {
    title: "Cultura e entretenimento",
    subtitle: "Gostos que ajudam a descobrir programas em comum.",
    options: [
      { value: "cinema", label: "Cinema" },
      { value: "música ao vivo", label: "Música ao vivo" },
      { value: "livros", label: "Livros" },
      { value: "podcasts", label: "Podcasts" },
      { value: "arte e museus", label: "Arte e museus" },
    ],
  },
  {
    title: "Saúde e esportes",
    subtitle: "Ritmo, energia e formas de cuidar da rotina.",
    options: [
      { value: "corrida", label: "Corrida" },
      { value: "academia", label: "Academia" },
      { value: "yoga", label: "Yoga" },
      { value: "trilhas", label: "Trilhas" },
      { value: "autocuidado", label: "Autocuidado" },
    ],
  },
  {
    title: "Estilo de vida",
    subtitle: "Preferências do dia a dia e jeito de aproveitar o tempo.",
    options: [
      { value: "cafés tranquilos", label: "Cafés tranquilos" },
      { value: "cozinhar em casa", label: "Cozinhar em casa" },
      { value: "vida noturna", label: "Vida noturna" },
      { value: "minimalismo", label: "Minimalismo" },
      { value: "novos restaurantes", label: "Novos restaurantes" },
    ],
  },
  {
    title: "Viagens e social",
    subtitle: "Planos fora da rotina e formas de convivência.",
    options: [
      { value: "viagens curtas", label: "Viagens curtas" },
      { value: "praia", label: "Praia" },
      { value: "eventos pequenos", label: "Eventos pequenos" },
      { value: "voluntariado", label: "Voluntariado" },
      { value: "família presente", label: "Família presente" },
    ],
  },
  {
    title: "Carreira",
    subtitle: "Ambição, projetos e momento de trabalho.",
    options: [
      { value: "empreendedorismo", label: "Empreendedorismo" },
      { value: "carreira em crescimento", label: "Carreira em crescimento" },
      { value: "estabilidade", label: "Estabilidade" },
      { value: "criatividade", label: "Criatividade" },
      { value: "produto digital", label: "Produto digital" },
    ],
  },
] as const;

export const interestOptions = interestCategories.flatMap((category) => category.options);
