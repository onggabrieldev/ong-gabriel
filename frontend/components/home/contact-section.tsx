"use client";

import { type FormEvent, useId, useState } from "react";
import { ArrowRightIcon, SocialIcon } from "@/components/icons/icon";
import type { ContactContent, ContactFieldId } from "@/lib/home/types";

type ContactSectionProps = {
  contact: ContactContent;
};

type ContactValues = Record<ContactFieldId, string>;
type ContactErrors = Partial<Record<ContactFieldId, string>>;

const emptyValues: ContactValues = { name: "", email: "", message: "" };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactSection({ contact }: ContactSectionProps) {
  const formId = useId();
  const statusId = useId();
  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ContactErrors = {};

    for (const field of contact.fields) {
      const value = values[field.id].trim();
      if (value.length === 0 || (field.id === "email" && !isValidEmail(value))) {
        nextErrors[field.id] = field.requiredMessage;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("Revise os campos destacados.");
      return;
    }

    if (!contact.inboxEmail) {
      setStatus(contact.unavailableMessage);
      return;
    }

    const subject = `Contato ONG Gabriel de ${values.name.trim()}`;
    const body = `Nome: ${values.name.trim()}\nE-mail: ${values.email.trim()}\n\n${values.message.trim()}`;
    const mailto = `mailto:${encodeURIComponent(contact.inboxEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setStatus("Abrimos o seu programa de e-mail para enviar a mensagem.");
  }

  return (
    <section id="contato" aria-labelledby="contact-title" className="bg-canvas scroll-mt-24">
      <div className="mx-auto grid max-w-360 gap-10 px-4 py-16 lg:grid-cols-2 lg:px-20 lg:py-28">
        <div>
          <h2 id="contact-title" className="text-title font-bold text-ink-soft">
            {contact.title}
          </h2>
          <p className="mt-6 max-w-xl text-body text-text">{contact.description}</p>
          <ul className="mt-8 flex gap-4">
            {contact.social.map((profile) => (
              <li key={profile.id}>
                <a
                  href={profile.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-11 items-center justify-center rounded-full text-soil transition-colors hover:text-indigo"
                >
                  <SocialIcon id={profile.id} className="size-6" />
                  <span className="sr-only">{profile.label} (abre em uma nova aba)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          {contact.fields.map((field) => {
            const inputId = `${formId}-${field.id}`;
            const hintId = `${inputId}-hint`;
            const errorId = `${inputId}-error`;
            const error = errors[field.id];
            const describedBy = error ? `${hintId} ${errorId}` : hintId;
            const shared = {
              id: inputId,
              name: field.id,
              value: values[field.id],
              placeholder: field.placeholder,
              required: true,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": describedBy,
              onChange: (value: string) => {
                setValues((current) => ({ ...current, [field.id]: value }));
                setErrors((current) => ({ ...current, [field.id]: undefined }));
              },
            };

            return (
              <div key={field.id}>
                <label htmlFor={inputId} className="text-label font-semibold text-text">
                  {field.label}
                </label>
                {field.id === "message" ? (
                  <textarea
                    {...shared}
                    rows={4}
                    onChange={(event) => shared.onChange(event.target.value)}
                    className="mt-1 min-h-24 w-full rounded-lg border border-line bg-canvas px-2 py-2 text-body text-ink-soft placeholder:text-placeholder"
                  />
                ) : (
                  <input
                    {...shared}
                    type={field.id === "email" ? "email" : "text"}
                    autoComplete={field.id === "email" ? "email" : "name"}
                    onChange={(event) => shared.onChange(event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-2 text-body text-ink-soft placeholder:text-placeholder"
                  />
                )}
                <p id={hintId} className="pt-1 text-[0.6875rem] leading-snug text-muted">
                  {field.hint}
                </p>
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="group inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
            >
              {contact.submitLabel}
              <ArrowRightIcon className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:translate-none motion-reduce:group-hover:translate-none motion-reduce:group-focus-visible:translate-none" />
            </button>
          </div>
          <p
            id={statusId}
            role="status"
            aria-live="polite"
            className="min-h-6.25 text-body text-ink-soft"
          >
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}
