import {
  type AdminApiError,
  AdminRequestError,
  type AdminTestimonial,
  type EditorRole,
  type LoginResult,
  type MeUser,
  SessionEndedError,
} from "@/lib/admin/types";

const sessionPath = "/api/v1/_allauth/browser/v1/auth/session";
const loginPath = "/api/v1/_allauth/browser/v1/auth/login";
const mePath = "/api/v1/me/";
const testimonialsPath = "/api/v1/admin/testimonials/";

const knownRoles = new Set<EditorRole>(["editor", "moderator"]);

let csrfEnsured = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

export function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function ensureCsrf(): Promise<void> {
  if (csrfEnsured) {
    return;
  }
  await fetch(sessionPath, { credentials: "same-origin" });
  csrfEnsured = true;
}

function parseAllauthCode(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.errors)) {
    return null;
  }
  for (const entry of payload.errors) {
    if (isRecord(entry) && typeof entry.code === "string") {
      return entry.code;
    }
  }
  return null;
}

function parseFields(payload: unknown): Record<string, string[]> {
  if (!isRecord(payload)) {
    return {};
  }

  const fields: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (
      key === "detail" ||
      key === "status" ||
      key === "errors" ||
      key === "meta" ||
      key === "data"
    ) {
      continue;
    }
    const messages = stringArray(value);
    if (messages.length > 0) {
      fields[key] = messages;
    }
  }
  return fields;
}

function generalMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) {
    return fallback;
  }
  if (typeof payload.detail === "string" && payload.detail.length > 0) {
    return payload.detail;
  }
  if (Array.isArray(payload.errors)) {
    for (const entry of payload.errors) {
      if (isRecord(entry) && typeof entry.message === "string" && entry.message.length > 0) {
        return entry.message;
      }
    }
  }
  const fields = parseFields(payload);
  const first = Object.values(fields)[0]?.[0];
  return first ?? fallback;
}

export async function parseApiError(response: Response, fallback: string): Promise<AdminApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    message: generalMessage(payload, fallback),
    fields: parseFields(payload),
    status: response.status,
    code: parseAllauthCode(payload),
  };
}

function redirectToLogin(): void {
  const next = `${window.location.pathname}${window.location.search}`;
  const safeNext = next.startsWith("/admin") ? next : "/admin/depoimentos";
  window.location.assign(`/admin/entrar?next=${encodeURIComponent(safeNext)}`);
}

async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  await ensureCsrf();
  const headers = new Headers(init.headers);
  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    headers.set("X-CSRFToken", getCsrfToken());
  }

  const response = await fetch(path, {
    ...init,
    method,
    headers,
    credentials: "same-origin",
  });

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    throw new SessionEndedError();
  }

  return response;
}

function parseMe(value: unknown): MeUser | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, username, email, roles, is_superuser } = value;
  if (
    typeof id !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof is_superuser !== "boolean" ||
    !Array.isArray(roles)
  ) {
    return null;
  }

  const parsedRoles: EditorRole[] = [];
  for (const role of roles) {
    if (typeof role === "string" && knownRoles.has(role as EditorRole)) {
      parsedRoles.push(role as EditorRole);
    }
  }

  return { id, username, email, roles: parsedRoles, is_superuser };
}

function parseAdminTestimonial(value: unknown): AdminTestimonial | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, quote, name, role, portrait, is_published, position, created_at, updated_at } = value;
  if (
    typeof id !== "string" ||
    typeof quote !== "string" ||
    typeof name !== "string" ||
    typeof role !== "string" ||
    !(portrait === null || typeof portrait === "string") ||
    typeof is_published !== "boolean" ||
    typeof position !== "number" ||
    typeof created_at !== "string" ||
    typeof updated_at !== "string"
  ) {
    return null;
  }

  return { id, quote, name, role, portrait, is_published, position, created_at, updated_at };
}

function parseAdminList(value: unknown): AdminTestimonial[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items: AdminTestimonial[] = [];
  for (const entry of value) {
    const item = parseAdminTestimonial(entry);
    if (item === null) {
      return null;
    }
    items.push(item);
  }
  return items;
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  await ensureCsrf();
  const body = identifier.includes("@")
    ? { email: identifier, password }
    : { username: identifier, password };

  const response = await fetch(loginPath, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    error: await parseApiError(response, "Não foi possível entrar."),
  };
}

