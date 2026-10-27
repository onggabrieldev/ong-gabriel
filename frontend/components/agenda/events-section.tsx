"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { arrowMotionClass } from "@/components/agenda/agenda-icons";
import { downloadEventIcs } from "@/components/agenda/download-ics";
import { EventCard } from "@/components/agenda/event-card";
import { EventDetailsDialog } from "@/components/agenda/event-details-dialog";
import { EventRegistrationDialog } from "@/components/agenda/event-registration-dialog";
import { EventStatusDialog } from "@/components/agenda/event-status-dialog";
import { filterUpcomingEvents } from "@/components/agenda/format-event";
import { ArrowRightIcon } from "@/components/icons/icon";
import { useCloseOnBackdrop } from "@/components/ui/close-on-backdrop";
import type {
  AgendaEventsCopy,
  AgendaRegistrationCopy,
  AgendaStatusCopy,
} from "@/lib/agenda/types";
import type { EventLocation, EventPeriod, EventType, UpcomingEvent } from "@/lib/events/types";

type EventsSectionProps = {
  events: readonly UpcomingEvent[];
  types: readonly EventType[];
  locations: readonly EventLocation[];
  periods: readonly EventPeriod[];
  copy: AgendaEventsCopy;
  registration: AgendaRegistrationCopy;
  status: AgendaStatusCopy;
};

type DialogKind = "details" | "registration" | "success" | "error" | null;

type FilterDraft = {
  tipo: string;
  local: string;
  periodo: string;
};

const emptyFilters: FilterDraft = { tipo: "", local: "", periodo: "" };

function readParam(value: string | null, allowed: readonly { id: string }[]): string {
  if (!value) {
    return "";
  }
  return allowed.some((option) => option.id === value) ? value : "";
}

