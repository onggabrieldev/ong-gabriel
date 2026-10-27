import { CalendarIcon, PinIcon, PlusIcon } from "@/components/agenda/agenda-icons";
import { accentClasses, getEventDateParts } from "@/components/agenda/format-event";
import type { AgendaEventsCopy } from "@/lib/agenda/types";
import type { UpcomingEvent } from "@/lib/events/types";

type EventCardProps = {
  event: UpcomingEvent;
  copy: AgendaEventsCopy;
  detailsId: string;
  registrationId: string;
  onDetails: (event: UpcomingEvent) => void;
  onCalendar: (event: UpcomingEvent) => void;
  onRegister: (event: UpcomingEvent) => void;
};

export function EventCard({
  event,
  copy,
  detailsId,
  registrationId,
  onDetails,
  onCalendar,
  onRegister,
}: EventCardProps) {
  const parts = getEventDateParts(event.startsAt);
  const accent = accentClasses[event.accent];

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-canvas px-4 py-5">
      <div className="flex flex-wrap items-start gap-5">
        <div
          className={`flex w-32 shrink-0 flex-col items-center justify-center gap-4 rounded-lg px-4 py-3.5 ${accent.box}`}
        >
          <p className={`text-[2rem] leading-none font-bold tracking-[0.01em] ${accent.day}`}>
            {parts.day}
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className={`text-sm ${accent.month}`}>{parts.month}</p>
            <p className={`text-xs ${accent.time}`}>{parts.time}</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <p className="inline-flex w-fit rounded-full bg-line px-1.75 py-0.75 text-sm text-ink-soft">
            {event.type.label}
          </p>
          <h3 className="text-title font-bold text-ink-soft">{event.title}</h3>
          <p className="flex items-center gap-1 text-xs text-text">
            <PinIcon className="size-5 shrink-0 text-muted" />
            <span>{event.location.label}</span>
          </p>
        </div>
      </div>
      <p className="text-body text-text">{event.summary}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
          aria-haspopup="dialog"
          aria-controls={detailsId}
          onClick={() => onDetails(event)}
        >
          {copy.detailsLabel}
        </button>
        <button
          type="button"
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-text bg-canvas px-4 text-label font-semibold text-text transition-colors hover:bg-sky"
          onClick={() => onCalendar(event)}
        >
          {copy.calendarLabel}
          <CalendarIcon className="size-6" />
        </button>
        {event.registrationOpen ? (
          <button
            type="button"
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
            aria-haspopup="dialog"
            aria-controls={registrationId}
            onClick={() => onRegister(event)}
          >
            {copy.registerLabel}
            <PlusIcon className="size-6" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
