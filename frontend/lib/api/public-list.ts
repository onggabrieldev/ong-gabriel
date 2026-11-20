import { apiOrigin } from "@/lib/api/origin";

const fetchTimeoutMs = 5000;

const loggedFailures = new Set<string>();

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

// Reads one public record. A 404 yields null quietly; any other failure is
// logged once and also yields null, so the page shows its not-found screen.
export async function fetchPublicItem<T>(
  path: string,
  label: string,
  parse: (value: unknown) => T | null,
): Promise<T | null> {
  try {
    const response = await fetch(`${apiOrigin()}${path}`, {
      headers: { "X-Forwarded-Proto": "https" },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      logFailure(label, `HTTP ${response.status}`);
      return null;
    }

    const item = parse(await response.json());
    if (item === null) {
      logFailure(label, "Unexpected response shape");
    }
    return item;
  } catch (error) {
    logFailure(label, error);
    return null;
  }
}
