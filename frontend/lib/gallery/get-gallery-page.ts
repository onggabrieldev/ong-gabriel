import { galleryPageContent } from "@/lib/gallery/content";
import type { GalleryPageContent } from "@/lib/gallery/types";

export async function getGalleryPage(): Promise<GalleryPageContent> {
  return galleryPageContent;
}
