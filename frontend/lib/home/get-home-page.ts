import { homePageContent } from "@/lib/home/content";
import { getTestimonials } from "@/lib/home/get-testimonials";
import type { HomePageContent } from "@/lib/home/types";

export async function getHomePage(): Promise<HomePageContent> {
  const items = await getTestimonials();

  return {
    ...homePageContent,
    testimonials: {
      ...homePageContent.testimonials,
      items,
    },
  };
}
