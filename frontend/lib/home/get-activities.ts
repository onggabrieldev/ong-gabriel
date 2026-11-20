import { cacheLife, cacheTag } from "next/cache";
import { fetchPublicList, isRecord } from "@/lib/api/public-list";
import type { Activity } from "@/lib/home/types";

// The API stores every activity image as a square WebP of this size.
const imageSize = 1080;

function parseActivity(value: unknown): Activity | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, title, description, image, image_alt } = value;
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof image !== "string" ||
    typeof image_alt !== "string"
  ) {
    return null;
  }

  return {
    id,
    title,
    description,
    image: {
      src: image,
      alt: image_alt,
      width: imageSize,
      height: imageSize,
    },
  };
}

export async function getActivities(): Promise<readonly Activity[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("activities");

  return fetchPublicList("/api/v1/activities/", "home activities", parseActivity);
}
