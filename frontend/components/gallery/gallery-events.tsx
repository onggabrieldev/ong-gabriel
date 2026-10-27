"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EventCard } from "@/components/gallery/event-card";
import { EventFilters, type GalleryFilterValues } from "@/components/gallery/event-filters";
import { LoadMoreButton } from "@/components/gallery/load-more-button";
import { useRevealMore } from "@/components/gallery/use-reveal-more";
import type { EventLocation, EventType, PastEvent } from "@/lib/events/types";
import type { GalleryFiltersCopy, GalleryListCopy } from "@/lib/gallery/types";

const pageSize = 3;
const typeParam = "tipo";
const locationParam = "localizacao";
const emptyFilters: GalleryFilterValues = { tipo: "", localizacao: "" };

type GalleryEventsProps = {
  events: readonly PastEvent[];
  types: readonly EventType[];
  locations: readonly EventLocation[];
  filtersCopy: GalleryFiltersCopy;
  listCopy: GalleryListCopy;
};

function readParam(value: string | null, ids: readonly string[]): string {
  if (!value) {
    return "";
  }
  return ids.includes(value) ? value : "";
}

function filterEvents(events: readonly PastEvent[], filters: GalleryFilterValues): PastEvent[] {
  return events.filter((event) => {
    if (filters.tipo && event.type.id !== filters.tipo) {
      return false;
    }
    if (filters.localizacao && event.location.id !== filters.localizacao) {
      return false;
    }
    return true;
  });
}

export function GalleryEventsFallback(props: GalleryEventsProps) {
  return <GalleryEventsView {...props} applied={emptyFilters} />;
}

export function GalleryEvents(props: GalleryEventsProps) {
  const searchParams = useSearchParams();
  const typeIds = props.types.map((type) => type.id);
  const locationIds = props.locations.map((location) => location.id);
  const applied: GalleryFilterValues = {
    tipo: readParam(searchParams.get(typeParam), typeIds),
    localizacao: readParam(searchParams.get(locationParam), locationIds),
  };
  return (
    <GalleryEventsView
      key={`${applied.tipo}|${applied.localizacao}`}
      {...props}
      applied={applied}
    />
  );
}

function GalleryEventsView({
  events,
  types,
  locations,
  filtersCopy,
  listCopy,
  applied,
}: GalleryEventsProps & { applied: GalleryFilterValues }) {
  const router = useRouter();
  const [draft, setDraft] = useState<GalleryFilterValues>(applied);
  const filtered = filterEvents(events, applied);
  const { listRef, visibleCount, hasMore, revealMore } = useRevealMore(pageSize, filtered.length);
  const visible = filtered.slice(0, visibleCount);
  const statusText =
    filtered.length === 0 ? listCopy.empty : `${filtered.length} ${listCopy.resultCount}`;

  function writeFilters(next: GalleryFilterValues) {
    const params = new URLSearchParams();
    if (next.tipo) {
      params.set(typeParam, next.tipo);
    }
    if (next.localizacao) {
      params.set(locationParam, next.localizacao);
    }
    const query = params.toString();
    router.push(query ? `/agenda/galeria?${query}` : "/agenda/galeria", { scroll: false });
  }

  return (
    <div>
      <EventFilters
        copy={filtersCopy}
        types={types}
        locations={locations}
        values={draft}
        onChange={setDraft}
        onApply={() => writeFilters(draft)}
        onClear={() => {
          setDraft(emptyFilters);
          writeFilters(emptyFilters);
        }}
      />

      <p role="status" className="sr-only">
        {statusText}
      </p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-label text-muted">{listCopy.empty}</p>
      ) : (
        <ul ref={listRef} className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-3 lg:py-22.5">
          {visible.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}

      {hasMore ? (
        <div className="flex justify-center py-2.5">
          <LoadMoreButton onClick={revealMore}>{listCopy.loadMoreLabel}</LoadMoreButton>
        </div>
      ) : null}
    </div>
  );
}
