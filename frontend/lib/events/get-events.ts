import {
  eventLocations,
  eventPeriods,
  eventTypes,
  pastEvents,
  upcomingEvents,
} from "@/lib/events/content";
import type {
  EventLocation,
  EventPeriod,
  EventType,
  PastEvent,
  UpcomingEvent,
} from "@/lib/events/types";

// Each getter is the seam for the API. Swap the body for a fetch and keep the signature.

export async function getUpcomingEvents(): Promise<readonly UpcomingEvent[]> {
  return upcomingEvents;
}

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
