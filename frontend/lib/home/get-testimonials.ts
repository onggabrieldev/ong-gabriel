import { cacheLife, cacheTag } from "next/cache";
import type { Testimonial } from "@/lib/home/types";

const defaultApiOrigin = "http://127.0.0.1:8000";
const fetchTimeoutMs = 5000;
const portraitSize = 256;

let loggedFailure = false;

function apiOrigin(): string {
  const raw = process.env.API_INTERNAL_URL ?? defaultApiOrigin;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function logFailure(reason: unknown): void {
  if (loggedFailure) {
    return;
  }
  loggedFailure = true;
  console.error("Failed to load home testimonials from the API.", reason);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTestimonial(value: unknown): Testimonial | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, quote, name, role, portrait } = value;
  if (
    typeof id !== "string" ||
    typeof quote !== "string" ||
    typeof name !== "string" ||
    typeof role !== "string" ||
    !(portrait === null || typeof portrait === "string")
  ) {
    return null;
  }

  return {
    id,
    quote,
    name,
    role,
    portrait:
      portrait === null
        ? null
        : {
            src: portrait,
            alt: "",
            width: portraitSize,
            height: portraitSize,
          },
  };
}

function parseTestimonials(value: unknown): readonly Testimonial[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items: Testimonial[] = [];
  for (const entry of value) {
    const item = parseTestimonial(entry);
    if (item === null) {
      return null;
    }
    items.push(item);
  }
  return items;
}

export async function getTestimonials(): Promise<readonly Testimonial[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("testimonials");

  try {
    const response = await fetch(`${apiOrigin()}/api/v1/testimonials/`, {
      headers: { "X-Forwarded-Proto": "https" },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });

    if (!response.ok) {
      logFailure(`HTTP ${response.status}`);
      return [];
    }

    const payload: unknown = await response.json();
    const items = parseTestimonials(payload);
    if (items === null) {
      logFailure("Unexpected response shape");
      return [];
    }

    return items;
  } catch (error) {
    logFailure(error);
    return [];
  }
}
