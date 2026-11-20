// The agenda runs on Brasília time. The admin edits wall-clock values in that
// zone, whatever the browser's own zone is.
const agendaTimeZone = "America/Sao_Paulo";

const wallClockFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: agendaTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// "2027-01-15T14:00:00-03:00" becomes "2027-01-15T14:00", the value a
// datetime-local input takes.
export function toWallClock(iso: string): string {
  const parts = wallClockFormat.formatToParts(new Date(iso));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
}

// Adds hours to a wall-clock value. Reading it as UTC keeps the arithmetic
// free of the browser's zone.
export function addHours(wallClock: string, hours: number): string {
  // Some browsers add seconds to a datetime-local value; drop them.
  const date = new Date(`${wallClock.slice(0, 16)}:00Z`);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString().slice(0, 16);
}

const dayFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: agendaTimeZone,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: agendaTimeZone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatEventRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startDay = dayFormat.format(start);
  const endDay = dayFormat.format(end);
  const range =
    startDay === endDay
      ? `${timeFormat.format(start)} às ${timeFormat.format(end)}`
      : `${timeFormat.format(start)} até ${endDay}, ${timeFormat.format(end)}`;
  return `${startDay}, ${range}`;
}
