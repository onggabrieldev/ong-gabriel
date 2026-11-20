import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicList, isRecord } from "@/lib/api/public-list";
import { eventLocations, eventPeriods, eventTypes, pastEvents } from "@/lib/events/content";
import type {
  EventAccent,
  EventLocation,
  EventPeriod,
  EventType,
  PastEvent,
  UpcomingEvent,
} from "@/lib/events/types";

// The API stores every event image as a square WebP of this size.
const imageSize = 800;

const accents = new Set<EventAccent>(["sky", "butter", "teal"]);

function isAccent(value: unknown): value is EventAccent {
  return typeof value === "string" && accents.has(value as EventAccent);
}

// Filter options come from free text typed in the admin, so the id is a slug
// of the label. Labels that differ only in case or accents share one option.
function optionId(label: string): string {
  const slug = label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (slug) {
    return slug;
  }
  // A label with no letters or digits still needs an id of its own.
  let hash = 0;
  for (const char of label) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return `item-${hash.toString(36)}`;
}

function toOption(label: string): { id: string; label: string } {
  return { id: optionId(label), label };
}

function paragraphs(text: string): readonly string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function parseUpcomingEvent(value: unknown): UpcomingEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    title,
    summary,
    description,
    event_type,
    location,
    starts_at,
    ends_at,
    accent,
    image,
    image_alt,
  } = value;
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof summary !== "string" ||
    typeof description !== "string" ||
    typeof event_type !== "string" ||
    typeof location !== "string" ||
    typeof starts_at !== "string" ||
    typeof ends_at !== "string" ||
    !isAccent(accent) ||
    !(image === null || typeof image === "string") ||
    typeof image_alt !== "string"
  ) {
    return null;
  }

  return {
    id,
    slug: optionId(title),
    title,
    summary,
    description: paragraphs(description),
    type: toOption(event_type),
    location: toOption(location),
    startsAt: starts_at,
    endsAt: ends_at,
    accent,
    image:
      image === null ? null : { src: image, alt: image_alt, width: imageSize, height: imageSize },
    // Registrations are not stored yet, so the agenda does not offer them.
    registrationOpen: false,
  };
}

export async function getUpcomingEvents(): Promise<readonly UpcomingEvent[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  return fetchPublicList("/api/v1/events/", "upcoming events", parseUpcomingEvent);
}

function uniqueOptions(options: readonly { id: string; label: string }[]) {
  const byId = new Map<string, { id: string; label: string }>();
  for (const option of options) {
    if (!byId.has(option.id)) {
      byId.set(option.id, option);
    }
  }
  return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function getUpcomingEventFilterOptions(events: readonly UpcomingEvent[]): {
  types: readonly EventType[];
  locations: readonly EventLocation[];
  periods: readonly EventPeriod[];
} {
  return {
    types: uniqueOptions(events.map((event) => event.type)),
    locations: uniqueOptions(events.map((event) => event.location)),
    periods: eventPeriods,
  };
}

// The gallery getters still read placeholder records. Swap each body for a
// fetch and keep the signature.

export async function getPastEvents(): Promise<readonly PastEvent[]> {
  return pastEvents;
}

export async function getPastEvent(slug: string): Promise<PastEvent | undefined> {
  return pastEvents.find((event) => event.slug === slug);
}

export async function getEventFilterOptions(): Promise<{
  types: readonly EventType[];
  locations: readonly EventLocation[];
  periods: readonly EventPeriod[];
}> {
  return { types: eventTypes, locations: eventLocations, periods: eventPeriods };
}
