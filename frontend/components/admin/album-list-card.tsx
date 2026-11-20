"use client";

import Image from "next/image";
import { formatHeldOn } from "@/components/gallery/format-held-on";
import { PencilIcon, TrashIcon } from "@/components/icons/icon";
import type { AdminGalleryAlbum } from "@/lib/admin/types";

type AlbumListCardProps = {
  album: AdminGalleryAlbum;
  deleteDialogId: string;
  onPhotos: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function photoCountLabel(count: number): string {
  return count === 1 ? "1 foto" : `${count} fotos`;
}

export function AlbumListCard({
  album,
  deleteDialogId,
  onPhotos,
  onTogglePublish,
  onEdit,
  onDelete,
}: AlbumListCardProps) {
  const published = album.is_published;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-canvas px-4 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Image
          src={album.cover}
          alt=""
          width={96}
          height={96}
          unoptimized
          className="size-24 shrink-0 rounded-sm object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="min-w-0 text-title font-bold text-ink-soft wrap-break-word">
              {album.title}
            </h3>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[0.75rem] font-semibold ${
                published ? "bg-mint text-teal-ink" : "bg-line text-muted"
              }`}
            >
              {published ? "Publicado" : "Oculto"}
            </span>
          </div>
          <p className="mt-2 text-body text-text">
            <time dateTime={album.held_on}>{formatHeldOn(album.held_on)}</time> ·{" "}
            {photoCountLabel(album.photo_count)}
          </p>
          <p className="mt-1 text-body text-muted wrap-break-word">
            {album.event_type} · {album.location}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-body text-graphite wrap-break-word">
            {album.summary}
          </p>
          {album.photo_count === 0 ? (
            <p className="mt-2 text-body font-semibold text-soil">
              Sem fotos ainda: a página do álbum aparece vazia no site.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onPhotos}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
        >
          Fotos
          <span className="sr-only"> de {album.title}</span>
        </button>
        <button
          type="button"
          onClick={onTogglePublish}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
        >
          {published ? "Ocultar" : "Publicar"}
          <span className="sr-only"> {album.title}</span>
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
        >
          Editar
          <span className="sr-only"> {album.title}</span>
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
          <span className="sr-only"> {album.title}</span>
          <TrashIcon className="size-6" />
        </button>
      </div>
    </article>
  );
}
