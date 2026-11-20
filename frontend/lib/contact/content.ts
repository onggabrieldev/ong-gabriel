import type { ContactPageContent } from "@/lib/contact/types";
import { socialProfiles } from "@/lib/site/navigation";

export const contactPageContent: ContactPageContent = {
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
};
