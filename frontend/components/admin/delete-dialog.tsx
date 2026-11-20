"use client";

import { type RefObject, useId } from "react";
import { useCloseOnBackdrop } from "@/components/ui/close-on-backdrop";

type DeleteDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  dialogId: string;
  title: string;
  busy: boolean;
  onConfirm: () => void;
};

export function DeleteDialog({ dialogRef, dialogId, title, busy, onConfirm }: DeleteDialogProps) {
  const titleId = useId();
  useCloseOnBackdrop(dialogRef);

  return (
    <dialog
      ref={dialogRef}
      id={dialogId}
      aria-labelledby={titleId}
      className="w-[min(100%,--spacing(112))] rounded-xl bg-canvas text-text"
    >
      <div className="p-8">
        <h2 id={titleId} className="text-title font-bold text-ink-soft">
          {title}
        </h2>
        <p className="mt-4 text-body">Esta ação não pode ser desfeita.</p>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <form method="dialog">
            <button
              type="submit"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
            >
              Cancelar
            </button>
          </form>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-danger px-4 text-label font-semibold text-cream transition-colors hover:bg-danger-deep disabled:cursor-wait disabled:opacity-70"
          >
            Apagar
          </button>
        </div>
      </div>
    </dialog>
  );
}
