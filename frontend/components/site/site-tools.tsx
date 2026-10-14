"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons/icon";
import { useCloseOnBackdrop } from "@/components/ui/close-on-backdrop";
import { helpContent } from "@/lib/site/navigation";

const textSizeKey = "ong-gabriel-text-size";

export function SiteTools() {
  const helpId = useId();
  const titleId = useId();
  const helpRef = useRef<HTMLDialogElement>(null);
  const [largeText, setLargeText] = useState(false);
  useCloseOnBackdrop(helpRef);

  useEffect(() => {
    const stored = window.localStorage.getItem(textSizeKey) === "large";
    setLargeText(stored);
    document.documentElement.dataset.textSize = stored ? "large" : "default";
  }, []);

  function toggleTextSize() {
    const next = !largeText;
    setLargeText(next);
    document.documentElement.dataset.textSize = next ? "large" : "default";
    window.localStorage.setItem(textSizeKey, next ? "large" : "default");
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3">
      <button
        type="button"
        aria-pressed={largeText}
        onClick={toggleTextSize}
        className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-indigo bg-canvas text-indigo shadow-card transition-colors hover:bg-indigo hover:text-canvas"
      >
        <span aria-hidden="true" className="text-label font-bold">
          {largeText ? "A−" : "A+"}
        </span>
        <span className="sr-only">
          {largeText ? "Usar o tamanho de texto padrão" : "Aumentar o texto da página"}
        </span>
      </button>

      <button
        type="button"
        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-indigo bg-canvas px-4 text-label font-semibold text-indigo shadow-card transition-colors hover:bg-indigo hover:text-canvas"
        aria-haspopup="dialog"
        aria-controls={helpId}
        onClick={() => helpRef.current?.showModal()}
      >
        <span className="sm:hidden" aria-hidden="true">
          ?
        </span>
        <span className="hidden sm:inline">{helpContent.label}</span>
        <span className="sr-only sm:hidden">{helpContent.label}</span>
      </button>

      <dialog
        ref={helpRef}
        id={helpId}
        aria-labelledby={titleId}
        className="w-[min(100%,--spacing(96))] rounded-xl bg-canvas p-0 text-text"
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
            {helpContent.title}
          </h2>
          <p className="mt-4 text-body">{helpContent.body}</p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={helpContent.chatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
            >
              {helpContent.chatLabel}
              <span className="sr-only"> (abre em uma nova aba)</span>
            </a>
            <a
              href={helpContent.callHref}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-line bg-sky px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-sky-deep"
            >
              {helpContent.callLabel}
              <span className="sr-only">, número 188</span>
            </a>
          </div>
          <p className="mt-6 text-center text-label font-semibold text-soil">
            {helpContent.closing}
          </p>
        </div>
      </dialog>
    </div>
  );
}
