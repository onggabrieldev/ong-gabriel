import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicList, isRecord } from "@/lib/api/public-list";
import type { Testimonial } from "@/lib/home/types";

const portraitSize = 256;

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

export async function getTestimonials(): Promise<readonly Testimonial[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("testimonials");

  return fetchPublicList("/api/v1/testimonials/", "home testimonials", parseTestimonial);
}
