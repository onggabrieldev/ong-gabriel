"use client";

import Image from "next/image";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/icons/icon";
import type { GalleryPhoto } from "@/lib/about/types";

// Pixels per second. Negative moves the photos from right to left.
const speed = -55;

// Three copies keep the track wider than the viewport while the offset wraps.
const copies = [0, 1, 2] as const;

// A flick keeps gliding after release and slows down exponentially.
// The glide covers about velocity × friction pixels.
const friction = 0.35;
const maxVelocity = 3000;
const minVelocity = 120;
const stopVelocity = 8;

// Only the last moments of a drag count toward the release velocity.
// A pointer held still before release does not glide.
const sampleWindow = 100;
const holdThreshold = 60;

type Sample = {
  offset: number;
  time: number;
};

type Drag = {
  pointerId: number;
  startX: number;
  startOffset: number;
  samples: Sample[];
};

type Motion = {
  element: HTMLUListElement | null;
  offset: number;
  width: number;
  velocity: number;
  autoplay: boolean;
  hovered: boolean;
  drag: Drag | null;
  frame: number;
  last: number;
};

// Keeps the offset in [-width, 0) so a full copy always sits on each side of the viewport.
function place(motion: Motion, next: number) {
  const { width } = motion;
  motion.offset = width > 0 ? ((((next + width) % width) + width) % width) - width : next;
  if (motion.element) {
    motion.element.style.transform = `translate3d(${motion.offset}px, 0, 0)`;
  }
}

function isMoving(motion: Motion) {
  return !motion.drag && (motion.velocity !== 0 || (motion.autoplay && !motion.hovered));
}

// Autoplay and the glide share one frame loop. It stops when nothing moves.
function step(motion: Motion, now: number) {
  const elapsed = Math.min(now - motion.last, 100) / 1000;
  motion.last = now;

  let shift = motion.autoplay && !motion.hovered ? speed * elapsed : 0;
  if (motion.velocity !== 0) {
    const decay = Math.exp(-elapsed / friction);
    shift += motion.velocity * friction * (1 - decay);
    motion.velocity *= decay;
    if (Math.abs(motion.velocity) < stopVelocity) {
      motion.velocity = 0;
    }
  }
  if (shift !== 0) {
    place(motion, motion.offset + shift);
  }

  motion.frame = isMoving(motion) ? requestAnimationFrame((time) => step(motion, time)) : 0;
}

function wake(motion: Motion) {
  if (motion.frame === 0 && isMoving(motion)) {
    motion.last = performance.now();
    motion.frame = requestAnimationFrame((time) => step(motion, time));
  }
}

function releaseVelocity(samples: readonly Sample[], releasedAt: number) {
  const last = samples.at(-1);
  if (!last || releasedAt - last.time > holdThreshold) {
    return 0;
  }
  const first = samples.find((sample) => last.time - sample.time <= sampleWindow) ?? last;
  const duration = last.time - first.time;
  if (duration <= 0) {
    return 0;
  }
  const velocity = ((last.offset - first.offset) / duration) * 1000;
  if (Math.abs(velocity) < minVelocity) {
    return 0;
  }
  return Math.max(-maxVelocity, Math.min(maxVelocity, velocity));
}

type GalleryCarouselProps = {
  label: string;
  photos: readonly GalleryPhoto[];
};

export function GalleryCarousel({ label, photos }: GalleryCarouselProps) {
  const motion = useRef<Motion>({
    element: null,
    offset: 0,
    width: 0,
    velocity: 0,
    autoplay: false,
    hovered: false,
    drag: null,
    frame: 0,
    last: 0,
  });
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
    }
  }, []);

  useEffect(() => {
    const current = motion.current;
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
    const current = motion.current;
    current.autoplay = !paused;
    // Pausing stops a glide in progress too.
    if (paused) {
      current.velocity = 0;
    }
    wake(current);
  }, [paused]);

  useEffect(() => {
    const current = motion.current;
    return () => {
      cancelAnimationFrame(current.frame);
      current.frame = 0;
    };
  }, []);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    const current = motion.current;
    event.currentTarget.setPointerCapture(event.pointerId);
    // Grabbing the track catches a glide in progress.
    current.velocity = 0;
    current.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: current.offset,
      samples: [{ offset: current.offset, time: event.timeStamp }],
    };
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = motion.current;
    const drag = current.drag;
    if (drag?.pointerId !== event.pointerId) {
      return;
    }
    // The wrap would read as a jump of a full copy, so samples use the unwrapped offset.
    const offset = drag.startOffset + event.clientX - drag.startX;
    place(current, offset);
    drag.samples.push({ offset, time: event.timeStamp });
    while (drag.samples.length > 2 && event.timeStamp - drag.samples[0].time > sampleWindow) {
      drag.samples.shift();
    }
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, glide: boolean) {
    const current = motion.current;
    const drag = current.drag;
    if (drag?.pointerId !== event.pointerId) {
      return;
    }
    current.drag = null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    current.velocity = glide && !reduceMotion ? releaseVelocity(drag.samples, event.timeStamp) : 0;
    setDragging(false);
    wake(current);
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`touch-pan-y overflow-hidden select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => endDrag(event, true)}
        onPointerCancel={(event) => endDrag(event, false)}
        onPointerEnter={(event) => {
          motion.current.hovered = event.pointerType === "mouse";
        }}
        onPointerLeave={() => {
          motion.current.hovered = false;
          wake(motion.current);
        }}
      >
        <ul
          aria-label={label}
          className="flex w-max gap-3.5 will-change-transform"
          ref={(element) => {
            motion.current.element = element;
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
