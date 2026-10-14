"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { CloseIcon } from "@/components/icons/icon";
import { useCloseOnBackdrop } from "@/components/ui/close-on-backdrop";
import type { VolunteerContent } from "@/lib/home/types";

type VolunteerSectionProps = {
  volunteer: VolunteerContent;
};

export function VolunteerSection({ volunteer }: VolunteerSectionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const titleId = useId();
  useCloseOnBackdrop(dialogRef);

  return (
    <section aria-labelledby="volunteer-title" className="bg-canvas">
      <div className="mx-auto grid max-w-360 items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-20 lg:py-20">
        <div>
          <h2
            id="volunteer-title"
            className="text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink-soft lg:text-headline"
          >
            {volunteer.title}
          </h2>
          <p className="mt-3 text-title font-bold text-slate">{volunteer.subtitle}</p>
          <div className="mt-8 flex max-w-xl flex-col gap-4 text-body text-text">
            {volunteer.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <button
            type="button"
            className="mt-10 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-5 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
            aria-haspopup="dialog"
            aria-controls={dialogId}
            onClick={() => dialogRef.current?.showModal()}
          >
            {volunteer.actionLabel}
          </button>
        </div>
        <Image
          src={volunteer.image.src}
          alt={volunteer.image.alt}
          width={volunteer.image.width}
          height={volunteer.image.height}
          sizes="(min-width: 64rem) 36rem, 100vw"
          className="h-auto w-full"
        />
      </div>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        className="w-[min(100%,--spacing(112))] rounded-xl bg-canvas text-text"
      >
        <form method="dialog" className="flex justify-end p-3">
          <button
            type="submit"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-sky-deep"
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">Fechar</span>
          </button>
        </form>
        <div className="px-8 pb-8">
          <h2 id={titleId} className="text-title font-bold text-ink-soft">
            {volunteer.confirmTitle}
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-body">
            {volunteer.confirmBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={volunteer.destinationHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
            >
              {volunteer.confirmAction}
              <span className="sr-only"> (abre em uma nova aba)</span>
            </a>
            <form method="dialog">
              <button
                type="submit"
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-ink-soft px-4 text-label font-semibold transition-colors hover:bg-sky"
              >
                {volunteer.cancelLabel}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </section>
  );
}
