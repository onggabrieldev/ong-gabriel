import { homePageContent } from "@/lib/home/content";
import type { HomePageContent } from "@/lib/home/types";

export async function getHomePage(): Promise<HomePageContent> {
  return homePageContent;
}
