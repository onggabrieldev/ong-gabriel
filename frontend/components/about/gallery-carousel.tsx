"use client";

import Image from "next/image";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/icons/icon";
import type { GalleryPhoto } from "@/lib/about/types";

// Pixels per second. Negative moves the photos from right to left.
const speed = -55;

// Three copies keep the track wider than the viewport while the offset wraps.
const copies = [0, 1, 2] as const;

type Track = {
  element: HTMLUListElement | null;
  offset: number;
  width: number;
};

// Keeps the offset in [-width, 0) so a full copy always sits on each side of the viewport.
function place(track: Track, next: number) {
  const { width } = track;
  track.offset = width > 0 ? ((((next + width) % width) + width) % width) - width : next;
  if (track.element) {
    track.element.style.transform = `translate3d(${track.offset}px, 0, 0)`;
  }
}

type GalleryCarouselProps = {
  label: string;
  photos: readonly GalleryPhoto[];
};

export function GalleryCarousel({ label, photos }: GalleryCarouselProps) {
  const track = useRef<Track>({ element: null, offset: 0, width: 0 });
  const hovered = useRef(false);
  const drag = useRef<{ pointerId: number; startX: number; startOffset: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
    }
  }, []);

  useEffect(() => {
    const current = track.current;
    const element = current.element;
    if (!element) {
      return;
    }

    function measure() {
      if (!element) {
        return;
      }
      // Each copy is followed by one gap, and the last copy is not, so add one gap before dividing.
      const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
      current.width = (element.scrollWidth + gap) / copies.length;
      place(current, current.offset);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused) {
      return;
    }

    let frame = 0;
    let last = performance.now();

    function tick(now: number) {
      const elapsed = Math.min(now - last, 100) / 1000;
      last = now;
      if (!hovered.current && !drag.current) {
        place(track.current, track.current.offset + speed * elapsed);
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: track.current.offset,
    };
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointerId === event.pointerId) {
      place(track.current, current.startOffset + event.clientX - current.startX);
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null;
      setDragging(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`touch-pan-y overflow-hidden select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerEnter={(event) => {
          hovered.current = event.pointerType === "mouse";
        }}
        onPointerLeave={() => {
          hovered.current = false;
        }}
      >
        <ul
          aria-label={label}
          className="flex w-max gap-3.5 will-change-transform"
          ref={(element) => {
            track.current.element = element;
          }}
        >
          {copies.map((copy) =>
            photos.map((photo) => (
              <li
                key={`${copy}-${photo.id}`}
                aria-hidden={copy === 0 ? undefined : true}
                className="shrink-0"
              >
                <Image
                  src={photo.src}
                  alt={copy === 0 ? photo.alt : ""}
                  width={photo.width}
                  height={photo.height}
                  sizes="22.5rem"
                  draggable={false}
                  className="pointer-events-none h-65.5 w-[min(80vw,--spacing(90))] rounded-[0.625rem] object-cover"
                />
              </li>
            )),
          )}
        </ul>
      </div>
      <div className="mx-auto flex w-full max-w-360 justify-end px-4 lg:px-20">
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-navy text-navy transition-colors hover:bg-sky"
        >
          {paused ? <PlayIcon className="size-5" /> : <PauseIcon className="size-5" />}
          <span className="sr-only">{paused ? "Retomar a galeria" : "Pausar a galeria"}</span>
        </button>
      </div>
    </div>
  );
}
