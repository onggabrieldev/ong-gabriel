import type { PageLink } from "@/lib/home/types";

export type StatusMessage = {
  title: string;
  paragraphs: readonly string[];
};

export const notFoundContent = {
  title: "Essa página se perdeu pelo caminho",
  paragraphs: [
    "O endereço pode ter mudado ou não existir mais.",
    "Tudo bem: às vezes a gente se perde, e sempre dá para encontrar o caminho de volta.",
    "Estamos aqui com você. Vamos recomeçar juntos?",
  ],
  homeLink: { label: "Voltar para o início", href: "/" },
  aboutLink: { label: "Conhecer a ONG", href: "/sobre" },
} as const satisfies StatusMessage & { homeLink: PageLink; aboutLink: PageLink };

export const errorContent = {
  title: "Algo não saiu como esperado",
  paragraphs: [
    "Tivemos um problema para mostrar esta página. Não foi nada que você fez.",
    "Respire fundo e tente de novo daqui a pouco. Se continuar, a gente resolve.",
  ],
  retryLabel: "Tentar de novo",
  homeLink: { label: "Voltar para o início", href: "/" },
} as const satisfies StatusMessage & { retryLabel: string; homeLink: PageLink };
