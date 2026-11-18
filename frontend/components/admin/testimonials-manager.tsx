"use client";

import { useEffect, useId, useRef, useState } from "react";
import { revalidateTestimonials } from "@/app/admin/actions";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { TestimonialListCard } from "@/components/admin/testimonial-list-card";
import { ArrowRightIcon } from "@/components/icons/icon";
import { showToast } from "@/components/ui/toast";
import {
  deleteTestimonial,
  isAdminApiError,
  listTestimonials,
  patchPublished,
  reorderTestimonials,
} from "@/lib/admin/api";
import { type AdminTestimonial, SessionEndedError } from "@/lib/admin/types";

type FormState = { mode: "create" } | { mode: "edit"; item: AdminTestimonial };

export function TestimonialsManager() {
  const deleteDialogId = useId();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminTestimonial | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await listTestimonials();
        if (!cancelled) {
          setItems(list);
        }
      } catch (error) {
        if (error instanceof SessionEndedError) {
          return;
        }
        if (!cancelled) {
          setStatus("Não foi possível carregar os depoimentos.");
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

  async function afterChange(next: AdminTestimonial[], message: string) {
    setItems(next);
    setStatus(message);
    showToast(message, "success");
    await revalidateTestimonials();
  }

  function fail(error: unknown, fallback: string) {
    if (error instanceof SessionEndedError) {
      return;
    }
    const message = isAdminApiError(error) ? error.message : fallback;
    setStatus(message);
    showToast(message, "error");
  }

  async function handleReorder(from: number, to: number) {
    const previous = items;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    try {
      const saved = await reorderTestimonials(next.map((item) => item.id));
      await afterChange(saved, "Ordem atualizada.");
    } catch (error) {
      setItems(previous);
      fail(error, "Não foi possível reordenar os depoimentos.");
    }
  }

  async function handleTogglePublish(item: AdminTestimonial) {
    const previous = items;
    const nextPublished = !item.is_published;
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, is_published: nextPublished } : entry,
      ),
    );
    try {
      const saved = await patchPublished(item.id, nextPublished);
      const next = previous.map((entry) => (entry.id === saved.id ? saved : entry));
      await afterChange(next, nextPublished ? "Depoimento publicado." : "Depoimento ocultado.");
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
      await deleteTestimonial(pendingDelete.id);
      const next = items.filter((item) => item.id !== pendingDelete.id);
      deleteDialogRef.current?.close();
      setPendingDelete(null);
      await afterChange(next, "Depoimento apagado.");
    } catch (error) {
      fail(error, "Não foi possível apagar o depoimento.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-ink">Gerenciar depoimentos</h1>
          <p className="mt-1 text-body text-text">
            Adicione, edite e organize os depoimentos da página inicial
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ mode: "create" })}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
        >
          Novo depoimento
          <ArrowRightIcon className="size-6" />
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {form ? (
        <TestimonialForm
          key={form.mode === "edit" ? form.item.id : "create"}
          mode={form.mode}
          initial={form.mode === "edit" ? form.item : null}
          onCancel={() => setForm(null)}
          onSaved={(saved) => {
            const exists = items.some((item) => item.id === saved.id);
            const next = exists
              ? items.map((item) => (item.id === saved.id ? saved : item))
              : [...items, saved];
            setForm(null);
            void afterChange(next, exists ? "Depoimento atualizado." : "Depoimento criado.");
          }}
        />
      ) : null}

      {loading ? (
        <p className="text-body text-muted">Carregando depoimentos…</p>
      ) : items.length === 0 && !form ? (
        <p className="text-body text-text">
          Nenhum depoimento ainda. Clique em Novo depoimento para adicionar o primeiro.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={item.id}>
              <TestimonialListCard
                testimonial={item}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                deleteDialogId={deleteDialogId}
                onMoveUp={() => {
                  void handleReorder(index, index - 1);
                }}
                onMoveDown={() => {
                  void handleReorder(index, index + 1);
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
        name={pendingDelete?.name ?? ""}
        busy={deleting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
