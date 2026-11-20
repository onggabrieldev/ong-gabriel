"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { revalidateHomeSection } from "@/app/admin/actions";
import { allowedImageTypes, imageTypeError, maxImageBytes } from "@/components/admin/album-form";
import { photoCountLabel } from "@/components/admin/album-list-card";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { FilePicker } from "@/components/admin/form-controls";
import { inputClass } from "@/components/admin/form-field";
import { ArrowRightIcon, TrashIcon } from "@/components/icons/icon";
import { showToast } from "@/components/ui/toast";
import { isAdminApiError } from "@/lib/admin/api";
import {
  deletePhoto,
  listPhotos,
  reorderPhotos,
  updatePhotoAlt,
  uploadPhoto,
} from "@/lib/admin/gallery-api";
import {
  type AdminGalleryAlbum,
  type AdminGalleryPhoto,
  SessionEndedError,
} from "@/lib/admin/types";

// Keep these in sync with backend/src/ong_gabriel_api/gallery/models.py.
const maxPhotos = 60;
const maxImageAlt = 160;

type AlbumPhotosProps = {
  album: AdminGalleryAlbum;
  onBack: () => void;
  onCountChange: (count: number) => void;
};

type UploadProgress = { done: number; total: number };

function errorMessage(error: unknown, fallback: string): string {
  return isAdminApiError(error) ? error.message : fallback;
}

function PhotoCard({
  photo,
  index,
  total,
  busy,
  deleteDialogId,
  onMove,
  onSaveAlt,
  onDelete,
}: {
  photo: AdminGalleryPhoto;
  index: number;
  total: number;
  busy: boolean;
  deleteDialogId: string;
  onMove: (to: number) => void;
  onSaveAlt: (value: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const altId = useId();
  const [alt, setAlt] = useState(photo.image_alt);
  const [saving, setSaving] = useState(false);
  const label = `foto ${index + 1}`;
  const changed = alt.trim() !== photo.image_alt;

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-line bg-canvas p-3">
      <Image
        src={photo.image}
        alt=""
        width={photo.width}
        height={photo.height}
        unoptimized
        className="aspect-square w-full rounded-sm object-cover"
      />
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (!changed || saving) {
            return;
          }
          setSaving(true);
          void onSaveAlt(alt.trim()).finally(() => setSaving(false));
        }}
      >
        <label htmlFor={altId} className="text-body font-semibold text-text">
          Descrição da {label}
        </label>
        <div className="flex gap-2">
          <input
            id={altId}
            type="text"
            maxLength={maxImageAlt}
            value={alt}
            placeholder="Para leitores de tela"
            onChange={(event) => setAlt(event.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={!changed || saving}
            className="mt-1 inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-3 text-body font-semibold text-indigo-deep transition-colors hover:bg-sky-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
            <span className="sr-only"> descrição da {label}</span>
          </button>
        </div>
      </form>
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy || index === 0}
            onClick={() => onMove(index - 1)}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas text-navy transition-colors hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRightIcon className="size-5 rotate-180" />
            <span className="sr-only">Mover {label} para antes</span>
          </button>
          <button
            type="button"
            disabled={busy || index === total - 1}
            onClick={() => onMove(index + 1)}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-navy bg-canvas text-navy transition-colors hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRightIcon className="size-5" />
            <span className="sr-only">Mover {label} para depois</span>
          </button>
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls={deleteDialogId}
          onClick={onDelete}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-danger bg-canvas text-danger transition-colors hover:bg-danger-soft"
        >
          <TrashIcon className="size-5" />
          <span className="sr-only">Apagar {label}</span>
        </button>
      </div>
    </article>
  );
}

