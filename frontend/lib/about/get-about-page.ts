import { aboutPageContent } from "@/lib/about/content";
import type { AboutPageContent } from "@/lib/about/types";

export async function getAboutPage(): Promise<AboutPageContent> {
  return aboutPageContent;
}
