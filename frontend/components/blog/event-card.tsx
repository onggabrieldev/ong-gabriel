import Link from "next/link";
import type { UpcomingEvent } from "@/lib/events/types";

const accentClasses = {
  sky: "bg-sky-deep text-navy",
  butter: "bg-butter text-soil",
  teal: "bg-teal text-indigo-deep",
} as const;

type EventCardProps = {
  event: UpcomingEvent;
  detailsLabel: string;
};

export function EventCard({ event, detailsLabel }: EventCardProps) {
  const start = new Date(event.startsAt);
  const day = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(start);
  const month = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: "America/Sao_Paulo",
  })
    .format(start)
    .replace(".", "")
    .toUpperCase();
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(start);

  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-line bg-canvas px-4 py-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <time
          dateTime={event.startsAt}
          className={`flex min-w-32 flex-col items-center justify-center gap-2 rounded-lg px-4 py-3.5 sm:max-w-50 ${accentClasses[event.accent]}`}
        >
          <span className="text-[2rem] leading-none font-extrabold tracking-[0.01em]">{day}</span>
          <span className="text-sm font-medium uppercase">{month}</span>
          <span className="text-xs text-ink-soft">{time}</span>
        </time>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <p className="w-fit rounded-full bg-line px-1.75 py-0.75 text-sm text-ink-soft">
            {event.type.label}
          </p>
          <h3 className="text-title font-bold text-ink-soft">{event.title}</h3>
          <p className="flex items-start gap-1 text-xs text-text">
            <LocationPin />
            <span>{event.location.label}</span>
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Link
          href="/agenda"
          className="inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-label font-semibold text-navy transition-colors hover:bg-sky hover:underline"
        >
          {detailsLabel}
          <span className="sr-only">: {event.title}</span>
        </Link>
      </div>
    </article>
  );
}

function LocationPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0"
      fill="currentColor"
    >
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}
