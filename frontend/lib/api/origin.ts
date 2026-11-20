const defaultApiOrigin = "http://127.0.0.1:8000";

// The Django origin for server-side calls. In production it is the internal
// service URL, not the public domain.
export function apiOrigin(): string {
  const raw = process.env.API_INTERNAL_URL ?? defaultApiOrigin;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}
