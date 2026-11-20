import { adminFetch, parseApiError } from "@/lib/admin/api";
import { type AdminEvent, type AdminEventAccent, AdminRequestError } from "@/lib/admin/types";

const eventsPath = "/api/v1/admin/events/";

const accents = new Set<AdminEventAccent>(["sky", "butter", "teal"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAccent(value: unknown): value is AdminEventAccent {
  return typeof value === "string" && accents.has(value as AdminEventAccent);
}

function invalidResponse(): AdminRequestError {
  return new AdminRequestError({
    message: "Resposta inválida do servidor.",
    fields: {},
    status: 500,
    code: null,
  });
}

function parseAdminEvent(value: unknown): AdminEvent | null {
  if (!isRecord(value)) {
    return null;
  }
  const {
    id,
    title,
    summary,
    description,
    event_type,
    location,
    starts_at,
    ends_at,
    accent,
    image,
    image_alt,
    is_published,
    created_at,
    updated_at,
  } = value;
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof summary !== "string" ||
    typeof description !== "string" ||
    typeof event_type !== "string" ||
    typeof location !== "string" ||
    typeof starts_at !== "string" ||
    typeof ends_at !== "string" ||
    !isAccent(accent) ||
    !(image === null || typeof image === "string") ||
    typeof image_alt !== "string" ||
    typeof is_published !== "boolean" ||
    typeof created_at !== "string" ||
    typeof updated_at !== "string"
  ) {
    return null;
  }

  return {
    id,
    title,
    summary,
    description,
    event_type,
    location,
    starts_at,
    ends_at,
    accent,
    image,
    image_alt,
    is_published,
    created_at,
    updated_at,
  };
}

function parseAdminEventList(value: unknown): AdminEvent[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items: AdminEvent[] = [];
  for (const entry of value) {
    const item = parseAdminEvent(entry);
    if (item === null) {
      return null;
    }
    items.push(item);
  }
  return items;
}

async function readEvent(response: Response, fallback: string): Promise<AdminEvent> {
  if (!response.ok) {
    throw new AdminRequestError(await parseApiError(response, fallback));
  }
  const item = parseAdminEvent(await response.json());
  if (item === null) {
    throw invalidResponse();
  }
  return item;
}

export async function listEvents(): Promise<AdminEvent[]> {
  const response = await adminFetch(eventsPath);
  if (!response.ok) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível carregar a agenda."),
    );
  }
  const items = parseAdminEventList(await response.json());
  if (items === null) {
    throw invalidResponse();
  }
  return items;
}

export type EventWriteInput = {
  title: string;
  summary: string;
  description: string;
  eventType: string;
  location: string;
  // Wall-clock "YYYY-MM-DDTHH:mm". Django reads it as America/Sao_Paulo.
  startsAt: string;
  endsAt: string;
  accent: AdminEventAccent;
  imageAlt: string;
  isPublished: boolean;
  imageFile: File | null;
  removeImage: boolean;
};

function toFormData(input: EventWriteInput): FormData {
  const data = new FormData();
  data.set("title", input.title);
  data.set("summary", input.summary);
  data.set("description", input.description);
  data.set("event_type", input.eventType);
  data.set("location", input.location);
  data.set("starts_at", input.startsAt);
  data.set("ends_at", input.endsAt);
  data.set("accent", input.accent);
  data.set("image_alt", input.imageAlt);
  data.set("is_published", input.isPublished ? "true" : "false");
  if (input.imageFile) {
    data.set("image", input.imageFile);
  } else if (input.removeImage) {
    data.set("image", "");
  }
  return data;
}

export async function createEvent(input: EventWriteInput): Promise<AdminEvent> {
  const response = await adminFetch(eventsPath, {
    method: "POST",
    body: toFormData(input),
  });
  return readEvent(response, "Não foi possível criar o evento.");
}

export async function updateEvent(id: string, input: EventWriteInput): Promise<AdminEvent> {
  const response = await adminFetch(`${eventsPath}${id}/`, {
    method: "PATCH",
    body: toFormData(input),
  });
  return readEvent(response, "Não foi possível salvar o evento.");
}

export async function patchEventPublished(id: string, isPublished: boolean): Promise<AdminEvent> {
  const response = await adminFetch(`${eventsPath}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_published: isPublished }),
  });
  return readEvent(response, "Não foi possível atualizar a publicação.");
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await adminFetch(`${eventsPath}${id}/`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new AdminRequestError(await parseApiError(response, "Não foi possível apagar o evento."));
  }
}
