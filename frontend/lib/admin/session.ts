import { apiOrigin } from "@/lib/api/origin";

export const sessionCookieName = "sessionid";

const meTimeoutMs = 5000;

// "editor" may use the panel. "denied" has no valid session, or a session
// without the editor role. "unavailable" means the API did not answer.
export type AdminAccess = "editor" | "denied" | "unavailable";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEditor(payload: unknown): boolean {
  if (
    !isRecord(payload) ||
    typeof payload.is_superuser !== "boolean" ||
    !Array.isArray(payload.roles)
  ) {
    return false;
  }
  return payload.is_superuser || payload.roles.some((role) => role === "editor");
}

// Asks Django whether this session cookie belongs to an editor. The cookie's
// presence alone proves nothing: it may be expired, revoked, or forged.
export async function getAdminAccess(sessionId: string | undefined): Promise<AdminAccess> {
  if (!sessionId) {
    return "denied";
  }

  try {
    const response = await fetch(`${apiOrigin()}/api/v1/me/`, {
      headers: {
        Cookie: `${sessionCookieName}=${sessionId}`,
        "X-Forwarded-Proto": "https",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(meTimeoutMs),
    });
    if (response.status === 401 || response.status === 403) {
      return "denied";
    }
    if (!response.ok) {
      return "unavailable";
    }
    return isEditor(await response.json()) ? "editor" : "denied";
  } catch {
    return "unavailable";
  }
}
