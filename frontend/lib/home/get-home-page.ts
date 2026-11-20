import { homePageContent } from "@/lib/home/content";
import { getActivities } from "@/lib/home/get-activities";
import { getTestimonials } from "@/lib/home/get-testimonials";
import type { HomePageContent } from "@/lib/home/types";

export async function getHomePage(): Promise<HomePageContent> {
  const [activities, testimonials] = await Promise.all([getActivities(), getTestimonials()]);

  return {
    ...homePageContent,
    activities: {
      ...homePageContent.activities,
      items: activities,
    },
    testimonials: {
      ...homePageContent.testimonials,
      items: testimonials,
    },
  };
}
