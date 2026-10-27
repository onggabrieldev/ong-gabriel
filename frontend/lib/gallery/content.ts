import type { GalleryPageContent } from "@/lib/gallery/types";

export const galleryPageContent = {
  hero: {
    title: "Galeria de Eventos",
    summary: "Explore nossos momentos de acolhimento e ações na nossa comunidade.",
  },
  breadcrumb: {
    navLabel: "Trilha de navegação",
    agenda: { label: "Agenda", href: "/agenda" },
    gallery: { label: "Galeria", href: "/agenda/galeria" },
  },
  filters: {
    type: { label: "Tipo de evento", placeholder: "Selecione" },
    location: { label: "Localização", placeholder: "Selecione" },
    applyLabel: "Filtrar",
    clearLabel: "Limpar",
  },
  list: {
    heading: "Eventos passados",
    loadMoreLabel: "Carregar mais",
    empty: "Nenhum evento encontrado.",
  },
  photos: {
    heading: "Fotos do evento",
    loadMoreLabel: "Carregar mais",
    empty: "Nenhuma foto disponível para este evento.",
    previousLabel: "Foto anterior",
    nextLabel: "Próxima foto",
    closeLabel: "Fechar",
  },
  donation: {
    title: "Ao doar você nos ajuda a transformar vidas!",
    paragraphs: [
      "Cada contribuição nos aproxima de uma sociedade mais sensível e preparada para lidar com o sofrimento emocional.",
      "Doe afeto em forma de ação.",
    ],
    action: { label: "Saiba como doar", href: "/doacao" },
    image: {
      src: "/images/placeholder.svg",
      alt: "",
      width: 800,
      height: 800,
    },
  },
} as const satisfies GalleryPageContent;
