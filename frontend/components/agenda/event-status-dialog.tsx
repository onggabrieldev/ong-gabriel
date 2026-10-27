"use client";

import type { RefObject } from "react";
import {
  AlertIcon,
  CalendarIcon,
  RefreshIcon,
  SuccessIcon,
} from "@/components/agenda/agenda-icons";
import { CloseIcon } from "@/components/icons/icon";
import type { AgendaStatusCopy } from "@/lib/agenda/types";

type EventStatusDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  dialogId: string;
  titleId: string;
  variant: "success" | "error";
  copy: AgendaStatusCopy;
  onSuccessAction: () => void;
  onRetry: () => void;
  onClose: () => void;
};

export function EventStatusDialog({
  dialogRef,
  dialogId,
  titleId,
  variant,
  copy,
  onSuccessAction,
  onRetry,
  onClose,
}: EventStatusDialogProps) {
  const isSuccess = variant === "success";

  return (
    <dialog
      ref={dialogRef}
      id={dialogId}
      aria-labelledby={titleId}
      className="max-h-[min(90vh,--spacing(200))] w-[min(100%,--spacing(150))] overflow-y-auto rounded-xl bg-cream text-text"
      onClose={onClose}
    >
      <form method="dialog" className="flex justify-end px-4 py-2.5">
        <button
          type="submit"
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-sky-deep"
        >
          <CloseIcon className="size-6" />
          <span className="sr-only">{copy.closeLabel}</span>
        </button>
      </form>
      <div className="flex flex-col items-center gap-8 px-6 pb-10 lg:px-10">
        <div className="flex flex-col items-center gap-2.5">
          <h2 id={titleId} className="text-center text-title font-bold text-ink-soft">
            {isSuccess ? copy.successTitle : copy.errorTitle}
          </h2>
          {isSuccess ? (
            <SuccessIcon className="size-10" />
          ) : (
            <AlertIcon className="size-10 text-alert" />
          )}
        </div>
        <div role="status" className="flex w-full flex-col gap-3 text-body text-text">
          {(isSuccess ? copy.successBody : copy.errorBody).map((paragraph, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: status copy can repeat
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {isSuccess ? (
          <button
            type="button"
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
            onClick={onSuccessAction}
          >
            <CalendarIcon className="size-6" />
            {copy.successAction}
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
            onClick={onRetry}
          >
            <RefreshIcon className="size-6" />
            {copy.errorAction}
          </button>
        )}
      </div>
    </dialog>
  );
}
