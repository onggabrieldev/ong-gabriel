import type { PageLink, SocialProfile } from "@/lib/home/types";

export type SiteNavItem = PageLink & {
  id: string;
};

export const siteName = "ONG Gabriel";

export const siteBrand = "ONG GABRIEL";

export const mainNav = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "Sobre", href: "/sobre" },
  { id: "agenda", label: "Agenda", href: "/agenda" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "contact", label: "Contato", href: "/#contato" },
] as const satisfies readonly SiteNavItem[];

export const donationLink = {
  label: "Doe",
  href: "/doacao",
} as const satisfies PageLink;

export const socialProfiles = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ong.gabriel_/",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/ong-gabriel",
  },
] as const satisfies readonly SocialProfile[];

export const helpContent = {
  label: "Precisa de ajuda?",
  title: "Precisa conversar agora?",
  body: "Saiba que você não está sozinho. Se você está passando por um momento difícil, busque apoio no CVV (Centro de Valorização da Vida). O atendimento é gratuito, sigiloso e disponível 24 horas.",
  chatLabel: "Chat online do CVV",
  chatHref: "https://www.cvv.org.br/chat/",
  callLabel: "Ligar para o CVV",
  callHref: "tel:188",
  closing: "Cuidar da vida é sempre a melhor escolha.",
} as const;
