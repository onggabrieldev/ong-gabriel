"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";

const defaultApiOrigin = "http://127.0.0.1:8000";

function apiOrigin(): string {
  const raw = process.env.API_INTERNAL_URL ?? defaultApiOrigin;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function canRevalidate(payload: unknown): boolean {
  if (
    !isRecord(payload) ||
    typeof payload.is_superuser !== "boolean" ||
    !Array.isArray(payload.roles)
  ) {
    return false;
  }
  if (payload.is_superuser) {
    return true;
  }
  return payload.roles.some((role) => role === "editor");
}

export async function revalidateTestimonials(): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader.length === 0) {
    return;
  }

  try {
    const response = await fetch(`${apiOrigin()}/api/v1/me/`, {
      headers: {
        Cookie: cookieHeader,
        "X-Forwarded-Proto": "https",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return;
    }
    const payload: unknown = await response.json();
    if (!canRevalidate(payload)) {
      return;
    }
    updateTag("testimonials");
  } catch {
    return;
  }
}
