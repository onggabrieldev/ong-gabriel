"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/gallery/icons";
import { CloseIcon } from "@/components/icons/icon";
import { useCloseOnBackdrop } from "@/components/ui/close-on-backdrop";
import type { GalleryPhotosCopy } from "@/lib/gallery/types";
import type { MediaAsset } from "@/lib/home/types";

const pageSize = 6;

type PhotoGalleryProps = {
  photos: readonly MediaAsset[];
  copy: GalleryPhotosCopy;
};

export function PhotoGallery({ photos, copy }: PhotoGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const statusId = useId();
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = photos.slice(0, visibleCount);
  const hasMore = visibleCount < photos.length;
  const current = openIndex === null ? null : photos[openIndex];
  useCloseOnBackdrop(dialogRef);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (openIndex === null) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
    }
  }, [openIndex]);

  const move = useCallback(
    (delta: number) => {
      if (photos.length === 0) {
        return;
      }
      setOpenIndex((index) => {
        if (index === null) {
          return index;
        }
        return (index + delta + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, move]);

  function closeLightbox() {
    setOpenIndex(null);
  }

  if (photos.length === 0) {
    return (
      <p role="status" className="py-16 text-center text-label text-muted">
        {copy.empty}
      </p>
    );
  }

  return (
    <div>
      <ul className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-3 lg:py-22.5">
        {visible.map((photo, index) => {
          const label = photo.alt || `Foto ${index + 1}`;
          return (
            <li key={label}>
              <button
                type="button"
                aria-label={label}
                aria-haspopup="dialog"
                aria-controls={dialogId}
                aria-expanded={openIndex === index}
                onClick={() => setOpenIndex(index)}
                className="w-full cursor-pointer overflow-hidden bg-canvas shadow-card transition-shadow hover:shadow-photo"
              >
                <Image
                  src={photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 64rem) 24rem, 100vw"
                  className="aspect-square w-full object-cover"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore ? (
        <div className="flex justify-center py-2.5">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + pageSize)}
            className="inline-flex h-12 w-50 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
          >
            {copy.loadMoreLabel}
          </button>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label={current?.alt || copy.heading}
        aria-describedby={statusId}
        className="w-[min(100%,--spacing(200))] bg-transparent"
        onClose={closeLightbox}
      >
        {current && openIndex !== null ? (
          <div className="relative flex items-center justify-center gap-4 px-12 py-10 lg:gap-8 lg:px-16">
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute left-0 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-canvas text-ink-soft shadow-card transition-colors hover:bg-sky-deep"
            >
              <ChevronLeftIcon className="size-5" />
              <span className="sr-only">{copy.previousLabel}</span>
            </button>
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="(min-width: 64rem) 50rem, 100vw"
              className="max-h-[80vh] w-full object-contain"
            />
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute right-0 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-canvas text-ink-soft shadow-card transition-colors hover:bg-sky-deep"
            >
              <ChevronRightIcon className="size-5" />
              <span className="sr-only">{copy.nextLabel}</span>
            </button>
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-0 right-0 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-canvas text-ink-soft shadow-card transition-colors hover:bg-sky-deep"
            >
              <CloseIcon className="size-5" />
              <span className="sr-only">{copy.closeLabel}</span>
            </button>
            <p id={statusId} role="status" className="sr-only">
              {`${openIndex + 1} de ${photos.length}`}
            </p>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
