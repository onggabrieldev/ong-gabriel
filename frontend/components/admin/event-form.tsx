"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { DatePicker, TimePicker } from "@/components/admin/date-picker";
import { Checkbox, FilePicker, SelectInput } from "@/components/admin/form-controls";
import { Field, inputClass, textareaClass } from "@/components/admin/form-field";
import { isAdminApiError } from "@/lib/admin/api";
import { addHours, toWallClock } from "@/lib/admin/event-dates";
import { createEvent, updateEvent } from "@/lib/admin/events-api";
import type { AdminApiError, AdminEvent, AdminEventAccent } from "@/lib/admin/types";

// Keep these in sync with backend/src/ong_gabriel_api/events/models.py.
const maxTitle = 120;
const maxSummary = 280;
const maxDescription = 4000;
const maxEventType = 60;
const maxLocation = 160;
const maxImageAlt = 160;
const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const imageTypeError = "Envie uma imagem JPEG, PNG ou WebP de até 5 MB.";
const defaultDurationHours = 2;

const accentOptions: readonly { value: AdminEventAccent; label: string }[] = [
  { value: "sky", label: "Azul" },
  { value: "butter", label: "Amarelo" },
  { value: "teal", label: "Verde" },
];

const fieldNames = [
  "title",
  "summary",
  "description",
  "event_type",
  "location",
  "starts_at",
  "ends_at",
  "accent",
  "image",
  "image_alt",
] as const;

type FieldName = (typeof fieldNames)[number];
type FormErrors = Partial<Record<FieldName, string>>;

const wallClockPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isWallClock(value: string): boolean {
  return wallClockPattern.test(value);
}

type DateTimeFieldsProps = {
  id: string;
  label: string;
  // "YYYY-MM-DDTHH:mm", or a part of it while the editor picks.
  value: string;
  minDate?: string;
  invalid: boolean;
  describedBy: string | undefined;
  onChange: (value: string) => void;
};

function DateTimeFields({
  id,
  label,
  value,
  minDate,
  invalid,
  describedBy,
  onChange,
}: DateTimeFieldsProps) {
  const [datePart = "", timePart = ""] = value.split("T");
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_--spacing(28)] gap-2">
      <DatePicker
        id={id}
        label={`${label}, data`}
        value={datePart}
        min={minDate}
        invalid={invalid}
        describedBy={describedBy}
        onChange={(date) => onChange(`${date}T${timePart}`)}
      />
      <TimePicker
        id={`${id}-time`}
        label={`${label}, hora`}
        value={timePart}
        invalid={invalid}
        describedBy={describedBy}
        onChange={(time) => onChange(`${datePart}T${time}`)}
      />
    </div>
  );
}

type EventFormProps = {
  mode: "create" | "edit";
  initial: AdminEvent | null;
  typeSuggestions: readonly string[];
  locationSuggestions: readonly string[];
  onCancel: () => void;
  onSaved: (item: AdminEvent) => void;
};

