"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { CalendarIcon, UserPlusIcon } from "@/components/agenda/agenda-icons";
import { formatEventDate } from "@/components/agenda/format-event";
import { CloseIcon } from "@/components/icons/icon";
import type {
  AgendaEventsCopy,
  AgendaRegistrationCopy,
  AgendaStatusCopy,
} from "@/lib/agenda/types";
import type { UpcomingEvent } from "@/lib/events/types";

type EventDetailsDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  dialogId: string;
  titleId: string;
  event: UpcomingEvent | null;
  eventsCopy: AgendaEventsCopy;
  registrationCopy: AgendaRegistrationCopy;
  statusCopy: AgendaStatusCopy;
  onCalendar: () => void;
  onRegister: () => void;
  onClose: () => void;
};

export function EventDetailsDialog({
  dialogRef,
  dialogId,
  titleId,
  event,
  eventsCopy,
  registrationCopy,
  statusCopy,
  onCalendar,
  onRegister,
  onClose,
}: EventDetailsDialogProps) {
  const registrationOpen = event?.registrationOpen ?? false;

  return (
    <dialog
      ref={dialogRef}
      id={dialogId}
      aria-labelledby={titleId}
      className="max-h-[min(90vh,--spacing(200))] w-[min(100%,--spacing(211))] overflow-y-auto rounded-xl bg-cream text-text"
      onClose={onClose}
    >
      <form method="dialog" className="flex justify-end px-4 py-2.5">
        <button
          type="submit"
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-sky-deep"
        >
          <CloseIcon className="size-6" />
          <span className="sr-only">{statusCopy.closeLabel}</span>
        </button>
      </form>
      {event ? (
        <div className="flex flex-col gap-8 px-6 pb-10 lg:px-10">
          <h2 id={titleId} className="text-center text-title font-bold text-ink-soft">
            {event.title}
          </h2>
          <Image
            src={event.image.src}
            alt={event.image.alt}
            width={169}
            height={169}
            className="size-42.25 rounded-sm object-cover"
          />
          <div className="flex flex-col gap-3 text-xs text-text">
            <p>
              {registrationCopy.datePrefix} {formatEventDate(event.startsAt)}
            </p>
            <p>{event.location.label}</p>
          </div>
          <div className="flex flex-col gap-3 text-body text-text">
            {event.description.map((paragraph, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: API paragraphs can repeat
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-col gap-5 sm:flex-row">
            <button
              type="button"
              className="inline-flex h-12 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-indigo-deep bg-canvas px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky sm:flex-1"
              onClick={onCalendar}
            >
              <CalendarIcon className="size-6" />
              {eventsCopy.calendarLabel}
            </button>
            {registrationOpen ? (
              <button
                type="button"
                className="inline-flex h-12 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep sm:flex-1"
                onClick={onRegister}
              >
                <UserPlusIcon className="size-6" />
                {eventsCopy.registerDialogLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <h2 id={titleId} className="sr-only">
          {eventsCopy.detailsLabel}
        </h2>
      )}
    </dialog>
  );
}