export function AlbumPhotos({ album, onBack, onCountChange }: AlbumPhotosProps) {
  const uploadId = useId();
  const deleteDialogId = useId();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reorderingRef = useRef(false);
  const [photos, setPhotos] = useState<AdminGalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [reordering, setReordering] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminGalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await listPhotos(album.id);
        if (!cancelled) {
          setPhotos(list);
        }
      } catch (error) {
        if (error instanceof SessionEndedError) {
          return;
        }
        if (!cancelled) {
          setLoadFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [album.id]);

  function commit(next: AdminGalleryPhoto[], message: string) {
    setPhotos(next);
    onCountChange(next.length);
    setStatus(message);
    showToast(message, "success");
    void revalidateHomeSection("gallery");
  }

  function fail(error: unknown, fallback: string) {
    if (error instanceof SessionEndedError) {
      return;
    }
    const message = errorMessage(error, fallback);
    setStatus(message);
    showToast(message, "error");
  }

  async function handleUpload(files: File[]) {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    if (files.length === 0) {
      return;
    }

    const errors: string[] = [];
    const room = maxPhotos - photos.length;
    const valid = files.filter((file) => {
      const ok = allowedImageTypes.has(file.type) && file.size <= maxImageBytes;
      if (!ok) {
        errors.push(`${file.name}: ${imageTypeError}`);
      }
      return ok;
    });
    const accepted = valid.slice(0, Math.max(room, 0));
    if (valid.length > accepted.length) {
      errors.push(
        `O álbum pode ter no máximo ${maxPhotos} fotos. ${valid.length - accepted.length} não foram enviadas.`,
      );
    }

    // One request per photo keeps each upload under the size limit and lets
    // the editor see progress. They go one at a time to keep the order.
    let next = photos;
    setProgress({ done: 0, total: accepted.length });
    for (const [index, file] of accepted.entries()) {
      try {
        const saved = await uploadPhoto(album.id, file, "");
        next = [...next, saved];
        setPhotos(next);
      } catch (error) {
        if (error instanceof SessionEndedError) {
          return;
        }
        errors.push(`${file.name}: ${errorMessage(error, "Não foi possível enviar a foto.")}`);
      }
      setProgress({ done: index + 1, total: accepted.length });
    }
    setProgress(null);
    setUploadErrors(errors);

    const sent = next.length - photos.length;
    if (sent > 0) {
      commit(next, sent === 1 ? "1 foto enviada." : `${sent} fotos enviadas.`);
    } else if (errors.length > 0) {
      setStatus("Nenhuma foto foi enviada.");
      showToast("Nenhuma foto foi enviada.", "error");
    }
  }

  async function handleMove(from: number, to: number) {
    if (reorderingRef.current || to < 0 || to >= photos.length) {
      return;
    }
    reorderingRef.current = true;
    setReordering(true);
    const previous = photos;
    const next = [...photos];
    [next[from], next[to]] = [next[to], next[from]];
    setPhotos(next);
    try {
      const saved = await reorderPhotos(
        album.id,
        next.map((photo) => photo.id),
      );
      commit(saved, "Ordem atualizada.");
    } catch (error) {
      setPhotos(previous);
      fail(error, "Não foi possível reordenar as fotos.");
    } finally {
      reorderingRef.current = false;
      setReordering(false);
    }
  }

  async function handleSaveAlt(photo: AdminGalleryPhoto, value: string): Promise<boolean> {
    try {
      const saved = await updatePhotoAlt(album.id, photo.id, value);
      commit(
        photos.map((entry) => (entry.id === saved.id ? saved : entry)),
        "Descrição salva.",
      );
      return true;
    } catch (error) {
      fail(error, "Não foi possível salvar a descrição.");
      return false;
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      await deletePhoto(album.id, pendingDelete.id);
      deleteDialogRef.current?.close();
      setPendingDelete(null);
      commit(
        photos.filter((photo) => photo.id !== pendingDelete.id),
        "Foto apagada.",
      );
    } catch (error) {
      fail(error, "Não foi possível apagar a foto.");
    } finally {
      setDeleting(false);
    }
  }

  const uploading = progress !== null;
  const full = photos.length >= maxPhotos;
  const pendingIndex = pendingDelete ? photos.findIndex((p) => p.id === pendingDelete.id) : -1;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 w-fit cursor-pointer items-center gap-1.5 rounded-full px-2 text-label font-semibold text-navy transition-colors hover:bg-sky"
        >
          <ArrowRightIcon className="size-5 rotate-180" />
          Voltar para os álbuns
        </button>
        <div>
          <h1 className="text-title font-bold text-ink wrap-break-word">
            Fotos de “{album.title}”
          </h1>
          <p className="mt-1 text-body text-text">
            {loading ? "Carregando…" : `${photoCountLabel(photos.length)} de ${maxPhotos}.`} A ordem
            aqui é a ordem no site.
          </p>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      <div className="rounded-xl border border-line bg-canvas px-4 py-6">
        <label htmlFor={uploadId} className="text-label font-semibold text-text">
          Adicionar fotos
        </label>
        <FilePicker
          inputRef={fileRef}
          id={uploadId}
          name="image"
          multiple
          disabled={uploading || full || loading || loadFailed}
          invalid={false}
          describedBy={`${uploadId}-hint`}
          buttonLabel="Escolher fotos"
          selectedLabel={null}
          onFiles={(files) => {
            void handleUpload(files);
          }}
        />
        <p id={`${uploadId}-hint`} className="pt-1 text-[0.6875rem] leading-snug text-muted">
          {full
            ? `O álbum já tem ${maxPhotos} fotos. Apague alguma para enviar outras.`
            : "Escolha uma ou várias de uma vez. JPEG, PNG ou WebP de até 5 MB cada. As fotos mantêm o formato original."}
        </p>
        {progress ? (
          <p aria-live="polite" className="mt-3 text-body font-semibold text-navy">
            Enviando {Math.min(progress.done + 1, progress.total)} de {progress.total}…
          </p>
        ) : null}
        {uploadErrors.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1 text-body font-semibold text-danger">
            {uploadErrors.map((message) => (
              <li key={message} className="wrap-break-word">
                {message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {loading ? (
        <p className="text-body text-muted">Carregando fotos…</p>
      ) : loadFailed ? (
        <p className="text-body text-danger">Não foi possível carregar as fotos.</p>
      ) : photos.length === 0 ? (
        <div className="rounded-xl border border-line bg-canvas px-4 py-10 text-center">
          <p className="text-title font-bold text-ink-soft">Nenhuma foto neste álbum.</p>
          <p className="mt-2 text-body text-text">Use Adicionar fotos para enviar as primeiras.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <PhotoCard
                photo={photo}
                index={index}
                total={photos.length}
                busy={reordering || uploading}
                deleteDialogId={deleteDialogId}
                onMove={(to) => {
                  void handleMove(index, to);
                }}
                onSaveAlt={(value) => handleSaveAlt(photo, value)}
                onDelete={() => {
                  setPendingDelete(photo);
                  deleteDialogRef.current?.showModal();
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <DeleteDialog
        dialogRef={deleteDialogRef}
        dialogId={deleteDialogId}
        title={`Apagar a foto ${pendingIndex + 1}?`}
        busy={deleting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