export function EventForm({
  mode,
  initial,
  typeSuggestions,
  locationSuggestions,
  onCancel,
  onSaved,
}: EventFormProps) {
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
  const [description, setDescription] = useState(initial?.description ?? "");
  const [eventType, setEventType] = useState(initial?.event_type ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [startsAt, setStartsAt] = useState(initial ? toWallClock(initial.starts_at) : "");
  const [endsAt, setEndsAt] = useState(initial ? toWallClock(initial.ends_at) : "");
  const [accent, setAccent] = useState<AdminEventAccent>(initial?.accent ?? "sky");
  const [imageAlt, setImageAlt] = useState(initial?.image_alt ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const existingImage = initial?.image && !removeImage && !imageFile ? initial.image : null;

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
      setImageFile(null);
      return;
    }
    if (!allowedImageTypes.has(file.type) || file.size > maxImageBytes) {
      setErrors((current) => ({ ...current, image: imageTypeError }));
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }
    clearError("image");
    setRemoveImage(false);
    setImageFile(file);
  }

  function handleStartsAt(value: string) {
    setStartsAt(value);
    clearError("starts_at");
    // Suggest an end time until the editor picks one that fits.
    if (isWallClock(value) && (!isWallClock(endsAt) || endsAt <= value)) {
      setEndsAt(addHours(value, defaultDurationHours));
      clearError("ends_at");
    }
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
    checkText("description", description.trim(), maxDescription, null);
    checkText("event_type", eventType.trim(), maxEventType, "Informe o tipo de evento.");
    checkText("location", location.trim(), maxLocation, "Informe o local.");
    checkText("image_alt", imageAlt.trim(), maxImageAlt, null);
    if (!isWallClock(startsAt)) {
      next.starts_at = "Informe a data e a hora de início.";
    }
    if (!isWallClock(endsAt)) {
      next.ends_at = "Informe a data e a hora de término.";
    } else if (isWallClock(startsAt) && endsAt <= startsAt) {
      next.ends_at = "O término deve ser depois do início.";
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
        description: description.trim(),
        eventType: eventType.trim(),
        location: location.trim(),
        startsAt,
        endsAt,
        accent,
        imageAlt: imageAlt.trim(),
        isPublished,
        imageFile,
        removeImage: mode === "edit" && removeImage && imageFile === null,
      };
      const saved =
        mode === "edit" && initial
          ? await updateEvent(initial.id, payload)
          : await createEvent(payload);
      onSaved(saved);
    } catch (error) {
      if (isAdminApiError(error)) {
        applyServerErrors(error);
      } else {
        setGeneralError("Não foi possível salvar o evento.");
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
        {mode === "edit" ? "Editar evento" : "Criar evento"}
      </h2>

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

        <Field
          id={ids.starts_at}
          label="Início"
          error={errors.starts_at}
          hint="Horário de Brasília."
        >
          {(describedBy) => (
            <DateTimeFields
              id={ids.starts_at}
              label="Início"
              value={startsAt}
              invalid={Boolean(errors.starts_at)}
              describedBy={describedBy}
              onChange={handleStartsAt}
            />
          )}
        </Field>

        <Field id={ids.ends_at} label="Término" error={errors.ends_at} hint="Horário de Brasília.">
          {(describedBy) => (
            <DateTimeFields
              id={ids.ends_at}
              label="Término"
              value={endsAt}
              minDate={startsAt.slice(0, 10) || undefined}
              invalid={Boolean(errors.ends_at)}
              describedBy={describedBy}
              onChange={(value) => {
                setEndsAt(value);
                clearError("ends_at");
              }}
            />
          )}
        </Field>

        <Field
          id={ids.summary}
          label="Resumo"
          error={errors.summary}
          hint={`Aparece no card da agenda. ${summary.length} de ${maxSummary} caracteres`}
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
          id={ids.description}
          label="Descrição completa"
          error={errors.description}
          hint={`Opcional. Aparece em Detalhes. Separe parágrafos com uma linha em branco. ${description.length} de ${maxDescription} caracteres`}
          liveHint
          className="lg:col-span-2"
        >
          {(describedBy) => (
            <textarea
              id={ids.description}
              name="description"
              maxLength={maxDescription}
              rows={6}
              value={description}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={describedBy}
              onChange={(event) => {
                setDescription(event.target.value);
                clearError("description");
              }}
              className={`${textareaClass} min-h-32`}
            />
          )}
        </Field>

        <Field
          id={ids.accent}
          label="Cor da data"
          error={errors.accent}
          hint="Cor do bloco com o dia e a hora no card."
        >
          {(describedBy) => (
            <SelectInput
              id={ids.accent}
              name="accent"
              value={accent}
              invalid={Boolean(errors.accent)}
              describedBy={describedBy}
              onChange={(event) => {
                const next = accentOptions.find((option) => option.value === event.target.value);
                if (next) {
                  setAccent(next.value);
                  clearError("accent");
                }
              }}
            >
              {accentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>

        <div className="hidden lg:block" />

        <Field
          id={ids.image}
          label="Imagem"
          error={errors.image}
          hint="Opcional. JPEG, PNG ou WebP de até 5 MB. A imagem é recortada no centro em formato quadrado."
        >
          {(describedBy) => (
            <>
              <FilePicker
                inputRef={fileRef}
                id={ids.image}
                name="image"
                invalid={Boolean(errors.image)}
                describedBy={describedBy}
                buttonLabel={existingImage ? "Trocar imagem" : "Escolher imagem"}
                selectedLabel={imageFile?.name ?? null}
                onFiles={(files) => handleFile(files[0] ?? null)}
              />
              {previewUrl || existingImage ? (
                <div className="mt-3 flex items-center gap-4">
                  {previewUrl ? (
                    // biome-ignore lint/performance/noImgElement: object-URL preview of a local file
                    <img
                      src={previewUrl}
                      alt=""
                      width={120}
                      height={120}
                      className="size-30 rounded-sm object-cover"
                    />
                  ) : existingImage ? (
                    <Image
                      src={existingImage}
                      alt=""
                      width={120}
                      height={120}
                      unoptimized
                      className="size-30 rounded-sm object-cover"
                    />
                  ) : null}
                  {mode === "edit" && existingImage ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveImage(true);
                        setImageFile(null);
                        if (fileRef.current) {
                          fileRef.current.value = "";
                        }
                      }}
                      className="inline-flex h-10 cursor-pointer items-center rounded-full border border-danger bg-canvas px-4 text-body font-semibold text-danger transition-colors hover:bg-danger-soft"
                    >
                      Remover imagem
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </Field>

        <Field
          id={ids.image_alt}
          label="Descrição da imagem"
          error={errors.image_alt}
          hint="Lida por leitores de tela. Deixe vazio se a imagem for só decorativa."
        >
          {(describedBy) => (
            <input
              id={ids.image_alt}
              name="image_alt"
              type="text"
              maxLength={maxImageAlt}
              value={imageAlt}
              aria-invalid={errors.image_alt ? true : undefined}
              aria-describedby={describedBy}
              onChange={(event) => {
                setImageAlt(event.target.value);
                clearError("image_alt");
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
            Publicar na agenda
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
