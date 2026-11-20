"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { Checkbox, FilePicker } from "@/components/admin/form-controls";
import { inputClass, textareaClass } from "@/components/admin/form-field";
import { createActivity, updateActivity } from "@/lib/admin/activities-api";
import { isAdminApiError } from "@/lib/admin/api";
import type { AdminActivity, AdminApiError } from "@/lib/admin/types";

// Keep these in sync with backend/src/ong_gabriel_api/activities/models.py.
const maxTitle = 60;
const maxDescription = 240;
const maxImageAlt = 160;
const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const imageTypeError = "Envie uma imagem JPEG, PNG ou WebP de até 5 MB.";

type ActivityFormProps = {
  mode: "create" | "edit";
  initial: AdminActivity | null;
  onCancel: () => void;
  onSaved: (item: AdminActivity) => void;
};

type FormErrors = Partial<Record<"title" | "description" | "image" | "image_alt", string>>;

export function ActivityForm({ mode, initial, onCancel, onSaved }: ActivityFormProps) {
  const formId = useId();
  const titleId = `${formId}-title`;
  const descriptionId = `${formId}-description`;
  const imageId = `${formId}-image`;
  const altId = `${formId}-alt`;
  const publishedId = `${formId}-published`;
  const titleCountId = `${formId}-title-count`;
  const descriptionCountId = `${formId}-description-count`;
  const generalId = `${formId}-general`;
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.image_alt ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const existingImage = initial?.image ?? null;

  function applyServerErrors(error: AdminApiError) {
    const next: FormErrors = {};
    for (const field of ["title", "description", "image", "image_alt"] as const) {
      const message = error.fields[field]?.[0];
      if (message) {
        next[field] = message;
      }
    }
    setErrors(next);
    setGeneralError(Object.keys(next).length > 0 ? "" : error.message);
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
    setErrors((current) => ({ ...current, image: undefined }));
    setImageFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedAlt = imageAlt.trim();

    if (trimmedTitle.length === 0) {
      nextErrors.title = "Informe o título.";
    } else if (trimmedTitle.length > maxTitle) {
      nextErrors.title = `O título pode ter no máximo ${maxTitle} caracteres.`;
    }
    if (trimmedDescription.length === 0) {
      nextErrors.description = "Escreva a descrição.";
    } else if (trimmedDescription.length > maxDescription) {
      nextErrors.description = `A descrição pode ter no máximo ${maxDescription} caracteres.`;
    }
    if (trimmedAlt.length > maxImageAlt) {
      nextErrors.image_alt = `A descrição da imagem pode ter no máximo ${maxImageAlt} caracteres.`;
    }
    if (mode === "create" && imageFile === null) {
      nextErrors.image = "Escolha uma imagem.";
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
        title: trimmedTitle,
        description: trimmedDescription,
        imageAlt: trimmedAlt,
        isPublished,
        imageFile,
      };
      const saved =
        mode === "edit" && initial
          ? await updateActivity(initial.id, payload)
          : await createActivity(payload);
      onSaved(saved);
    } catch (error) {
      if (isAdminApiError(error)) {
        applyServerErrors(error);
      } else {
        setGeneralError("Não foi possível salvar a atividade.");
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
        {mode === "edit" ? "Editar atividade" : "Criar atividade"}
      </h2>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label htmlFor={titleId} className="text-label font-semibold text-text">
            Título
          </label>
          <input
            ref={titleRef}
            id={titleId}
            name="title"
            type="text"
            maxLength={maxTitle}
            required
            value={title}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={`${titleCountId}${errors.title ? ` ${titleId}-error` : ""}`}
            onChange={(event) => {
              setTitle(event.target.value);
              setErrors((current) => ({ ...current, title: undefined }));
            }}
            className={inputClass}
          />
          <p
            id={titleCountId}
            aria-live="polite"
            className="pt-1 text-[0.6875rem] leading-snug text-muted"
          >
            {title.length} de {maxTitle} caracteres
          </p>
          <p
            id={`${titleId}-error`}
            className="min-h-5 text-sm font-semibold text-danger"
            aria-hidden={errors.title ? undefined : true}
          >
            {errors.title}
          </p>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor={descriptionId} className="text-label font-semibold text-text">
            Descrição
          </label>
          <textarea
            id={descriptionId}
            name="description"
            required
            maxLength={maxDescription}
            rows={4}
            value={description}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={`${descriptionCountId}${errors.description ? ` ${descriptionId}-error` : ""}`}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((current) => ({ ...current, description: undefined }));
            }}
            className={`${textareaClass} min-h-24`}
          />
          <p
            id={descriptionCountId}
            aria-live="polite"
            className="pt-1 text-[0.6875rem] leading-snug text-muted"
          >
            {description.length} de {maxDescription} caracteres
          </p>
          <p
            id={`${descriptionId}-error`}
            className="min-h-5 text-sm font-semibold text-danger"
            aria-hidden={errors.description ? undefined : true}
          >
            {errors.description}
          </p>
        </div>

        <div>
          <label htmlFor={imageId} className="text-label font-semibold text-text">
            Imagem
          </label>
          <FilePicker
            inputRef={fileRef}
            id={imageId}
            name="image"
            invalid={Boolean(errors.image)}
            describedBy={`${imageId}-hint${errors.image ? ` ${imageId}-error` : ""}`}
            buttonLabel={existingImage ? "Trocar imagem" : "Escolher imagem"}
            selectedLabel={imageFile?.name ?? null}
            onFiles={(files) => handleFile(files[0] ?? null)}
          />
          <p id={`${imageId}-hint`} className="pt-1 text-[0.6875rem] leading-snug text-muted">
            JPEG, PNG ou WebP de até 5 MB. A imagem é recortada no centro em formato quadrado.
          </p>
          {previewUrl ? (
            // biome-ignore lint/performance/noImgElement: object-URL preview of a local file
            <img
              src={previewUrl}
              alt=""
              width={120}
              height={120}
              className="mt-3 size-30 rounded-sm object-cover"
            />
          ) : existingImage ? (
            <Image
              src={existingImage}
              alt=""
              width={120}
              height={120}
              unoptimized
              className="mt-3 size-30 rounded-sm object-cover"
            />
          ) : null}
          <p
            id={`${imageId}-error`}
            className="min-h-5 pt-1 text-sm font-semibold text-danger"
            aria-hidden={errors.image ? undefined : true}
          >
            {errors.image}
          </p>
        </div>

        <div>
          <label htmlFor={altId} className="text-label font-semibold text-text">
            Descrição da imagem
          </label>
          <input
            id={altId}
            name="image_alt"
            type="text"
            maxLength={maxImageAlt}
            value={imageAlt}
            aria-invalid={errors.image_alt ? true : undefined}
            aria-describedby={`${altId}-hint${errors.image_alt ? ` ${altId}-error` : ""}`}
            onChange={(event) => {
              setImageAlt(event.target.value);
              setErrors((current) => ({ ...current, image_alt: undefined }));
            }}
            className={inputClass}
          />
          <p id={`${altId}-hint`} className="pt-1 text-[0.6875rem] leading-snug text-muted">
            Lida por leitores de tela. Deixe vazio se a imagem for só decorativa.
          </p>
          <p
            id={`${altId}-error`}
            className="min-h-5 text-sm font-semibold text-danger"
            aria-hidden={errors.image_alt ? undefined : true}
          >
            {errors.image_alt}
          </p>
        </div>

        <div className="flex items-center lg:col-span-2">
          <Checkbox
            id={publishedId}
            name="is_published"
            checked={isPublished}
            onChange={setIsPublished}
          >
            Publicar na página inicial
          </Checkbox>
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
