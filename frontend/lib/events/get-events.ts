import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicItem, fetchPublicList, isRecord } from "@/lib/api/public-list";
import { eventPeriods } from "@/lib/events/content";
import type {
  EventAccent,
  EventLocation,
  EventPeriod,
  EventType,
  PastEvent,
  PastEventDetail,
  UpcomingEvent,
} from "@/lib/events/types";
import type { MediaAsset } from "@/lib/home/types";

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

// The API stores every album cover as a square WebP of this size.
const coverSize = 800;

// Django slugs. Anything else never reaches the API, so a crafted slug cannot
// point the request at another route.
const slugPattern = /^[A-Za-z0-9_-]+$/;

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function parsePastEvent(value: unknown): PastEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, slug, title, summary, event_type, location, held_on, cover, cover_alt, photo_count } =
    value;
  if (
    typeof id !== "string" ||
    typeof slug !== "string" ||
    !slugPattern.test(slug) ||
    typeof title !== "string" ||
    typeof summary !== "string" ||
    typeof event_type !== "string" ||
    typeof location !== "string" ||
    typeof held_on !== "string" ||
    typeof cover !== "string" ||
    typeof cover_alt !== "string" ||
    typeof photo_count !== "number"
  ) {
    return null;
  }

  return {
    id,
    slug,
    title,
    summary,
    type: toOption(event_type),
    location: toOption(location),
    heldOn: held_on,
    cover: { src: cover, alt: cover_alt, width: coverSize, height: coverSize },
    photoCount: photo_count,
  };
}

function parsePhoto(value: unknown): MediaAsset | null {
  if (!isRecord(value)) {
    return null;
  }
  const { image, image_alt, width, height } = value;
  if (
    typeof image !== "string" ||
    typeof image_alt !== "string" ||
    !isPositiveInteger(width) ||
    !isPositiveInteger(height)
  ) {
    return null;
  }
  return { src: image, alt: image_alt, width, height };
}

function parsePastEventDetail(value: unknown): PastEventDetail | null {
  const event = parsePastEvent(value);
  if (event === null || !isRecord(value) || !Array.isArray(value.photos)) {
    return null;
  }
  const photos: MediaAsset[] = [];
  for (const entry of value.photos) {
    const photo = parsePhoto(entry);
    if (photo === null) {
      return null;
    }
    photos.push(photo);
  }
  return { ...event, photos };
}

export async function getPastEvents(): Promise<readonly PastEvent[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("gallery");

  return fetchPublicList("/api/v1/gallery/", "gallery albums", parsePastEvent);
}

export async function getPastEvent(slug: string): Promise<PastEventDetail | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("gallery");

  if (!slugPattern.test(slug)) {
    return undefined;
  }
  const event = await fetchPublicItem(
    `/api/v1/gallery/${slug}/`,
    "gallery album",
    parsePastEventDetail,
  );
  return event ?? undefined;
}

export function getPastEventFilterOptions(events: readonly PastEvent[]): {
  types: readonly EventType[];
  locations: readonly EventLocation[];
} {
  return {
    types: uniqueOptions(events.map((event) => event.type)),
    locations: uniqueOptions(events.map((event) => event.location)),
  };
}
