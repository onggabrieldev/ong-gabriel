"use client";

import Image from "next/image";
import { PencilIcon, TrashIcon } from "@/components/icons/icon";
import { formatEventRange } from "@/lib/admin/event-dates";
import type { AdminEvent } from "@/lib/admin/types";

type EventListCardProps = {
  event: AdminEvent;
  ended: boolean;
  deleteDialogId: string;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function EventListCard({
  event,
  ended,
  deleteDialogId,
  onTogglePublish,
  onEdit,
  onDelete,
}: EventListCardProps) {
  const published = event.is_published;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-canvas px-4 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {event.image ? (
          <Image
            src={event.image}
            alt=""
            width={96}
            height={96}
            unoptimized
            className="size-24 shrink-0 rounded-sm object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="min-w-0 text-title font-bold text-ink-soft wrap-break-word">
              {event.title}
            </h3>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[0.75rem] font-semibold ${
                published ? "bg-mint text-teal-ink" : "bg-line text-muted"
              }`}
            >
              {published ? "Publicado" : "Oculto"}
            </span>
            {ended ? (
              <span className="inline-flex rounded-full bg-line px-2 py-0.5 text-[0.75rem] font-semibold text-muted">
                Encerrado
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-body text-text">
            <time dateTime={event.starts_at}>
              {formatEventRange(event.starts_at, event.ends_at)}
            </time>
          </p>
          <p className="mt-1 text-body text-muted wrap-break-word">
            {event.event_type} · {event.location}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-body text-graphite wrap-break-word">
            {event.summary}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onTogglePublish}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
        >
          {published ? "Ocultar" : "Publicar"}
          <span className="sr-only"> {event.title}</span>
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
        >
          Editar
          <span className="sr-only"> {event.title}</span>
          <PencilIcon className="size-6" />
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls={deleteDialogId}
          onClick={onDelete}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-danger bg-canvas px-4 text-label font-semibold text-danger transition-colors hover:bg-danger-soft"
        >
          Apagar
          <span className="sr-only"> {event.title}</span>
          <TrashIcon className="size-6" />
        </button>
      </div>
    </article>
  );
}
