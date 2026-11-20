export type EditorRole = "editor" | "moderator";

export type MeUser = {
  id: string;
  username: string;
  email: string;
  roles: readonly EditorRole[];
  is_superuser: boolean;
};

export type AdminTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  portrait: string | null;
  is_published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type AdminActivity = {
  id: string;
  title: string;
  description: string;
  image: string;
  image_alt: string;
  is_published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type AdminApiError = {
  message: string;
  fields: Record<string, string[]>;
  status: number;
  code: string | null;
};

export class SessionEndedError extends Error {
  readonly name = "SessionEndedError";

  constructor() {
    super("A sessão encerrou.");
  }
}

export class AdminRequestError extends Error implements AdminApiError {
  readonly name = "AdminRequestError";
  readonly fields: Record<string, string[]>;
  readonly status: number;
  readonly code: string | null;

  constructor(error: AdminApiError) {
    super(error.message);
    this.fields = error.fields;
    this.status = error.status;
    this.code = error.code;
  }
}

export type LoginResult = { ok: true } | { ok: false; error: AdminApiError };

export function canAccessAdmin(user: MeUser): boolean {
  return user.is_superuser || user.roles.includes("editor");
}

export const adminLoginPath = "/admin/entrar";
export const adminHomePath = "/admin/depoimentos";

export function isSafeAdminPath(value: string): boolean {
  if (value.includes("://") || value.includes("\\") || value.startsWith("//")) {
    return false;
  }
  return value === "/admin" || value.startsWith("/admin/");
}

// Where to go after signing in. The login page itself is never a destination,
// or a signed-in editor would bounce between it and the redirect forever.
export function adminDestination(next: string | null): string {
  if (!next || !isSafeAdminPath(next)) {
    return adminHomePath;
  }
  const path = next.split(/[?#]/, 1)[0];
  if (path === adminLoginPath || path.startsWith(`${adminLoginPath}/`)) {
    return adminHomePath;
  }
  return next;
}
