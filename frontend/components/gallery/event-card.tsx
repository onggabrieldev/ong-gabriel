import Image from "next/image";
import Link from "next/link";
import { formatHeldOn } from "@/components/gallery/format-held-on";
import { PinIcon } from "@/components/gallery/icons";
import type { PastEvent } from "@/lib/events/types";

type EventCardProps = {
  event: PastEvent;
};

export function EventCard({ event }: EventCardProps) {
  const dateLabel = formatHeldOn(event.heldOn);

  return (
    <article className="h-full overflow-hidden rounded-xl border border-line bg-canvas shadow-card transition-shadow hover:shadow-photo">
      <Link
        href={`/agenda/galeria/${event.slug}`}
        className="flex h-full flex-col transition-colors hover:bg-sky"
      >
        <Image
          src={event.cover.src}
          alt={event.cover.alt}
          width={event.cover.width}
          height={event.cover.height}
          sizes="(min-width: 64rem) 24rem, 100vw"
          className="h-48 w-full object-cover"
        />
        <div className="flex flex-1 flex-col gap-4 px-6 py-6.5">
          <time dateTime={event.heldOn} className="text-body text-muted">
            {dateLabel}
          </time>
          <h3 className="text-title font-bold text-ink">{event.title}</h3>
          <p className="mt-auto flex items-start gap-1 text-[0.75rem] leading-normal text-text">
            <PinIcon className="mt-0.5 size-4 shrink-0" />
            <span>{event.location.label}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
