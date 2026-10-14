import type { HomePageContent } from "@/lib/home/types";
import { socialProfiles } from "@/lib/site/navigation";

const placeholderQuote =
  "Malesuada facilisi libero, nam eu. Quis pellentesque tortor a elementum ut blandit sed pellentesque arcu. Malesuada in faucibus risus velit diam. Non, massa ut a arcu, fermentum, vel interdum.";

export const homePageContent: HomePageContent = {
  hero: {
    kicker: "Transformando vidas com",
    titleLines: ["Amor, educação", "e diversão"],
    summary: "Prevenção ao suicídio, trazendo esperança e acolhimento nos momentos mais difíceis.",
    image: {
      src: "/images/home/hero.webp",
      alt: "Pessoas da ONG Gabriel reunidas em uma quadra. No centro, duas pessoas seguram um cartaz com o girassol da organização e as palavras amor, diversão e educação.",
      width: 791,
      height: 534,
    },
  },
  mission: {
    heading: "Quem somos",
    paragraphs: [
      "A ONG Gabriel surgiu a partir da dor de perder alguém para o suicídio. Nossa missão é evitar que outras famílias passem pela mesma dor que a família do Gabriel enfrentou e prevenir que a depressão leve outras pessoas incríveis como ele.",
      "Desde de setembro de 2022, nós atuamos na região do Satélite Íris 1, em Campinas, trazendo terapia sem custo, rodas de conversa, atividades, eventos e palestras sobre a saúde mental para a comunidade local.",
    ],
    action: { label: "Conheça nossa história", href: "/sobre" },
    flower: {
      src: "/images/home/flower.svg",
      alt: "",
      width: 262,
      height: 431,
    },
    values: ["amor", "esperança", "cuidado", "empatia", "carinho"],
  },
  activities: {
    heading: "O que fazemos",
    action: { label: "Confira nossa agenda", href: "/agenda" },
    items: [
      {
        id: "conversations",
        title: "Rodas de conversa e palestras",
        description:
          "Conversas sobre temas como ansiedade, estresse, depressão, pressões da escola ou trabalho com pessoas lidando com situações parecidas.",
        image: {
          src: "/images/home/conversation.webp",
          alt: "Roda de conversa da ONG Gabriel: uma pessoa em pé fala para o grupo sentado em círculo.",
          width: 1080,
          height: 1080,
        },
      },
      {
        id: "events",
        title: "Atividades e eventos",
        description:
          "Promovemos palestras em escolas e eventos abertos ao público com o objetivo de conscientizar as pessoas sobre a importância da saúde mental.",
        image: {
          src: "/images/home/gathering.webp",
          alt: "Grupo de crianças, jovens e adultos da ONG Gabriel posando diante de um painel com a marca e códigos QR.",
          width: 1080,
          height: 1080,
        },
      },
      {
        id: "therapy",
        title: "Terapia e atendimento psicológico",
        description:
          "Não lide com tudo sozinho. Oferecemos consulta psicológicas sem custo algum. Vamos conversar.",
        image: {
          src: "/images/home/therapy.webp",
          alt: "Duas pessoas sentadas, de mãos dadas, durante um momento de acolhimento.",
          width: 374,
          height: 338,
        },
      },
    ],
  },
  support: {
    title: "Suporte emocional para sua vida!",
    subtitle: "Cuidar de si é um passo importante!",
    paragraphs: [
      "A ONG Gabriel oferece atendimento psicológico gratuito e online para quem precisa de apoio emocional.",
      "Basta acessar nossa plataforma de atendimento, preencher o formulário e aguardar o nosso contato. Estamos com você nessa caminhada!",
    ],
    action: { label: "Conheça nossa plataforma", href: "/#contato" },
    image: {
      src: "/images/home/support-hug.webp",
      alt: "Ilustração de duas pessoas se abraçando, com um coração acima delas.",
      width: 918,
      height: 1108,
    },
  },
  donation: {
    title: "Com sua ajuda, acolhemos e prevenimos.",
    paragraphs: [
      "Acreditamos no poder da ajuda, das redes de apoio, perspectivas de futuro e amor. Ao doar você nos ajuda a transformar vidas.",
      "Cada contribuição nos aproxima de uma sociedade mais sensível e preparada para lidar com o sofrimento emocional. Doe afeto em forma de ação.",
    ],
    action: { label: "Faça sua doação", href: "/doacao" },
    image: {
      src: "/images/home/watering.webp",
      alt: "Ilustração de um regador molhando mudas que crescem até virar um girassol.",
      width: 594,
      height: 595,
    },
  },
  impact: {
    title: "Nosso impacto em números",
    stats: [
      {
        id: "families",
        value: "1000",
        label: "Famílias impactadas direta e indiretamente",
      },
      {
        id: "sessions",
        value: "+200",
        label: "Atendimentos psicológicos",
      },
      {
        id: "volunteers",
        value: "100",
        label: "Voluntários ativos direto e indiretos",
      },
      {
        id: "events",
        value: "+100",
        label: "Eventos realizados pela ONG",
      },
    ],
  },
  volunteer: {
    title: "Seja um voluntário!",
    subtitle: "Compartilhe escuta, acolha com presença.",
    paragraphs: [
      "Ser voluntário na ONG Gabriel é estar ao lado de quem precisa ser ouvido com empatia e respeito. Atuamos no acolhimento, ações de prevenção e eventos que promovem o bem estar da saúde mental.",
      "Se você acredita no poder da escuta e quer fazer parte de uma transformação essencial, venha com a gente.",
    ],
    actionLabel: "Quero ser voluntário",
    confirmTitle: "Você será redirecionado",
    confirmBody: [
      "A inscrição para voluntários é feita na plataforma parceira Atados.",
      "Ao continuar, você abre o perfil da ONG Gabriel em uma nova aba.",
    ],
    confirmAction: "Continuar para o Atados",
    cancelLabel: "Cancelar",
    destinationHref: "https://www.voluntarios.org.br/ong/ong-gabriel",
    image: {
      src: "/images/home/volunteer.webp",
      alt: "Voluntárias da ONG Gabriel no Setembro Amarelo, ao lado do cartaz com o girassol. Em primeiro plano, a tela do perfil da organização no Atados.",
      width: 1186,
      height: 1308,
    },
  },
  testimonials: {
    heading: "Depoimentos",
    background: {
      src: "/images/home/testimonials-field.webp",
      alt: "",
      width: 1024,
      height: 377,
    },
    items: [
      {
        id: "testimonial-1",
        quote: placeholderQuote,
        name: "Nome",
        role: "Função",
        portrait: null,
      },
      {
        id: "testimonial-2",
        quote: placeholderQuote,
        name: "Nome",
        role: "Função",
        portrait: null,
      },
      {
        id: "testimonial-3",
        quote: placeholderQuote,
        name: "Nome",
        role: "Função",
        portrait: null,
      },
    ],
  },
  contact: {
    title: "Entre em contato conosco!",
    description: "Preencha o formulário ou acesse nossas redes sociais",
    fields: [
      {
        id: "name",
        label: "Nome",
        placeholder: "Digite seu nome",
        hint: "Necessário",
        requiredMessage: "Informe seu nome.",
      },
      {
        id: "email",
        label: "E-mail",
        placeholder: "Digite seu e-mail",
        hint: "Necessário",
        requiredMessage: "Informe um e-mail válido.",
      },
      {
        id: "message",
        label: "Mensagem",
        placeholder: "Escreva sua mensagem",
        hint: "Necessário",
        requiredMessage: "Escreva uma mensagem.",
      },
    ],
    submitLabel: "Enviar",
    inboxEmail: null,
    unavailableMessage:
      "O envio pelo site ainda não está disponível. Fale com a gente pelo Instagram enquanto isso.",
    social: socialProfiles,
  },
  tribute: {
    heading: "Homenagem",
    quote:
      "Em homenagem ao nosso querido Gabriel — irmão, filho, neto, sobrinho, primo, namorado, amigo, jogador de xadrez, estudante de matemática, pesquisador, aventureiro, educador e sonhador.",
    portrait: {
      src: "/images/home/tribute-portrait.webp",
      alt: "Retrato de Gabriel, em homenagem de quem a ONG leva o nome.",
      width: 1920,
      height: 1280,
    },
    field: {
      src: "/images/home/tribute-field.webp",
      alt: "",
      width: 2000,
      height: 1333,
    },
  },
};
