import type { UpcomingEvent } from "@/lib/events/types";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIcsUtc(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function stripIcsControls(value: string): string {
  let result = "";
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code === 9 || (code >= 32 && code !== 127)) {
      result += char;
    }
  }
  return result;
}

function escapeIcs(value: string): string {
  return stripIcsControls(value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n"))
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldIcs(line: string): string {
  const limit = 75;
  if (line.length <= limit) {
    return line;
  }

  const chunks = [line.slice(0, limit)];
  let rest = line.slice(limit);
  while (rest.length > limit - 1) {
    chunks.push(` ${rest.slice(0, limit - 1)}`);
    rest = rest.slice(limit - 1);
  }
  if (rest.length > 0) {
    chunks.push(` ${rest}`);
  }
  return chunks.join("\r\n");
}

export function buildEventIcs(event: UpcomingEvent): string {
  const stamp = toIcsUtc(new Date().toISOString());
  const description = event.description.join("\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ONG Gabriel//Agenda//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(event.id)}@onggabriel`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsUtc(event.startsAt)}`,
    `DTEND:${toIcsUtc(event.endsAt)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(event.location.label)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldIcs).join("\r\n")}\r\n`;
}

export function downloadEventIcs(event: UpcomingEvent): void {
  const blob = new Blob([buildEventIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.slug}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
