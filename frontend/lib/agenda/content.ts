import type { AgendaPageContent } from "@/lib/agenda/types";
import { homePageContent } from "@/lib/home/content";

export const agendaPageContent: AgendaPageContent = {
  hero: {
    title: "Confira nossa agenda",
    summary:
      "Participamos ativamente da comunidade através de rodas de conversa, eventos comunitários e palestras que promovem o bem-estar mental e o acolhimento. Junte-se a nós em nossa missão de cuidar e transformar vidas.",
  },
  events: {
    heading: "Próximos Eventos",
    moreLabel: "Mais eventos",
    emptyMessage: "Nenhum evento encontrado para os filtros selecionados.",
    initialCount: 3,
    detailsLabel: "Detalhes",
    calendarLabel: "Adicionar ao calendário",
    registerLabel: "Inscrição",
    registerDialogLabel: "Fazer inscrição",
    filters: {
      typeLabel: "Tipo de evento",
      locationLabel: "Localização",
      periodLabel: "Período",
      placeholder: "Selecione",
      applyLabel: "Filtrar",
      clearLabel: "Limpar",
    },
  },
  registration: {
    datePrefix: "Data:",
    fields: [
      {
        id: "name",
        label: "Nome",
        placeholder: "Insira seu nome e sobrenome",
        requiredMessage: "Informe o nome.",
      },
      {
        id: "email",
        label: "E-mail",
        placeholder: "Insira seu melhor e-mail",
        requiredMessage: "Informe um e-mail válido.",
      },
      {
        id: "phone",
        label: "Telefone",
        placeholder: "(00) 0000 - 0000",
        requiredMessage: "Informe um telefone válido.",
      },
    ],
    terms: {
      prefix: "Li e aceito os termos de ",
      linkLabel: "política e privacidade de dados",
      // Placeholder until the privacy page exists.
      href: "#politica-de-privacidade",
      requiredMessage: "Aceite os termos para continuar.",
    },
    updatesLabel: "Gostaria de receber novidades de eventos e conteúdos da ONG Gabriel",
    submitLabel: "Confirmar inscrição",
    submittingLabel: "Enviando inscrição",
  },
  status: {
    successTitle: "Sucesso!",
    successBody: [
      "Obrigado pela sua inscrição! Você receberá um e-mail de confirmação em breve.",
      "Clique abaixo para adicionar este evento ao seu calendário.",
    ],
    successAction: "Adicionar ao meu calendário",
    errorTitle: "Algo deu errado!",
    errorBody: [
      "Não foi possível concluir sua inscrição.",
      "Verifique sua conexão com a internet ou tente novamente.",
    ],
    errorAction: "Tentar novamente",
    closeLabel: "Fechar",
  },
  support: homePageContent.support,
  gallery: {
    heading: "Galeria de Eventos Passados",
    summary: "Confira alguns momentos especiais dos nossos eventos anteriores",
    action: { label: "Ver galeria", href: "/galeria" },
    cardActionLabel: "Ver galeria",
  },
  outreach: {
    title: "Quer levar um evento da ONG Gabriel até sua instituição?",
    summary:
      "Levamos nossos programas de saúde mental e bem-estar para escolas, empresas e organizações. Entre em contato e vamos conversar sobre como podemos ajudar sua comunidade.",
    action: { label: "Entre em contato", href: "/#contato" },
  },
};
