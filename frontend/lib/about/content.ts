import type { AboutPageContent } from "@/lib/about/types";

export const aboutPageContent: AboutPageContent = {
  history: {
    heading: "Nossa história",
    paragraphs: [
      "Em 1º de setembro de 2021, perdemos o Gabriel Henrique Fernandes da Silva, de 21 anos, para o suicídio. Ele era filho, amigo, irmão — e deixou uma saudade imensa. A partir dessa dor, nasceu a nossa ONG. Nos unimos para transformar luto em ação, com o objetivo de prevenir que outras vidas sejam perdidas para a depressão. Acreditamos na importância do cuidado profissional, das redes de apoio e do amor.",
      "Queremos acolher, informar e apoiar pessoas que, assim como o Gabriel, podem estar enfrentando momentos difíceis. Se conseguirmos salvar vidas, já teremos honrado a memória dele com muito amor e orgulho.",
    ],
    poster: {
      src: "/images/about/history-video-poster.webp",
      alt: "Cartaz do curta-documentário Sol de Setembro: um girassol contra a luz do sol, com a exibição marcada para 13 de março, às 20h, no auditório do IMECC, na Unicamp.",
      width: 1080,
      height: 1350,
    },
    video: null,
    background: {
      src: "/images/about/history-background.webp",
      alt: "",
      width: 2000,
      height: 1333,
    },
  },
  mission: {
    heading: "Nossa missão",
    paragraphs: [
      "Nossa missão é impedir que outras famílias enfrentem a mesma dor que a família do Gabriel viveu e prevenir que a depressão leve embora pessoas tão incríveis quanto ele.",
      "Fazemos isso promovendo a conscientização, o acolhimento e a educação em saúde mental, criando redes de apoio e espaços seguros onde ninguém precisa enfrentar suas lutas sozinho.",
    ],
    image: {
      src: "/images/about/mission.webp",
      alt: "Um par de luvas de boxe azuis sobre um banquinho vermelho, ao lado de um porta-retrato com a foto de Gabriel sorrindo.",
      width: 1000,
      height: 1333,
    },
  },
  values: {
    heading: "Nossos valores",
    items: [
      { id: "love", label: "Amor", tone: "saffron" },
      { id: "determination", label: "Determinação", tone: "butter" },
      { id: "empathy", label: "Empatia", tone: "soil" },
      { id: "welcome", label: "Acolhimento", tone: "periwinkle" },
      { id: "awareness", label: "Conscientização", tone: "sky" },
      { id: "community", label: "Comunidade", tone: "indigo" },
      { id: "balance", label: "Equilíbrio", tone: "teal" },
    ],
  },
  founders: {
    heading: "Idealizadores",
    names: "Nádia e Clara",
    description:
      "Há muitos motivos para se sentir para baixo e começar a ficar deprimido com a sua situação.",
    portrait: {
      src: "/images/about/founders.webp",
      alt: "Nádia e Clara sorriem segurando o cartaz da ONG Gabriel, com um girassol e as palavras amor, diversão e educação.",
      width: 1000,
      height: 1333,
    },
  },
  gallery: {
    heading: "Galeria",
    photos: [
      {
        id: "paica",
        src: "/images/about/gallery-1.webp",
        alt: "Duas pessoas se abraçam ao lado de um Fusca azul com a faixa do PAICA, em um parque.",
        width: 1080,
        height: 1440,
      },
      {
        id: "volunteers",
        src: "/images/about/gallery-2.webp",
        alt: "Cinco voluntários da ONG Gabriel posam lado a lado em um auditório.",
        width: 1080,
        height: 1440,
      },
      {
        id: "circle",
        src: "/images/about/gallery-3.webp",
        alt: "Crianças e jovens sentados no chão de um auditório durante uma atividade.",
        width: 1080,
        height: 810,
      },
      {
        id: "community",
        src: "/images/about/gallery-4.webp",
        alt: "Ação ao ar livre no bairro, com crianças e adultos diante de um painel roxo decorado com girassóis.",
        width: 1080,
        height: 810,
      },
      {
        id: "mural",
        src: "/images/about/gallery-5.webp",
        alt: "Cartaz da ONG Gabriel com a pergunta “O que você diria para você hoje?”, preso a um painel roxo com girassóis.",
        width: 1080,
        height: 1440,
      },
    ],
  },
};
