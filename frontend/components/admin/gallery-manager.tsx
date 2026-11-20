"use client";

import { useEffect, useId, useRef, useState } from "react";
import { revalidateHomeSection } from "@/app/admin/actions";
import { AlbumForm } from "@/components/admin/album-form";
import { AlbumListCard } from "@/components/admin/album-list-card";
import { AlbumPhotos } from "@/components/admin/album-photos";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { ArrowRightIcon } from "@/components/icons/icon";
import { showToast } from "@/components/ui/toast";
import { isAdminApiError } from "@/lib/admin/api";
import { deleteAlbum, listAlbums, patchAlbumPublished } from "@/lib/admin/gallery-api";
import { type AdminGalleryAlbum, SessionEndedError } from "@/lib/admin/types";

type FormState = { mode: "create" } | { mode: "edit"; item: AdminGalleryAlbum };

// Newest first, like the public gallery.
function byHeldOn(a: AdminGalleryAlbum, b: AdminGalleryAlbum): number {
  return b.held_on.localeCompare(a.held_on) || b.created_at.localeCompare(a.created_at);
}

function distinctSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function GalleryManager() {
  const deleteDialogId = useId();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<AdminGalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [photosOf, setPhotosOf] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminGalleryAlbum | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await listAlbums();
        if (!cancelled) {
          setItems(list);
        }
      } catch (error) {
        if (error instanceof SessionEndedError) {
          return;
        }
        if (!cancelled) {
          setLoadFailed(true);
          setStatus("Não foi possível carregar a galeria.");
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
  }, []);

  async function afterChange(next: AdminGalleryAlbum[], message: string) {
    setItems([...next].sort(byHeldOn));
    setStatus(message);
    showToast(message, "success");
    await revalidateHomeSection("gallery");
  }

  function fail(error: unknown, fallback: string) {
    if (error instanceof SessionEndedError) {
      return;
    }
    const message = isAdminApiError(error) ? error.message : fallback;
    setStatus(message);
    showToast(message, "error");
  }

  async function handleTogglePublish(item: AdminGalleryAlbum) {
    const previous = items;
    const nextPublished = !item.is_published;
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, is_published: nextPublished } : entry,
      ),
    );
    try {
      const saved = await patchAlbumPublished(item.id, nextPublished);
      const next = previous.map((entry) => (entry.id === saved.id ? saved : entry));
      await afterChange(next, nextPublished ? "Álbum publicado." : "Álbum ocultado.");
    } catch (error) {
      setItems(previous);
      fail(error, "Não foi possível atualizar a publicação.");
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      await deleteAlbum(pendingDelete.id);
      const next = items.filter((item) => item.id !== pendingDelete.id);
      deleteDialogRef.current?.close();
      setPendingDelete(null);
      await afterChange(next, "Álbum apagado.");
    } catch (error) {
      fail(error, "Não foi possível apagar o álbum.");
    } finally {
      setDeleting(false);
    }
  }

  const photoAlbum = photosOf ? items.find((item) => item.id === photosOf) : undefined;
  if (photoAlbum) {
    return (
      <AlbumPhotos
        album={photoAlbum}
        onBack={() => setPhotosOf(null)}
        onCountChange={(count) =>
          setItems((current) =>
            current.map((entry) =>
              entry.id === photoAlbum.id ? { ...entry, photo_count: count } : entry,
            ),
          )
        }
      />
    );
  }

  const editingId = form?.mode === "edit" ? form.item.id : null;
  const visibleItems = items.filter((item) => item.id !== editingId);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-ink">Gerenciar galeria</h1>
          <p className="mt-1 text-body text-text">
            Crie um álbum para cada evento e adicione as fotos dele
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ mode: "create" })}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
        >
          Novo álbum
          <ArrowRightIcon className="size-6" />
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {form ? (
        <AlbumForm
          key={form.mode === "edit" ? form.item.id : "create"}
          mode={form.mode}
          initial={form.mode === "edit" ? form.item : null}
          typeSuggestions={distinctSorted(items.map((item) => item.event_type))}
          locationSuggestions={distinctSorted(items.map((item) => item.location))}
          onCancel={() => setForm(null)}
          onSaved={(saved) => {
            const exists = items.some((item) => item.id === saved.id);
            const next = exists
              ? items.map((item) => (item.id === saved.id ? saved : item))
              : [...items, saved];
            setForm(null);
            void afterChange(next, exists ? "Álbum atualizado." : "Álbum criado.");
            // A new album has no photos yet, so go straight to adding them.
            if (!exists) {
              setPhotosOf(saved.id);
            }
          }}
        />
      ) : null}

      {loading ? (
        <p className="text-body text-muted">Carregando galeria…</p>
      ) : loadFailed ? (
        <p className="text-body text-danger">Não foi possível carregar a galeria.</p>
      ) : visibleItems.length === 0 ? (
        form ? null : (
          <div className="rounded-xl border border-line bg-canvas px-4 py-10 text-center">
            <p className="text-title font-bold text-ink-soft">Nenhum álbum na galeria.</p>
            <p className="mt-2 text-body text-text">
              Clique em Novo álbum para adicionar o primeiro.
            </p>
          </div>
        )
      ) : (
        <ul className="flex flex-col gap-4">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <AlbumListCard
                album={item}
                deleteDialogId={deleteDialogId}
                onPhotos={() => {
                  setForm(null);
                  setPhotosOf(item.id);
                }}
                onTogglePublish={() => {
                  void handleTogglePublish(item);
                }}
                onEdit={() => setForm({ mode: "edit", item })}
                onDelete={() => {
                  setPendingDelete(item);
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
        title={`Apagar o álbum “${pendingDelete?.title ?? ""}” e todas as fotos dele?`}
        busy={deleting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
