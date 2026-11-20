import { adminFetch, parseApiError } from "@/lib/admin/api";
import { type AdminActivity, AdminRequestError } from "@/lib/admin/types";

const activitiesPath = "/api/v1/admin/activities/";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function invalidResponse(): AdminRequestError {
  return new AdminRequestError({
    message: "Resposta inválida do servidor.",
    fields: {},
    status: 500,
    code: null,
  });
}

function parseAdminActivity(value: unknown): AdminActivity | null {
  if (!isRecord(value)) {
    return null;
  }
  const {
    id,
    title,
    description,
    image,
    image_alt,
    is_published,
    position,
    created_at,
    updated_at,
  } = value;
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string" ||
    typeof image_alt !== "string" ||
    typeof is_published !== "boolean" ||
    typeof position !== "number" ||
    typeof created_at !== "string" ||
    typeof updated_at !== "string"
  ) {
    return null;
  }

  return {
    id,
    title,
    description,
    image,
    image_alt,
    is_published,
    position,
    created_at,
    updated_at,
  };
}

function parseAdminActivityList(value: unknown): AdminActivity[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items: AdminActivity[] = [];
  for (const entry of value) {
    const item = parseAdminActivity(entry);
    if (item === null) {
      return null;
    }
    items.push(item);
  }
  return items;
}

async function readActivity(response: Response, fallback: string): Promise<AdminActivity> {
  if (!response.ok) {
    throw new AdminRequestError(await parseApiError(response, fallback));
  }
  const item = parseAdminActivity(await response.json());
  if (item === null) {
    throw invalidResponse();
  }
  return item;
}

async function readActivityList(response: Response, fallback: string): Promise<AdminActivity[]> {
  if (!response.ok) {
    throw new AdminRequestError(await parseApiError(response, fallback));
  }
  const items = parseAdminActivityList(await response.json());
  if (items === null) {
    throw invalidResponse();
  }
  return items;
}

export async function listActivities(): Promise<AdminActivity[]> {
  const response = await adminFetch(activitiesPath);
  return readActivityList(response, "Não foi possível carregar as atividades.");
}

export type ActivityWriteInput = {
  title: string;
  description: string;
  imageAlt: string;
  isPublished: boolean;
  imageFile: File | null;
};

function toFormData(input: ActivityWriteInput): FormData {
  const data = new FormData();
  data.set("title", input.title);
  data.set("description", input.description);
  data.set("image_alt", input.imageAlt);
  data.set("is_published", input.isPublished ? "true" : "false");
  if (input.imageFile) {
    data.set("image", input.imageFile);
  }
  return data;
}

export async function createActivity(input: ActivityWriteInput): Promise<AdminActivity> {
  const response = await adminFetch(activitiesPath, {
    method: "POST",
    body: toFormData(input),
  });
  return readActivity(response, "Não foi possível criar a atividade.");
}

export async function updateActivity(
  id: string,
  input: ActivityWriteInput,
): Promise<AdminActivity> {
  const response = await adminFetch(`${activitiesPath}${id}/`, {
    method: "PATCH",
    body: toFormData(input),
  });
  return readActivity(response, "Não foi possível salvar a atividade.");
}

export async function patchActivityPublished(
  id: string,
  isPublished: boolean,
): Promise<AdminActivity> {
  const response = await adminFetch(`${activitiesPath}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_published: isPublished }),
  });
  return readActivity(response, "Não foi possível atualizar a publicação.");
}

export async function deleteActivity(id: string): Promise<void> {
  const response = await adminFetch(`${activitiesPath}${id}/`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível apagar a atividade."),
    );
  }
}

export async function reorderActivities(ids: readonly string[]): Promise<AdminActivity[]> {
  const response = await adminFetch(`${activitiesPath}reorder/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return readActivityList(response, "Não foi possível reordenar as atividades.");
}
