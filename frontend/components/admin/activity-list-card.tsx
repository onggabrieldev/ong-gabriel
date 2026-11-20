"use client";

import Image from "next/image";
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon } from "@/components/icons/icon";
import type { AdminActivity } from "@/lib/admin/types";

type ActivityListCardProps = {
  activity: AdminActivity;
  isFirst: boolean;
  isLast: boolean;
  reordering: boolean;
  deleteDialogId: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ActivityListCard({
  activity,
  isFirst,
  isLast,
  reordering,
  deleteDialogId,
  onMoveUp,
  onMoveDown,
  onTogglePublish,
  onEdit,
  onDelete,
}: ActivityListCardProps) {
  const published = activity.is_published;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-canvas px-4 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Image
          src={activity.image}
          alt=""
          width={96}
          height={96}
          unoptimized
          className="size-24 shrink-0 rounded-sm object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="min-w-0 text-title font-bold text-ink-soft wrap-break-word">
              {activity.title}
            </h3>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[0.75rem] font-semibold ${
                published ? "bg-mint text-teal-ink" : "bg-line text-muted"
              }`}
            >
              {published ? "Publicada" : "Oculta"}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-body text-graphite wrap-break-word">
            {activity.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          disabled={reordering || isFirst}
          onClick={onMoveUp}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas text-navy transition-colors hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronUpIcon className="size-5" />
          <span className="sr-only">Mover {activity.title} para cima</span>
        </button>
        <button
          type="button"
          disabled={reordering || isLast}
          onClick={onMoveDown}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas text-navy transition-colors hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronDownIcon className="size-5" />
          <span className="sr-only">Mover {activity.title} para baixo</span>
        </button>
        <button
          type="button"
          onClick={onTogglePublish}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
        >
          {published ? "Ocultar" : "Publicar"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
        >
          Editar
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
          <TrashIcon className="size-6" />
        </button>
      </div>
    </article>
  );
}
