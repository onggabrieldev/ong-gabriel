"use client";

import { type FormEvent, type RefObject, useId, useState } from "react";
import { formatEventDate } from "@/components/agenda/format-event";
import { CloseIcon } from "@/components/icons/icon";
import { submitRegistration } from "@/lib/agenda/get-agenda-page";
import type {
  AgendaFieldId,
  AgendaRegistrationCopy,
  AgendaStatusCopy,
  RegistrationInput,
} from "@/lib/agenda/types";
import type { UpcomingEvent } from "@/lib/events/types";

type EventRegistrationDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  dialogId: string;
  titleId: string;
  event: UpcomingEvent | null;
  copy: AgendaRegistrationCopy;
  statusCopy: AgendaStatusCopy;
  onResult: (ok: boolean) => void;
  onClose: () => void;
};

type FormValues = Record<AgendaFieldId, string>;
type FormErrors = Partial<Record<AgendaFieldId | "terms", string>>;

const emptyValues: FormValues = { name: "", email: "", phone: "" };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 10;
}

export function EventRegistrationDialog({
  dialogRef,
  dialogId,
  titleId,
  event,
  copy,
  statusCopy,
  onResult,
  onClose,
}: EventRegistrationDialogProps) {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [wantsUpdates, setWantsUpdates] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setValues(emptyValues);
    setAcceptedTerms(false);
    setWantsUpdates(false);
    setErrors({});
    setSubmitting(false);
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!event || submitting) {
      return;
    }

    const nextErrors: FormErrors = {};
    for (const field of copy.fields) {
      const value = values[field.id].trim();
      if (field.id === "email" && !isValidEmail(value)) {
        nextErrors[field.id] = field.requiredMessage;
      } else if (field.id === "phone" && !isValidPhone(value)) {
        nextErrors[field.id] = field.requiredMessage;
      } else if (value.length === 0) {
        nextErrors[field.id] = field.requiredMessage;
      }
    }
    if (!acceptedTerms) {
      nextErrors.terms = copy.terms.requiredMessage;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: RegistrationInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      acceptedTerms,
      wantsUpdates,
    };

    setSubmitting(true);
    try {
      const result = await submitRegistration(event.id, payload);
      if (result.ok) {
        resetForm();
      }
      onResult(result.ok);
    } catch {
      onResult(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id={dialogId}
      aria-labelledby={titleId}
      className="max-h-[min(90vh,--spacing(200))] w-[min(100%,--spacing(120))] overflow-y-auto rounded-xl bg-cream text-text"
      onClose={() => {
        resetForm();
        onClose();
      }}
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
      <form className="flex flex-col gap-8 px-6 pb-10 lg:px-10" noValidate onSubmit={handleSubmit}>
        <h2 id={titleId} className="text-title font-bold text-ink-soft">
          {event?.title ?? copy.submitLabel}
        </h2>
        {event ? (
          <div className="flex flex-col gap-3 text-xs text-text">
            <p>
              {copy.datePrefix} {formatEventDate(event.startsAt)}
            </p>
            <p>{event.location.label}</p>
          </div>
        ) : null}
        <div className="flex flex-col gap-1">
          {copy.fields.map((field) => {
            const inputId = `${formId}-${field.id}`;
            const errorId = `${inputId}-error`;
            const error = errors[field.id];
            return (
              <div key={field.id} className="pb-1">
                <label htmlFor={inputId} className="text-label font-semibold text-text">
                  {field.label}
                </label>
                <input
                  id={inputId}
                  name={field.id}
                  type={field.id === "email" ? "email" : field.id === "phone" ? "tel" : "text"}
                  autoComplete={
                    field.id === "email" ? "email" : field.id === "phone" ? "tel" : "name"
                  }
                  value={values[field.id]}
                  placeholder={field.placeholder}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(changeEvent) => {
                    setValues((current) => ({ ...current, [field.id]: changeEvent.target.value }));
                    setErrors((current) => ({ ...current, [field.id]: undefined }));
                  }}
                  className="mt-0.5 h-10 w-full rounded-lg border border-line bg-canvas px-2 text-body text-ink-soft placeholder:text-placeholder"
                />
                <p
                  id={errorId}
                  className="min-h-5 text-sm font-semibold text-danger"
                  aria-hidden={error ? undefined : true}
                >
                  {error}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2 p-2 text-xs text-text">
            <input
              type="checkbox"
              checked={acceptedTerms}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? `${formId}-terms-error` : undefined}
              onChange={(changeEvent) => {
                setAcceptedTerms(changeEvent.target.checked);
                setErrors((current) => ({ ...current, terms: undefined }));
              }}
              className="size-6 shrink-0 cursor-pointer rounded-sm border-placeholder accent-navy"
            />
            <span>
              {copy.terms.prefix}
              <a href={copy.terms.href} className="text-slate transition-colors hover:underline">
                {copy.terms.linkLabel}
              </a>
            </span>
          </label>
          <p
            id={`${formId}-terms-error`}
            className="min-h-5 text-sm font-semibold text-danger"
            aria-hidden={errors.terms ? undefined : true}
          >
            {errors.terms}
          </p>
          <label className="flex cursor-pointer items-center gap-2 p-2 text-xs text-text">
            <input
              type="checkbox"
              checked={wantsUpdates}
              onChange={(changeEvent) => setWantsUpdates(changeEvent.target.checked)}
              className="size-6 shrink-0 cursor-pointer rounded-sm border-placeholder accent-navy"
            />
            <span>{copy.updatesLabel}</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep disabled:cursor-wait disabled:opacity-80"
        >
          {submitting ? copy.submittingLabel : copy.submitLabel}
        </button>
      </form>
    </dialog>
  );
}
