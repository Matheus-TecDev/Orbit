export type InterestCategory = {
  title: string;
  subtitle: string;
  options: readonly string[];
};

export const interestCategories: readonly InterestCategory[] = [
  {
    title: "Estilo de vida",
    subtitle: "Rotina, jeito de aproveitar o tempo e preferências do dia a dia.",
    options: ["cafés tranquilos", "cozinhar em casa", "vida noturna", "minimalismo", "autocuidado"],
  },
  {
    title: "Cultura e entretenimento",
    subtitle: "Assuntos que ajudam a iniciar boas conversas.",
    options: ["cinema", "música ao vivo", "livros", "podcasts", "arte e museus"],
  },
  {
    title: "Tecnologia e estudos",
    subtitle: "Interesses intelectuais, aprendizado e curiosidade.",
    options: ["tecnologia", "ciência", "design", "idiomas", "dados e IA"],
  },
  {
    title: "Esportes e saúde",
    subtitle: "Como você cuida do corpo e da energia.",
    options: ["corrida", "academia", "yoga", "trilhas", "nutrição"],
  },
  {
    title: "Social e viagens",
    subtitle: "Preferências de convivência e planos fora da rotina.",
    options: ["viagens curtas", "praia", "eventos pequenos", "novos restaurantes", "voluntariado"],
  },
  {
    title: "Pets e família",
    subtitle: "Dinâmicas afetivas que impactam compatibilidade.",
    options: ["pets", "família presente", "planos com filhos", "crianças", "casa cheia"],
  },
  {
    title: "Trabalho e carreira",
    subtitle: "Ambição, foco profissional e projetos pessoais.",
    options: ["empreendedorismo", "carreira em crescimento", "estabilidade", "criatividade", "produto digital"],
  },
] as const;

export const mockInterests = interestCategories.flatMap((category) => category.options);
