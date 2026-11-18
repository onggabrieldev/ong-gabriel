"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { createTestimonial, isAdminApiError, updateTestimonial } from "@/lib/admin/api";
import type { AdminApiError, AdminTestimonial } from "@/lib/admin/types";

const maxName = 80;
const maxRole = 80;
const maxQuote = 500;
const maxPortraitBytes = 5 * 1024 * 1024;
const allowedPortraitTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type TestimonialFormProps = {
  mode: "create" | "edit";
  initial: AdminTestimonial | null;
  onCancel: () => void;
  onSaved: (item: AdminTestimonial) => void;
};

type FormErrors = Partial<Record<"name" | "role" | "quote" | "portrait", string>>;

export function TestimonialForm({ mode, initial, onCancel, onSaved }: TestimonialFormProps) {
  const formId = useId();
  const nameId = `${formId}-name`;
  const roleId = `${formId}-role`;
  const quoteId = `${formId}-quote`;
  const photoId = `${formId}-photo`;
  const publishedId = `${formId}-published`;
  const quoteCountId = `${formId}-quote-count`;
  const generalId = `${formId}-general`;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [quote, setQuote] = useState(initial?.quote ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePortrait, setRemovePortrait] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!portraitFile) {
      return;
    }
    const url = URL.createObjectURL(portraitFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [portraitFile]);

  const existingPortrait =
    initial?.portrait && !removePortrait && !portraitFile ? initial.portrait : null;
  const shownPortrait = previewUrl ?? existingPortrait;

  function applyServerErrors(error: AdminApiError) {
    const next: FormErrors = {};
    if (error.fields.name?.[0]) {
      next.name = error.fields.name[0];
    }
    if (error.fields.role?.[0]) {
      next.role = error.fields.role[0];
    }
    if (error.fields.quote?.[0]) {
      next.quote = error.fields.quote[0];
    }
    if (error.fields.portrait?.[0]) {
      next.portrait = error.fields.portrait[0];
    }
    setErrors(next);
    setGeneralError(Object.keys(next).length > 0 ? "" : error.message);
  }

  function handleFile(file: File | null) {
    if (!file) {
      setPortraitFile(null);
      return;
    }
    if (!allowedPortraitTypes.has(file.type)) {
      setErrors((current) => ({
        ...current,
        portrait: "Envie uma imagem JPEG, PNG ou WebP de até 5 MB.",
      }));
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }
    if (file.size > maxPortraitBytes) {
      setErrors((current) => ({
        ...current,
        portrait: "Envie uma imagem JPEG, PNG ou WebP de até 5 MB.",
      }));
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }
    setErrors((current) => ({ ...current, portrait: undefined }));
    setRemovePortrait(false);
    setPortraitFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    const trimmedQuote = quote.trim();

    if (trimmedName.length === 0) {
      nextErrors.name = "Informe o nome.";
    } else if (trimmedName.length > maxName) {
      nextErrors.name = `O nome pode ter no máximo ${maxName} caracteres.`;
    }
    if (trimmedRole.length > maxRole) {
      nextErrors.role = `O papel pode ter no máximo ${maxRole} caracteres.`;
    }
    if (trimmedQuote.length === 0) {
      nextErrors.quote = "Escreva o depoimento.";
    } else if (trimmedQuote.length > maxQuote) {
      nextErrors.quote = `O depoimento pode ter no máximo ${maxQuote} caracteres.`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setGeneralError("Revise os campos destacados.");
      return;
    }

    setSaving(true);
    setGeneralError("");

    try {
      const payload = {
        name: trimmedName,
        role: trimmedRole,
        quote: trimmedQuote,
        isPublished,
        portraitFile,
        removePortrait: mode === "edit" && removePortrait && portraitFile === null,
      };
      const saved =
        mode === "edit" && initial
          ? await updateTestimonial(initial.id, payload)
          : await createTestimonial(payload);
      onSaved(saved);
    } catch (error) {
      if (isAdminApiError(error)) {
        applyServerErrors(error);
      } else {
        setGeneralError("Não foi possível salvar o depoimento.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-canvas px-4 py-10 lg:px-4"
    >
      <h2 className="text-label font-semibold text-ink">
        {mode === "edit" ? "Editar depoimento" : "Criar depoimento"}
      </h2>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor={nameId} className="text-label font-semibold text-text">
            Nome
          </label>
          <input
            ref={nameRef}
            id={nameId}
            name="name"
            type="text"
            maxLength={maxName}
            required
            value={name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            className="mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-2 text-body text-ink-soft"
          />
          <p
            id={`${nameId}-error`}
            className="min-h-5 pt-1 text-sm font-semibold text-danger"
            aria-hidden={errors.name ? undefined : true}
          >
            {errors.name}
          </p>
        </div>

        <div>
          <label htmlFor={roleId} className="text-label font-semibold text-text">
            Papel ou descrição
          </label>
          <input
            id={roleId}
            name="role"
            type="text"
            maxLength={maxRole}
            value={role}
            aria-invalid={errors.role ? true : undefined}
            aria-describedby={`${roleId}-hint${errors.role ? ` ${roleId}-error` : ""}`}
            onChange={(event) => {
              setRole(event.target.value);
              setErrors((current) => ({ ...current, role: undefined }));
            }}
            className="mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-2 text-body text-ink-soft"
          />
          <p id={`${roleId}-hint`} className="pt-1 text-[0.6875rem] leading-snug text-muted">
            Voluntária desde 2021
          </p>
          <p
            id={`${roleId}-error`}
            className="min-h-5 text-sm font-semibold text-danger"
            aria-hidden={errors.role ? undefined : true}
          >
            {errors.role}
          </p>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor={quoteId} className="text-label font-semibold text-text">
            Depoimento
          </label>
          <textarea
            id={quoteId}
            name="quote"
            required
            maxLength={maxQuote}
            rows={5}
            value={quote}
            aria-invalid={errors.quote ? true : undefined}
            aria-describedby={`${quoteCountId}${errors.quote ? ` ${quoteId}-error` : ""}`}
            onChange={(event) => {
              setQuote(event.target.value);
              setErrors((current) => ({ ...current, quote: undefined }));
            }}
            className="mt-1 min-h-24 w-full rounded-lg border border-line bg-canvas px-2 py-2 text-body text-ink-soft"
          />
          <p
            id={quoteCountId}
            aria-live="polite"
            className="pt-1 text-[0.6875rem] leading-snug text-muted"
          >
            {quote.length} de {maxQuote} caracteres
          </p>
          <p
            id={`${quoteId}-error`}
            className="min-h-5 text-sm font-semibold text-danger"
            aria-hidden={errors.quote ? undefined : true}
          >
            {errors.quote}
          </p>
        </div>

        <div>
          <label htmlFor={photoId} className="text-label font-semibold text-text">
            Foto
          </label>
          <input
            ref={fileRef}
            id={photoId}
            name="portrait"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-invalid={errors.portrait ? true : undefined}
            aria-describedby={errors.portrait ? `${photoId}-error` : undefined}
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-2 py-2 text-body text-ink-soft file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-sky-deep file:px-3 file:py-1 file:text-body file:font-semibold file:text-indigo"
          />
          {shownPortrait ? (
            <div className="mt-3 flex items-center gap-4">
              {previewUrl ? (
                // biome-ignore lint/performance/noImgElement: object-URL preview of a local file
                <img
                  src={previewUrl}
                  alt=""
                  width={70}
                  height={70}
                  className="size-17.5 rounded-full object-cover"
                />
              ) : (
                <Image
                  src={shownPortrait}
                  alt=""
                  width={70}
                  height={70}
                  sizes="70px"
                  unoptimized
                  className="size-17.5 rounded-full object-cover"
                />
              )}
              {mode === "edit" && existingPortrait ? (
                <button
                  type="button"
                  onClick={() => {
                    setRemovePortrait(true);
                    setPortraitFile(null);
                    if (fileRef.current) {
                      fileRef.current.value = "";
                    }
                  }}
                  className="inline-flex h-10 cursor-pointer items-center rounded-full border border-navy bg-canvas px-4 text-body font-semibold text-navy transition-colors hover:bg-sky"
                >
                  Remover foto
                </button>
              ) : null}
            </div>
          ) : null}
          <p
            id={`${photoId}-error`}
            className="min-h-5 pt-1 text-sm font-semibold text-danger"
            aria-hidden={errors.portrait ? undefined : true}
          >
            {errors.portrait}
          </p>
        </div>

        <div className="flex items-center">
          <label
            htmlFor={publishedId}
            className="flex cursor-pointer items-center gap-2 text-body text-text"
          >
            <input
              id={publishedId}
              name="is_published"
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="size-6 cursor-pointer rounded-sm border-placeholder"
            />
            Publicar na página inicial
          </label>
        </div>
      </div>

      <p
        id={generalId}
        role="status"
        className="mt-4 min-h-6 text-body font-semibold text-danger"
        aria-hidden={generalError ? undefined : true}
      >
        {generalError}
      </p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep disabled:cursor-wait disabled:opacity-70"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
