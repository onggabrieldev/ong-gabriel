"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { DatePicker } from "@/components/admin/date-picker";
import { Checkbox, FilePicker } from "@/components/admin/form-controls";
import { Field, inputClass, textareaClass } from "@/components/admin/form-field";
import { isAdminApiError } from "@/lib/admin/api";
import { createAlbum, updateAlbum } from "@/lib/admin/gallery-api";
import type { AdminApiError, AdminGalleryAlbum } from "@/lib/admin/types";

// Keep these in sync with backend/src/ong_gabriel_api/gallery/models.py.
const maxTitle = 120;
const maxSummary = 280;
const maxEventType = 60;
const maxLocation = 160;
const maxCoverAlt = 160;
export const maxImageBytes = 5 * 1024 * 1024;
export const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const imageTypeError = "Envie uma imagem JPEG, PNG ou WebP de até 5 MB.";

const fieldNames = [
  "title",
  "summary",
  "event_type",
  "location",
  "held_on",
  "cover",
  "cover_alt",
] as const;

type FieldName = (typeof fieldNames)[number];
type FormErrors = Partial<Record<FieldName, string>>;

type AlbumFormProps = {
  mode: "create" | "edit";
  initial: AdminGalleryAlbum | null;
  typeSuggestions: readonly string[];
  locationSuggestions: readonly string[];
  onCancel: () => void;
  onSaved: (item: AdminGalleryAlbum) => void;
};

