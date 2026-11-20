"use client";

import { useEffect, useId, useRef, useState } from "react";
import { revalidateHomeSection } from "@/app/admin/actions";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import { EventForm } from "@/components/admin/event-form";
import { EventListCard } from "@/components/admin/event-list-card";
import { ArrowRightIcon } from "@/components/icons/icon";
import { showToast } from "@/components/ui/toast";
import { isAdminApiError } from "@/lib/admin/api";
import { deleteEvent, listEvents, patchEventPublished } from "@/lib/admin/events-api";
import { type AdminEvent, SessionEndedError } from "@/lib/admin/types";

type FormState = { mode: "create" } | { mode: "edit"; item: AdminEvent };

const emptyAgendaMessage = "Nenhum evento na agenda.";

function byStart(a: AdminEvent, b: AdminEvent): number {
  return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
}

function distinctSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function EventsManager() {
  const deleteDialogId = useId();
  const upcomingHeadingId = useId();
  const endedHeadingId = useId();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("");
  // Set once the list loads: reading the clock while rendering would stop the
  // page from prerendering.
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await listEvents();
        if (!cancelled) {
          setItems(list);
          setNow(Date.now());
        }
      } catch (error) {
        if (error instanceof SessionEndedError) {
          return;
        }
        if (!cancelled) {
          setLoadFailed(true);
          setStatus("Não foi possível carregar a agenda.");
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

  async function afterChange(next: AdminEvent[], message: string) {
    setItems(next);
    setNow(Date.now());
    setStatus(message);
    showToast(message, "success");
    await revalidateHomeSection("events");
  }

  function fail(error: unknown, fallback: string) {
    if (error instanceof SessionEndedError) {
      return;
    }
    const message = isAdminApiError(error) ? error.message : fallback;
    setStatus(message);
    showToast(message, "error");
  }

  async function handleTogglePublish(item: AdminEvent) {
    const previous = items;
    const nextPublished = !item.is_published;
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, is_published: nextPublished } : entry,
      ),
    );
    try {
      const saved = await patchEventPublished(item.id, nextPublished);
      const next = previous.map((entry) => (entry.id === saved.id ? saved : entry));
      await afterChange(next, nextPublished ? "Evento publicado." : "Evento ocultado.");
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
      await deleteEvent(pendingDelete.id);
      const next = items.filter((item) => item.id !== pendingDelete.id);
      deleteDialogRef.current?.close();
      setPendingDelete(null);
      await afterChange(next, "Evento apagado.");
    } catch (error) {
      fail(error, "Não foi possível apagar o evento.");
    } finally {
      setDeleting(false);
    }
  }

  const editingId = form?.mode === "edit" ? form.item.id : null;
  const visibleItems = items.filter((item) => item.id !== editingId);
  // The public agenda keeps an event until it ends, so the admin splits there too.
  const upcoming = visibleItems.filter((item) => new Date(item.ends_at).getTime() >= now);
  const ended = visibleItems.filter((item) => new Date(item.ends_at).getTime() < now);
  upcoming.sort(byStart);
  ended.sort((a, b) => byStart(b, a));

  function renderList(list: readonly AdminEvent[], isEnded: boolean) {
    return (
      <ul className="flex flex-col gap-4">
        {list.map((item) => (
          <li key={item.id}>
            <EventListCard
              event={item}
              ended={isEnded}
              deleteDialogId={deleteDialogId}
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
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title font-bold text-ink">Gerenciar agenda</h1>
          <p className="mt-1 text-body text-text">Adicione e edite os eventos da página Agenda</p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ mode: "create" })}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
        >
          Novo evento
          <ArrowRightIcon className="size-6" />
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {form ? (
        <EventForm
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
            void afterChange(next, exists ? "Evento atualizado." : "Evento criado.");
          }}
        />
      ) : null}

      {loading ? (
        <p className="text-body text-muted">Carregando agenda…</p>
      ) : loadFailed ? (
        <p className="text-body text-danger">Não foi possível carregar a agenda.</p>
      ) : items.length === 0 && !form ? (
        <div className="rounded-xl border border-line bg-canvas px-4 py-10 text-center">
          <p className="text-title font-bold text-ink-soft">{emptyAgendaMessage}</p>
          <p className="mt-2 text-body text-text">
            Clique em Novo evento para adicionar o primeiro.
          </p>
        </div>
      ) : (
        <>
          <section aria-labelledby={upcomingHeadingId} className="flex flex-col gap-4">
            <h2 id={upcomingHeadingId} className="text-label font-semibold text-ink">
              Próximos eventos
            </h2>
            {upcoming.length > 0 ? (
              renderList(upcoming, false)
            ) : (
              <p className="text-body text-text">{emptyAgendaMessage}</p>
            )}
          </section>
          {ended.length > 0 ? (
            <section aria-labelledby={endedHeadingId} className="flex flex-col gap-4">
              <h2 id={endedHeadingId} className="text-label font-semibold text-ink">
                Encerrados
              </h2>
              <p className="-mt-2 text-body text-muted">
                Não aparecem mais no site. Apague os que não precisa guardar.
              </p>
              {renderList(ended, true)}
            </section>
          ) : null}
        </>
      )}

      <DeleteDialog
        dialogRef={deleteDialogRef}
        dialogId={deleteDialogId}
        title={`Apagar o evento “${pendingDelete?.title ?? ""}”?`}
        busy={deleting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