export async function logout(): Promise<void> {
  await ensureCsrf();
  await fetch(sessionPath, {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "X-CSRFToken": getCsrfToken() },
  });
  csrfEnsured = false;
}

export async function getMe(): Promise<MeUser> {
  const response = await adminFetch(mePath);
  if (!response.ok) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível carregar a sessão."),
    );
  }
  const me = parseMe(await response.json());
  if (me === null) {
    throw new AdminRequestError({
      message: "Resposta inválida do servidor.",
      fields: {},
      status: 500,
      code: null,
    });
  }
  return me;
}

export async function listTestimonials(): Promise<AdminTestimonial[]> {
  const response = await adminFetch(testimonialsPath);
  if (!response.ok) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível carregar os depoimentos."),
    );
  }
  const items = parseAdminList(await response.json());
  if (items === null) {
    throw new AdminRequestError({
      message: "Resposta inválida do servidor.",
      fields: {},
      status: 500,
      code: null,
    });
  }
  return items;
}

export type TestimonialWriteInput = {
  name: string;
  role: string;
  quote: string;
  isPublished: boolean;
  portraitFile: File | null;
  removePortrait: boolean;
};

function toFormData(input: TestimonialWriteInput): FormData {
  const data = new FormData();
  data.set("name", input.name);
  data.set("role", input.role);
  data.set("quote", input.quote);
  data.set("is_published", input.isPublished ? "true" : "false");
  if (input.portraitFile) {
    data.set("portrait", input.portraitFile);
  } else if (input.removePortrait) {
    data.set("portrait", "");
  }
  return data;
}

export async function createTestimonial(input: TestimonialWriteInput): Promise<AdminTestimonial> {
  const response = await adminFetch(testimonialsPath, {
    method: "POST",
    body: toFormData(input),
  });
  if (!response.ok) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível criar o depoimento."),
    );
  }
  const item = parseAdminTestimonial(await response.json());
  if (item === null) {
    throw new AdminRequestError({
      message: "Resposta inválida do servidor.",
      fields: {},
      status: 500,
      code: null,
    });
  }
  return item;
}

export async function updateTestimonial(
  id: string,
  input: TestimonialWriteInput,
): Promise<AdminTestimonial> {
  const response = await adminFetch(`${testimonialsPath}${id}/`, {
    method: "PATCH",
    body: toFormData(input),
  });
  if (!response.ok) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível salvar o depoimento."),
    );
  }
  const item = parseAdminTestimonial(await response.json());
  if (item === null) {
    throw new AdminRequestError({
      message: "Resposta inválida do servidor.",
      fields: {},
      status: 500,
      code: null,
    });
  }
  return item;
}

export async function patchPublished(id: string, isPublished: boolean): Promise<AdminTestimonial> {
  const response = await adminFetch(`${testimonialsPath}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_published: isPublished }),
  });
  if (!response.ok) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível atualizar a publicação."),
    );
  }
  const item = parseAdminTestimonial(await response.json());
  if (item === null) {
    throw new AdminRequestError({
      message: "Resposta inválida do servidor.",
      fields: {},
      status: 500,
      code: null,
    });
  }
  return item;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const response = await adminFetch(`${testimonialsPath}${id}/`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível apagar o depoimento."),
    );
  }
}

export async function reorderTestimonials(ids: readonly string[]): Promise<AdminTestimonial[]> {
  const response = await adminFetch(`${testimonialsPath}reorder/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new AdminRequestError(
      await parseApiError(response, "Não foi possível reordenar os depoimentos."),
    );
  }
  const items = parseAdminList(await response.json());
  if (items === null) {
    throw new AdminRequestError({
      message: "Resposta inválida do servidor.",
      fields: {},
      status: 500,
      code: null,
    });
  }
  return items;
}

export function isAdminApiError(value: unknown): value is AdminRequestError {
  return value instanceof AdminRequestError;
}
