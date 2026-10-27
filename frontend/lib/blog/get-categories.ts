import { categories } from "@/lib/blog/content";
import type { Category } from "@/lib/blog/types";

export async function getCategories(): Promise<readonly Category[]> {
  return categories;
}
