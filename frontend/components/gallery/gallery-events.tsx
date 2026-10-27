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

function filtersEqual(a: GalleryFilterValues, b: GalleryFilterValues): boolean {
  return a.tipo === b.tipo && a.localizacao === b.localizacao;
}

function listStatus(
  events: readonly PastEvent[],
  filters: GalleryFilterValues,
  copy: GalleryListCopy,
): string {
  const count = filterEvents(events, filters).length;
  if (count === 0) {
    return copy.empty;
  }
  const label = count === 1 ? copy.resultCountOne : copy.resultCount;
  return `${count} ${label}`;
}

function GalleryStatus({ text }: { text: string }) {
  return (
    <p role="status" className="sr-only">
      {text}
    </p>
  );
}

function writeFilterQuery(next: GalleryFilterValues): string {
  const params = new URLSearchParams();
  if (next.tipo) {
    params.set(typeParam, next.tipo);
  }
  if (next.localizacao) {
    params.set(locationParam, next.localizacao);
  }
  return params.toString();
}

export function GalleryEventsFallback(props: GalleryEventsProps) {
  return (
    <GalleryEventsShell
      {...props}
      applied={emptyFilters}
      draft={emptyFilters}
      onDraftChange={() => {}}
    />
  );
}

export function GalleryEvents(props: GalleryEventsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeIds = props.types.map((type) => type.id);
  const locationIds = props.locations.map((location) => location.id);
  const applied: GalleryFilterValues = {
    tipo: readParam(searchParams.get(typeParam), typeIds),
    localizacao: readParam(searchParams.get(locationParam), locationIds),
  };
  const [draft, setDraft] = useState<GalleryFilterValues>(applied);
  const [prevApplied, setPrevApplied] = useState(applied);
  if (!filtersEqual(applied, prevApplied)) {
    setPrevApplied(applied);
    setDraft(applied);
  }

  function writeFilters(next: GalleryFilterValues) {
    const query = writeFilterQuery(next);
    router.push(query ? `/galeria?${query}` : "/galeria", { scroll: false });
  }

  return (
    <GalleryEventsShell
      {...props}
      applied={applied}
      draft={draft}
      onDraftChange={setDraft}
      onWrite={writeFilters}
    />
  );
}

function GalleryEventsShell({
  events,
  types,
  locations,
  filtersCopy,
  listCopy,
  applied,
  draft,
  onDraftChange,
  onWrite,
}: GalleryEventsProps & {
  applied: GalleryFilterValues;
  draft: GalleryFilterValues;
  onDraftChange: (values: GalleryFilterValues) => void;
  onWrite?: (values: GalleryFilterValues) => void;
}) {
  return (
    <div>
      <GalleryStatus text={listStatus(events, applied, listCopy)} />
      <EventFilters
        copy={filtersCopy}
        types={types}
        locations={locations}
        values={draft}
        onChange={onDraftChange}
        onApply={() => onWrite?.(draft)}
        onClear={() => {
          onDraftChange(emptyFilters);
          onWrite?.(emptyFilters);
        }}
      />
      <GalleryEventsList
        key={`${applied.tipo}|${applied.localizacao}`}
        events={events}
        listCopy={listCopy}
        applied={applied}
      />
    </div>
  );
}

function GalleryEventsList({
  events,
  listCopy,
  applied,
}: {
  events: readonly PastEvent[];
  listCopy: GalleryListCopy;
  applied: GalleryFilterValues;
}) {
  const filtered = filterEvents(events, applied);
  const { listRef, visibleCount, hasMore, revealMore } = useRevealMore(pageSize, filtered.length);
  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-label text-muted">{listCopy.empty}</p>
      ) : (
        <ul
          ref={listRef}
          className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-3 lg:py-22.5"
        >
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
    </>
  );
}
