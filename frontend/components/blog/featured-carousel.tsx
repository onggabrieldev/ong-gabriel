"use client";

import Image from "next/image";
import { type KeyboardEvent, useId, useState } from "react";
import { ArrowRightIcon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button-link";
import type { BlogCopy, Post } from "@/lib/blog/types";

type FeaturedCarouselProps = {
  posts: readonly Post[];
  copy: BlogCopy;
};

export function FeaturedCarousel({ posts, copy }: FeaturedCarouselProps) {
  const labelId = useId();
  const statusId = useId();
  const [index, setIndex] = useState(0);

  if (posts.length === 0) {
    return null;
  }

  const current = posts[index] ?? posts[0];

  function goTo(next: number) {
    const wrapped = ((next % posts.length) + posts.length) % posts.length;
    setIndex(wrapped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      className="bg-cream"
      onKeyDown={onKeyDown}
    >
      <div className="mx-auto max-w-360 px-4 pt-4 pb-8 lg:px-20 lg:pt-0 lg:pb-10">
        <h2 id={labelId} className="sr-only">
          {copy.featuredRegionLabel}
        </h2>
        <p id={statusId} role="status" className="sr-only">
          {current.title}
        </p>
        <div className="relative overflow-hidden rounded-xl bg-canvas shadow-card">
          <article aria-labelledby={`${labelId}-title`} className="grid lg:grid-cols-2">
            <div className="flex flex-col justify-center gap-5 px-6 py-10 lg:px-8 lg:py-20 lg:pb-24">
              <p className="w-fit rounded-full bg-sky px-3 py-1 text-sm text-ink-soft">
                {current.category.label}
              </p>
              <h3
                id={`${labelId}-title`}
                className="text-[2rem] leading-tight font-semibold tracking-[0.01em] text-ink lg:text-headline"
              >
                {current.title}
              </h3>
              <p className="max-w-xl text-body text-muted">{current.excerpt}</p>
              <ButtonLink href={`/blog/${current.slug}`} variant="outline" className="w-fit">
                {copy.readPostLabel}
              </ButtonLink>
            </div>
            <div className="relative aspect-4/3 min-h-60 lg:aspect-auto lg:min-h-125">
              <Image
                src={current.cover.src}
                alt={current.cover.alt}
                fill
                priority
                sizes="(min-width: 64rem) 50vw, 100vw"
                className="object-cover lg:rounded-r-xl"
              />
            </div>
          </article>

          {posts.length > 1 ? (
            <div className="flex items-center justify-between px-2 py-3 lg:absolute lg:inset-x-2 lg:bottom-3 lg:px-4">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-sky"
              >
                <ArrowRightIcon className="size-6 rotate-180" />
                <span className="sr-only">{copy.previousPostLabel}</span>
              </button>
              <div className="flex items-center gap-2">
                {posts.map((post, slide) => {
                  const currentSlide = slide === index;
                  return (
                    <button
                      key={post.id}
                      type="button"
                      aria-label={post.title}
                      aria-current={currentSlide ? true : undefined}
                      onClick={() => goTo(slide)}
                      className={`size-3 cursor-pointer rounded-full transition-colors ${
                        currentSlide ? "bg-muted" : "bg-line hover:bg-placeholder"
                      }`}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-sky"
              >
                <ArrowRightIcon className="size-6" />
                <span className="sr-only">{copy.nextPostLabel}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