export function AlbumForm({
  mode,
  initial,
  typeSuggestions,
  locationSuggestions,
  onCancel,
  onSaved,
}: AlbumFormProps) {
  const formId = useId();
  const ids = Object.fromEntries(fieldNames.map((name) => [name, `${formId}-${name}`])) as Record<
    FieldName,
    string
  >;
  const publishedId = `${formId}-published`;
  const typeListId = `${formId}-type-list`;
  const locationListId = `${formId}-location-list`;
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [eventType, setEventType] = useState(initial?.event_type ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [heldOn, setHeldOn] = useState(initial?.held_on ?? "");
  const [coverAlt, setCoverAlt] = useState(initial?.cover_alt ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!coverFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const existingCover = initial && !coverFile ? initial.cover : null;

  function clearError(field: FieldName) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function applyServerErrors(error: AdminApiError) {
    const next: FormErrors = {};
    for (const field of fieldNames) {
      const message = error.fields[field]?.[0];
      if (message) {
        next[field] = message;
      }
    }
    setErrors(next);
    setGeneralError(Object.keys(next).length > 0 ? "Revise os campos destacados." : error.message);
  }

  function handleFile(file: File | null) {
    if (!file) {
      setCoverFile(null);
      return;
    }
    if (!allowedImageTypes.has(file.type) || file.size > maxImageBytes) {
      setErrors((current) => ({ ...current, cover: imageTypeError }));
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }
    clearError("cover");
    setCoverFile(file);
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    const checkText = (field: FieldName, value: string, max: number, empty: string | null) => {
      if (empty !== null && value.length === 0) {
        next[field] = empty;
      } else if (value.length > max) {
        next[field] = `Use no máximo ${max} caracteres.`;
      }
    };
    checkText("title", title.trim(), maxTitle, "Informe o título.");
    checkText("summary", summary.trim(), maxSummary, "Escreva o resumo.");
    checkText("event_type", eventType.trim(), maxEventType, "Informe o tipo de evento.");
    checkText("location", location.trim(), maxLocation, "Informe o local.");
    checkText("cover_alt", coverAlt.trim(), maxCoverAlt, null);
    if (!heldOn) {
      next.held_on = "Informe a data do evento.";
    }
    if (mode === "create" && !coverFile) {
      next.cover = "Escolha a imagem de capa.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setGeneralError("Revise os campos destacados.");
      return;
    }

    setSaving(true);
    setGeneralError("");

    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        eventType: eventType.trim(),
        location: location.trim(),
        heldOn,
        coverAlt: coverAlt.trim(),
        isPublished,
        coverFile,
      };
      const saved =
        mode === "edit" && initial
          ? await updateAlbum(initial.id, payload)
          : await createAlbum(payload);
      onSaved(saved);
    } catch (error) {
      if (isAdminApiError(error)) {
        applyServerErrors(error);
      } else {
        setGeneralError("Não foi possível salvar o álbum.");
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
        {mode === "edit" ? "Editar álbum" : "Criar álbum"}
      </h2>
      {mode === "create" ? (
        <p className="mt-1 text-body text-muted">Depois de salvar, adicione as fotos do álbum.</p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Field
          id={ids.title}
          label="Título"
          error={errors.title}
          hint={`${title.length} de ${maxTitle} caracteres`}
          liveHint
          className="lg:col-span-2"
        >
          {(describedBy) => (
            <input
              ref={titleRef}
              id={ids.title}
              name="title"
              type="text"
              maxLength={maxTitle}
              required
              value={title}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={describedBy}
              onChange={(event) => {
                setTitle(event.target.value);
                clearError("title");
              }}
              className={inputClass}
            />
          )}
        </Field>

        <Field id={ids.event_type} label="Tipo de evento" error={errors.event_type}>
          {(describedBy) => (
            <>
              <input
                id={ids.event_type}
                name="event_type"
                type="text"
                list={typeListId}
                maxLength={maxEventType}
                required
                value={eventType}
                aria-invalid={errors.event_type ? true : undefined}
                aria-describedby={describedBy}
                onChange={(event) => {
                  setEventType(event.target.value);
                  clearError("event_type");
                }}
                className={inputClass}
              />
              <datalist id={typeListId}>
                {typeSuggestions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </>
          )}
        </Field>

        <Field id={ids.location} label="Local" error={errors.location}>
          {(describedBy) => (
            <>
              <input
                id={ids.location}
                name="location"
                type="text"
                list={locationListId}
                maxLength={maxLocation}
                required
                value={location}
                aria-invalid={errors.location ? true : undefined}
                aria-describedby={describedBy}
                onChange={(event) => {
                  setLocation(event.target.value);
                  clearError("location");
                }}
                className={inputClass}
              />
              <datalist id={locationListId}>
                {locationSuggestions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </>
          )}
        </Field>

        <Field id={ids.held_on} label="Data do evento" error={errors.held_on}>
          {(describedBy) => (
            <DatePicker
              id={ids.held_on}
              label="Data do evento"
              value={heldOn}
              invalid={Boolean(errors.held_on)}
              describedBy={describedBy}
              onChange={(value) => {
                setHeldOn(value);
                clearError("held_on");
              }}
            />
          )}
        </Field>

        <div className="hidden lg:block" />

        <Field
          id={ids.summary}
          label="Resumo"
          error={errors.summary}
          hint={`Aparece no card da galeria. ${summary.length} de ${maxSummary} caracteres`}
          liveHint
          className="lg:col-span-2"
        >
          {(describedBy) => (
            <textarea
              id={ids.summary}
              name="summary"
              required
              maxLength={maxSummary}
              rows={3}
              value={summary}
              aria-invalid={errors.summary ? true : undefined}
              aria-describedby={describedBy}
              onChange={(event) => {
                setSummary(event.target.value);
                clearError("summary");
              }}
              className={`${textareaClass} min-h-20`}
            />
          )}
        </Field>

        <Field
          id={ids.cover}
          label="Capa"
          error={errors.cover}
          hint={
            mode === "edit"
              ? "Escolha outra imagem só se quiser trocar a capa. JPEG, PNG ou WebP de até 5 MB, recortada no centro em formato quadrado."
              : "JPEG, PNG ou WebP de até 5 MB. A imagem é recortada no centro em formato quadrado."
          }
        >
          {(describedBy) => (
            <>
              <FilePicker
                inputRef={fileRef}
                id={ids.cover}
                name="cover"
                invalid={Boolean(errors.cover)}
                describedBy={describedBy}
                buttonLabel={mode === "edit" ? "Trocar capa" : "Escolher capa"}
                selectedLabel={coverFile?.name ?? null}
                onFiles={(files) => handleFile(files[0] ?? null)}
              />
              {previewUrl ? (
                // biome-ignore lint/performance/noImgElement: object-URL preview of a local file
                <img
                  src={previewUrl}
                  alt=""
                  width={120}
                  height={120}
                  className="mt-3 size-30 rounded-sm object-cover"
                />
              ) : existingCover ? (
                <Image
                  src={existingCover}
                  alt=""
                  width={120}
                  height={120}
                  unoptimized
                  className="mt-3 size-30 rounded-sm object-cover"
                />
              ) : null}
            </>
          )}
        </Field>

        <Field
          id={ids.cover_alt}
          label="Descrição da capa"
          error={errors.cover_alt}
          hint="Lida por leitores de tela. Deixe vazio se a imagem for só decorativa."
        >
          {(describedBy) => (
            <input
              id={ids.cover_alt}
              name="cover_alt"
              type="text"
              maxLength={maxCoverAlt}
              value={coverAlt}
              aria-invalid={errors.cover_alt ? true : undefined}
              aria-describedby={describedBy}
              onChange={(event) => {
                setCoverAlt(event.target.value);
                clearError("cover_alt");
              }}
              className={inputClass}
            />
          )}
        </Field>

        <div className="flex items-center lg:col-span-2">
          <Checkbox
            id={publishedId}
            name="is_published"
            checked={isPublished}
            onChange={setIsPublished}
          >
            Publicar na galeria
          </Checkbox>
        </div>
      </div>

      <p
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
