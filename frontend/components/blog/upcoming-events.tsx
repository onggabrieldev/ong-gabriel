import { EventCard } from "@/components/blog/event-card";
import type { BlogCopy } from "@/lib/blog/types";
import type { UpcomingEvent } from "@/lib/events/types";

type UpcomingEventsProps = {
  events: readonly UpcomingEvent[];
  copy: BlogCopy;
};

export function UpcomingEvents({ events, copy }: UpcomingEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="blog-events-title" className="bg-canvas">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-8 px-4 py-16 lg:gap-8 lg:px-20">
        <h2
          id="blog-events-title"
          className="text-center text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
        >
          {copy.upcomingHeading}
        </h2>
        <ul className="grid w-full gap-6 lg:grid-cols-2 lg:px-10">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} detailsLabel={copy.eventDetailsLabel} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
