import type { EventAccent, UpcomingEvent } from "@/lib/events/types";

export function firstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export function readParam(value: string | null, allowed: readonly { id: string }[]): string {
  if (!value) {
    return "";
  }
  return allowed.some((option) => option.id === value) ? value : "";
}

export const agendaTimeZone = "America/Sao_Paulo";

const dateTimeFormat: Intl.DateTimeFormatOptions = {
  timeZone: agendaTimeZone,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};

export type EventDateParts = {
  day: string;
  month: string;
  time: string;
};

export function getEventDateParts(iso: string): EventDateParts {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("pt-BR", dateTimeFormat).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    day: value("day"),
    month: value("month").replace(".", "").toUpperCase(),
    time: `${value("hour")}:${value("minute")}`,
  };
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: agendaTimeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatPastEventDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 15));
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: agendaTimeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const monthName = value("month");
  const titled = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return `${value("day")} ${titled} ${value("year")}`;
}

export const accentClasses: Record<
  EventAccent,
  { box: string; day: string; month: string; time: string }
> = {
  sky: {
    box: "bg-sky-deep",
    day: "text-navy",
    month: "text-navy",
    time: "text-muted",
  },
  butter: {
    box: "bg-butter",
    day: "text-butter-ink",
    month: "text-butter-ink",
    time: "text-muted",
  },
  teal: {
    box: "bg-teal",
    day: "text-teal-ink",
    month: "text-teal-ink",
    time: "text-text",
  },
};

export function matchesPeriod(startsAt: string, periodId: string, now = new Date()): boolean {
  const start = new Date(startsAt);
  const dayMs = 24 * 60 * 60 * 1000;

  if (periodId === "next-30-days") {
    return start >= now && start <= new Date(now.getTime() + 30 * dayMs);
  }

  if (periodId === "next-90-days") {
    return start >= now && start <= new Date(now.getTime() + 90 * dayMs);
  }

  if (periodId === "this-year") {
    const yearOf = (value: Date) =>
      new Intl.DateTimeFormat("en-US", { timeZone: agendaTimeZone, year: "numeric" }).format(value);
    return yearOf(start) === yearOf(now);
  }

  return true;
}

export function filterUpcomingEvents(
  events: readonly UpcomingEvent[],
  filters: { typeId: string; locationId: string; periodId: string },
): readonly UpcomingEvent[] {
  return events.filter((event) => {
    if (filters.typeId && event.type.id !== filters.typeId) {
      return false;
    }
    if (filters.locationId && event.location.id !== filters.locationId) {
      return false;
    }
    if (filters.periodId && !matchesPeriod(event.startsAt, filters.periodId)) {
      return false;
    }
    return true;
  });
}
