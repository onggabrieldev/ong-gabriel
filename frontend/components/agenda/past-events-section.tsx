import Image from "next/image";
import Link from "next/link";
import { arrowMotionClass } from "@/components/agenda/agenda-icons";
import { formatPastEventDate } from "@/components/agenda/format-event";
import { ArrowRightIcon } from "@/components/icons/icon";
import type { AgendaGalleryContent } from "@/lib/agenda/types";
import type { PastEvent } from "@/lib/events/types";

type PastEventsSectionProps = {
  gallery: AgendaGalleryContent;
  events: readonly PastEvent[];
};

export function PastEventsSection({ gallery, events }: PastEventsSectionProps) {
  const preview = events.slice(0, 3);

  return (
    <section aria-labelledby="past-events-title" className="bg-cream">
      <div className="mx-auto flex max-w-360 flex-col gap-12 px-4 py-16 lg:px-20 lg:py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2
            id="past-events-title"
            className="text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
          >
            {gallery.heading}
          </h2>
          <p className="text-body text-muted">{gallery.summary}</p>
          <Link
            href={gallery.action.href}
            className="group inline-flex items-center gap-1.5 text-label font-semibold text-navy transition-colors hover:text-soil hover:underline"
          >
            {gallery.action.label}
            <ArrowRightIcon className={arrowMotionClass} />
          </Link>
        </div>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-14">
          {preview.map((event) => (
            <li key={event.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-xl bg-canvas shadow-card">
                <Image
                  src={event.cover.src}
                  alt={event.cover.alt}
                  width={event.cover.width}
                  height={event.cover.height}
                  sizes="(min-width: 64rem) 24rem, 100vw"
                  className="h-48 w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-4 px-6 py-6.5">
                  <p className="text-body text-muted">{formatPastEventDate(event.heldOn)}</p>
                  <h3 className="text-title font-bold text-ink">{event.title}</h3>
                  <p className="text-body text-muted">{event.summary}</p>
                  <div className="mt-auto flex justify-end">
                    <Link
                      href={`/agenda/galeria/${event.slug}`}
                      className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-label font-semibold text-navy transition-colors hover:text-soil hover:underline"
                    >
                      {gallery.cardActionLabel}
                      <ArrowRightIcon className={arrowMotionClass} />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
