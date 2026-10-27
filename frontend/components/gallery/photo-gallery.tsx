"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LoadMoreButton } from "@/components/gallery/load-more-button";
import { useRevealMore } from "@/components/gallery/use-reveal-more";
import { ArrowRightIcon, CloseIcon } from "@/components/icons/icon";
import { useCloseOnBackdrop } from "@/components/ui/close-on-backdrop";
import type { GalleryPhotosCopy } from "@/lib/gallery/types";
import type { MediaAsset } from "@/lib/home/types";

const pageSize = 6;

type PhotoGalleryProps = {
  photos: readonly MediaAsset[];
  copy: GalleryPhotosCopy;
};

function photoLabel(photo: MediaAsset, index: number, copy: GalleryPhotosCopy): string {
  return photo.alt || `${copy.photoLabel} ${index + 1}`;
}

export function PhotoGallery({ photos, copy }: PhotoGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const statusId = useId();
  const { listRef, visibleCount, hasMore, revealMore } = useRevealMore(pageSize, photos.length);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = photos.slice(0, visibleCount);
  const current = openIndex === null ? null : photos[openIndex];
  const countLabel = photos.length === 1 ? copy.resultCountOne : copy.resultCount;
  const listStatus = photos.length === 0 ? copy.empty : `${photos.length} ${countLabel}`;
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

  const lightboxLabel =
    current && openIndex !== null ? photoLabel(current, openIndex, copy) : copy.heading;
  const lightboxStatus =
    openIndex === null ? "" : `${openIndex + 1} ${copy.counterSeparator} ${photos.length}`;

  return (
    <div>
      <p role="status" className="sr-only">
        {listStatus}
      </p>

      {photos.length === 0 ? (
        <p className="py-16 text-center text-label text-muted">{copy.empty}</p>
      ) : (
        <>
          <ul
            ref={listRef}
            className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-3 lg:pt-34 lg:pb-22.5"
          >
            {visible.map((photo, index) => {
              const label = photoLabel(photo, index, copy);
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: append-only list; photos share a placeholder src
                <li key={`${photo.src}-${index}`}>
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
              <LoadMoreButton onClick={revealMore}>{copy.loadMoreLabel}</LoadMoreButton>
            </div>
          ) : null}

          <dialog
            ref={dialogRef}
            id={dialogId}
            aria-label={lightboxLabel}
            aria-describedby={statusId}
            className="w-[min(100%,--spacing(240))] overflow-hidden bg-transparent"
            onClose={closeLightbox}
          >
            {current && openIndex !== null ? (
              <div className="relative flex items-center justify-center py-10">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  className="absolute left-2 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-ink text-canvas transition-colors hover:bg-navy lg:left-4"
                >
                  <ArrowRightIcon className="size-5 rotate-180" />
                  <span className="sr-only">{copy.previousLabel}</span>
                </button>
                <Image
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="(min-width: 64rem) 60rem, 100vw"
                  className="h-auto max-h-[80vh] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => move(1)}
                  className="absolute right-2 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-ink text-canvas transition-colors hover:bg-navy lg:right-4"
                >
                  <ArrowRightIcon className="size-5" />
                  <span className="sr-only">{copy.nextLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="absolute top-2 right-2 z-10 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-canvas text-ink-soft shadow-card transition-colors hover:bg-sky-deep"
                >
                  <CloseIcon className="size-5" />
                  <span className="sr-only">{copy.closeLabel}</span>
                </button>
                <p id={statusId} role="status" className="sr-only">
                  {lightboxStatus}
                </p>
              </div>
            ) : null}
          </dialog>
        </>
      )}
    </div>
  );
}
