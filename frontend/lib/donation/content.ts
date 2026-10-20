import type { DonationPageContent } from "@/lib/donation/types";
import { homePageContent } from "@/lib/home/content";

export const donationPageContent: DonationPageContent = {
  hero: {
    title: "Doe e ajude a transformar vidas",
    summary: "Seu apoio é essencial para manter nossos atendimentos gratuitos e acolhedores.",
    action: { label: "Faça sua doação agora", href: "#como-doar" },
    background: {
      src: "/images/donation/hero.webp",
      alt: "",
      width: 1920,
      height: 1280,
    },
  },
  options: {
    heading: "Veja como você pode doar",
    pix: {
      title: "Doação por Pix",
      qrCode: {
        src: "/images/donation/pix-qr-code.svg",
        alt: "QR Code Pix para doar à ONG Gabriel. Aponte a câmera do aplicativo do seu banco.",
        width: 61,
        height: 61,
      },
      keyLabel: "Chave Pix",
      keyType: "Telefone",
      key: "(19) 99447-6477",
      keyValue: "+5519994476477",
      copyKeyLabel: "Copiar chave",
      copyCodeLabel: "Copiar Pix copia e cola",
      code: "00020101021126870014br.gov.bcb.pix0114+55199944764770247Promovemos saude mental! Qualquer ajuda conta. 5204000053039865802BR5925ORGANIZACAO NAO GOVERNAME6009SAO PAULO62290525ahLjGvtooRTcpsFH5fBZXyIUK630435EB",
    },
    bank: {
      title: "Dados bancários",
      details: [
        { id: "bank", label: "Banco", value: "Cresol" },
        { id: "branch", label: "Agência", value: "6003" },
        { id: "account", label: "Conta", value: "1423-0" },
        { id: "holder", label: "Nome", value: "ONG Gabriel" },
      ],
    },
  },
  contact: homePageContent.contact,
  impact: {
    heading: "Nosso impacto",
    stats: homePageContent.impact.stats,
    background: {
      src: "/images/donation/impact-background.webp",
      alt: "",
      width: 1440,
      height: 600,
    },
    photos: [
      {
        src: "/images/donation/impact-team.webp",
        alt: "Voluntárias da ONG Gabriel com crianças e adolescentes em frente ao painel de girassóis.",
        width: 640,
        height: 640,
      },
      {
        src: "/images/donation/impact-activity.webp",
        alt: "Voluntária sorri durante uma atividade física em grupo numa quadra.",
        width: 800,
        height: 533,
      },
      {
        src: "/images/donation/impact-group.webp",
        alt: "Equipe da ONG Gabriel reunida ao redor do cartaz com o girassol e o nome da ONG.",
        width: 720,
        height: 486,
      },
      {
        src: "/images/donation/impact-talk.webp",
        alt: "Voluntária da ONG Gabriel conversa com um grupo sentado em roda.",
        width: 640,
        height: 640,
      },
    ],
  },
};
