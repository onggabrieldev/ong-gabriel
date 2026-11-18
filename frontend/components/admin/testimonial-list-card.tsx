"use client";

import Image from "next/image";
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon } from "@/components/icons/icon";
import type { AdminTestimonial } from "@/lib/admin/types";

type TestimonialListCardProps = {
  testimonial: AdminTestimonial;
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

export function TestimonialListCard({
  testimonial,
  isFirst,
  isLast,
  reordering,
  deleteDialogId,
  onMoveUp,
  onMoveDown,
  onTogglePublish,
  onEdit,
  onDelete,
}: TestimonialListCardProps) {
  const initial = testimonial.name.trim().charAt(0).toUpperCase();
  const published = testimonial.is_published;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-canvas px-4 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {testimonial.portrait ? (
          <Image
            src={testimonial.portrait}
            alt=""
            width={70}
            height={70}
            sizes="70px"
            unoptimized
            className="size-17.5 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex size-17.5 shrink-0 items-center justify-center rounded-full bg-sky-deep text-title font-bold text-indigo"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-title font-bold text-ink-soft">{testimonial.name}</h3>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[0.75rem] font-semibold ${
                published ? "bg-mint text-teal-ink" : "bg-line text-muted"
              }`}
            >
              {published ? "Publicado" : "Oculto"}
            </span>
          </div>
          {testimonial.role ? <p className="mt-1 text-body text-text">{testimonial.role}</p> : null}
          <blockquote className="mt-3 whitespace-pre-wrap text-body text-graphite">
            {testimonial.quote}
          </blockquote>
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
          <span className="sr-only">Mover {testimonial.name} para cima</span>
        </button>
        <button
          type="button"
          disabled={reordering || isLast}
          onClick={onMoveDown}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas text-navy transition-colors hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronDownIcon className="size-5" />
          <span className="sr-only">Mover {testimonial.name} para baixo</span>
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