function FilterSelect({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-0.5 lg:max-w-65">
      <label htmlFor={id} className="text-label font-semibold text-text">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-10 w-full cursor-pointer appearance-none rounded-lg border border-line bg-canvas px-2 pr-8 text-body transition-colors hover:bg-sky ${
            value ? "text-ink-soft" : "text-placeholder"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted">
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="size-5 fill-none stroke-current stroke-2"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function EventsSection({
  events,
  types,
  locations,
  periods,
  copy,
  registration,
  status,
}: EventsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formId = useId();
  const detailsId = useId();
  const registrationId = useId();
  const statusId = useId();
  const detailsTitleId = useId();
  const registrationTitleId = useId();
  const statusTitleId = useId();
  const detailsRef = useRef<HTMLDialogElement>(null);
  const registrationRef = useRef<HTMLDialogElement>(null);
  const statusRef = useRef<HTMLDialogElement>(null);
  useCloseOnBackdrop(detailsRef);
  useCloseOnBackdrop(registrationRef);
  useCloseOnBackdrop(statusRef);

  const appliedTipo = readParam(searchParams.get("tipo"), types);
  const appliedLocal = readParam(searchParams.get("local"), locations);
  const appliedPeriodo = readParam(searchParams.get("periodo"), periods);
  const applied = useMemo<FilterDraft>(
    () => ({ tipo: appliedTipo, local: appliedLocal, periodo: appliedPeriodo }),
    [appliedTipo, appliedLocal, appliedPeriodo],
  );

  const [draft, setDraft] = useState<FilterDraft>(applied);
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [activeEvent, setActiveEvent] = useState<UpcomingEvent | null>(null);

  useEffect(() => {
    setDraft({ tipo: appliedTipo, local: appliedLocal, periodo: appliedPeriodo });
  }, [appliedTipo, appliedLocal, appliedPeriodo]);

  useEffect(() => {
    const details = detailsRef.current;
    const registrationDialog = registrationRef.current;
    const statusDialog = statusRef.current;
    if (!details || !registrationDialog || !statusDialog) {
      return;
    }

    function open(element: HTMLDialogElement) {
      if (!element.open) {
        element.showModal();
      }
    }

    function close(element: HTMLDialogElement) {
      if (element.open) {
        element.close();
      }
    }

    if (dialog === "details") {
      close(registrationDialog);
      close(statusDialog);
      open(details);
      return;
    }
    if (dialog === "registration") {
      close(details);
      close(statusDialog);
      open(registrationDialog);
      return;
    }
    if (dialog === "success" || dialog === "error") {
      close(details);
      close(registrationDialog);
      open(statusDialog);
      return;
    }
    close(details);
    close(registrationDialog);
    close(statusDialog);
  }, [dialog]);

  const filtered = filterUpcomingEvents(events, {
    typeId: applied.tipo,
    locationId: applied.local,
    periodId: applied.periodo,
  });
  const visible = expanded ? filtered : filtered.slice(0, copy.initialCount);

  function writeFilters(next: FilterDraft) {
    const params = new URLSearchParams();
    if (next.tipo) {
      params.set("tipo", next.tipo);
    }
    if (next.local) {
      params.set("local", next.local);
    }
    if (next.periodo) {
      params.set("periodo", next.periodo);
    }
    const query = params.toString();
    setExpanded(false);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    writeFilters(draft);
  }

  function openDetails(event: UpcomingEvent) {
    setActiveEvent(event);
    setDialog("details");
  }

  function openRegistration(event: UpcomingEvent) {
    setActiveEvent(event);
    setDialog("registration");
  }

  return (
    <section aria-labelledby="upcoming-events-title" className="bg-canvas">
      <div className="mx-auto flex max-w-360 flex-col gap-8 px-4 py-12 lg:gap-11 lg:px-20 lg:pt-20 lg:pb-32">
        <form
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6"
          onSubmit={handleFilter}
        >
          <FilterSelect
            id={`${formId}-tipo`}
            label={copy.filters.typeLabel}
            placeholder={copy.filters.placeholder}
            value={draft.tipo}
            options={types}
            onChange={(tipo) => setDraft((current) => ({ ...current, tipo }))}
          />
          <FilterSelect
            id={`${formId}-local`}
            label={copy.filters.locationLabel}
            placeholder={copy.filters.placeholder}
            value={draft.local}
            options={locations}
            onChange={(local) => setDraft((current) => ({ ...current, local }))}
          />
          <FilterSelect
            id={`${formId}-periodo`}
            label={copy.filters.periodLabel}
            placeholder={copy.filters.placeholder}
            value={draft.periodo}
            options={periods}
            onChange={(periodo) => setDraft((current) => ({ ...current, periodo }))}
          />
          <div className="flex w-full gap-6 lg:w-auto lg:flex-none">
            <button
              type="submit"
              className="inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep lg:w-50.5 lg:flex-none"
            >
              {copy.filters.applyLabel}
            </button>
            <button
              type="button"
              className="inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky lg:w-50.5 lg:flex-none"
              onClick={() => {
                setDraft(emptyFilters);
                writeFilters(emptyFilters);
              }}
            >
              {copy.filters.clearLabel}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-11">
          <h2 id="upcoming-events-title" className="text-title font-bold text-ink">
            {copy.heading}
          </h2>
          {filtered.length === 0 ? (
            <p role="status" className="text-body text-text">
              {copy.emptyMessage}
            </p>
          ) : (
            <ul className="flex flex-col gap-11">
              {visible.map((event) => (
                <li key={event.id}>
                  <EventCard
                    event={event}
                    copy={copy}
                    detailsId={detailsId}
                    registrationId={registrationId}
                    onDetails={openDetails}
                    onCalendar={downloadEventIcs}
                    onRegister={openRegistration}
                  />
                </li>
              ))}
            </ul>
          )}
          {filtered.length > copy.initialCount && !expanded ? (
            <div className="flex justify-end">
              <button
                type="button"
                className="group inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-label font-semibold text-navy transition-colors hover:text-soil hover:underline"
                onClick={() => setExpanded(true)}
              >
                {copy.moreLabel}
                <ArrowRightIcon className={arrowMotionClass} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <EventDetailsDialog
        dialogRef={detailsRef}
        dialogId={detailsId}
        titleId={detailsTitleId}
        event={activeEvent}
        eventsCopy={copy}
        registrationCopy={registration}
        statusCopy={status}
        onCalendar={() => {
          if (activeEvent) {
            downloadEventIcs(activeEvent);
          }
        }}
        onRegister={() => setDialog("registration")}
        onClose={() => setDialog((current) => (current === "details" ? null : current))}
      />
      <EventRegistrationDialog
        dialogRef={registrationRef}
        dialogId={registrationId}
        titleId={registrationTitleId}
        event={activeEvent}
        copy={registration}
        statusCopy={status}
        onResult={(ok) => setDialog(ok ? "success" : "error")}
        onClose={() => setDialog((current) => (current === "registration" ? null : current))}
      />
      <EventStatusDialog
        dialogRef={statusRef}
        dialogId={statusId}
        titleId={statusTitleId}
        variant={dialog === "error" ? "error" : "success"}
        copy={status}
        onSuccessAction={() => {
          if (activeEvent) {
            downloadEventIcs(activeEvent);
          }
        }}
        onRetry={() => setDialog("registration")}
        onClose={() =>
          setDialog((current) => (current === "success" || current === "error" ? null : current))
        }
      />
    </section>
  );
}
