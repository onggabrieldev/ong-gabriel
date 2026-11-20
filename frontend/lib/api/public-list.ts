const defaultApiOrigin = "http://127.0.0.1:8000";
const fetchTimeoutMs = 5000;

const loggedFailures = new Set<string>();

function apiOrigin(): string {
  const raw = process.env.API_INTERNAL_URL ?? defaultApiOrigin;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function logFailure(label: string, reason: unknown): void {
  if (loggedFailures.has(label)) {
    return;
  }
  loggedFailures.add(label);
  console.error(`Failed to load ${label} from the API.`, reason);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Reads a public list route. Any failure or unexpected shape yields an empty
// list, so the page renders without that section instead of erroring.
export async function fetchPublicList<T>(
  path: string,
  label: string,
  parseItem: (value: unknown) => T | null,
): Promise<readonly T[]> {
  try {
    const response = await fetch(`${apiOrigin()}${path}`, {
      headers: { "X-Forwarded-Proto": "https" },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });

    if (!response.ok) {
      logFailure(label, `HTTP ${response.status}`);
      return [];
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      logFailure(label, "Unexpected response shape");
      return [];
    }

    const items: T[] = [];
    for (const entry of payload) {
      const item = parseItem(entry);
      if (item === null) {
        logFailure(label, "Unexpected response shape");
        return [];
      }
      items.push(item);
    }
    return items;
  } catch (error) {
    logFailure(label, error);
    return [];
  }
}
