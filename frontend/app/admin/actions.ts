"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { getAdminAccess, sessionCookieName } from "@/lib/admin/session";

const homeSectionTags = ["testimonials", "activities", "events", "gallery"] as const;

export type HomeSectionTag = (typeof homeSectionTags)[number];

function isHomeSectionTag(value: unknown): value is HomeSectionTag {
  return homeSectionTags.some((tag) => tag === value);
}

export async function revalidateHomeSection(tag: HomeSectionTag): Promise<void> {
  // A server action receives whatever the client sends, so check the tag here.
  if (!isHomeSectionTag(tag)) {
    return;
  }

  const cookieStore = await cookies();
  if ((await getAdminAccess(cookieStore.get(sessionCookieName)?.value)) !== "editor") {
    return;
  }
  updateTag(tag);
}
