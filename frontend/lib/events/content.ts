import type {
  EventLocation,
  EventPeriod,
  EventType,
  PastEvent,
  UpcomingEvent,
} from "@/lib/events/types";
import type { MediaAsset } from "@/lib/home/types";

// Placeholder records. The API replaces this file; keep the shapes in types.ts.

const placeholderImage = {
  src: "/images/placeholder.svg",
  alt: "",
  width: 800,
  height: 800,
} as const satisfies MediaAsset;

export const eventTypes = [
  { id: "type-1", label: "Tipo de evento 1" },
  { id: "type-2", label: "Tipo de evento 2" },
  { id: "type-3", label: "Tipo de evento 3" },
] as const satisfies readonly EventType[];

export const eventLocations = [
  { id: "location-1", label: "Local do evento 1" },
  { id: "location-2", label: "Local do evento 2" },
] as const satisfies readonly EventLocation[];

export const eventPeriods = [
  { id: "next-30-days", label: "Próximos 30 dias" },
  { id: "next-90-days", label: "Próximos 90 dias" },
  { id: "this-year", label: "Este ano" },
] as const satisfies readonly EventPeriod[];

const description = [
  "Parágrafo de descrição do evento.",
  "Segundo parágrafo de descrição do evento.",
] as const;

export const upcomingEvents = [
  {
    id: "upcoming-1",
    slug: "evento-1",
    title: "Título do evento 1",
    summary: "Resumo curto do evento.",
    description,
    type: eventTypes[0],
    location: eventLocations[0],
    startsAt: "2027-01-15T14:00:00-03:00",
    endsAt: "2027-01-15T16:00:00-03:00",
    accent: "sky",
    image: placeholderImage,
    registrationOpen: true,
  },
  {
    id: "upcoming-2",
    slug: "evento-2",
    title: "Título do evento 2",
    summary: "Resumo curto do evento.",
    description,
    type: eventTypes[1],
    location: eventLocations[1],
    startsAt: "2027-02-10T19:00:00-03:00",
    endsAt: "2027-02-10T21:00:00-03:00",
    accent: "butter",
    image: placeholderImage,
    registrationOpen: false,
  },
  {
    id: "upcoming-3",
    slug: "evento-3",
    title: "Título do evento 3",
    summary: "Resumo curto do evento.",
    description,
    type: eventTypes[2],
    location: eventLocations[0],
    startsAt: "2027-03-05T10:00:00-03:00",
    endsAt: "2027-03-05T12:00:00-03:00",
    accent: "teal",
    image: placeholderImage,
    registrationOpen: true,
  },
  {
    id: "upcoming-4",
    slug: "evento-4",
    title: "Título do evento 4",
    summary: "Resumo curto do evento.",
    description,
    type: eventTypes[0],
    location: eventLocations[1],
    startsAt: "2027-04-20T14:00:00-03:00",
    endsAt: "2027-04-20T16:00:00-03:00",
    accent: "sky",
    image: placeholderImage,
    registrationOpen: true,
  },
] as const satisfies readonly UpcomingEvent[];

const photos = Array.from({ length: 9 }, (_, index) => ({
  ...placeholderImage,
  alt: `Foto ${index + 1} do evento`,
})) satisfies MediaAsset[];

export const pastEvents = [
  {
    id: "past-1",
    slug: "evento-passado-1",
    title: "Título do evento passado 1",
    summary: "Resumo curto do evento passado.",
    type: eventTypes[0],
    location: eventLocations[0],
    heldOn: "2026-06-15",
    cover: placeholderImage,
    photos,
  },
  {
    id: "past-2",
    slug: "evento-passado-2",
    title: "Título do evento passado 2",
    summary: "Resumo curto do evento passado.",
    type: eventTypes[1],
    location: eventLocations[1],
    heldOn: "2026-05-20",
    cover: placeholderImage,
    photos,
  },
  {
    id: "past-3",
    slug: "evento-passado-3",
    title: "Título do evento passado 3",
    summary: "Resumo curto do evento passado.",
    type: eventTypes[2],
    location: eventLocations[0],
    heldOn: "2026-04-10",
    cover: placeholderImage,
    photos,
  },
  {
    id: "past-4",
    slug: "evento-passado-4",
    title: "Título do evento passado 4",
    summary: "Resumo curto do evento passado.",
    type: eventTypes[0],
    location: eventLocations[1],
    heldOn: "2026-03-08",
    cover: placeholderImage,
    photos,
  },
] as const satisfies readonly PastEvent[];
