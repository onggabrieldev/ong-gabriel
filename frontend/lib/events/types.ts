import type { MediaAsset } from "@/lib/home/types";

export type EventType = {
  id: string;
  label: string;
};

export type EventLocation = {
  id: string;
  label: string;
};

export type EventAccent = "sky" | "butter" | "teal";

export type UpcomingEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: readonly string[];
  type: EventType;
  location: EventLocation;
  startsAt: string;
  endsAt: string;
  accent: EventAccent;
  image: MediaAsset;
  registrationOpen: boolean;
};

export type PastEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: EventType;
  location: EventLocation;
  heldOn: string;
  cover: MediaAsset;
  photos: readonly MediaAsset[];
};

export type EventFilters = {
  typeId?: string;
  locationId?: string;
  period?: string;
};

export type EventPeriod = {
  id: string;
  label: string;
};
