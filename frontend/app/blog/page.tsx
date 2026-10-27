import type { Metadata } from "next";
import { Suspense } from "react";
import { FeaturedCarousel } from "@/components/blog/featured-carousel";
import { LatestPosts, LatestPostsFallback } from "@/components/blog/latest-posts";
import { SuggestCta } from "@/components/blog/suggest-cta";
import { UpcomingEvents } from "@/components/blog/upcoming-events";
import { getCategories } from "@/lib/blog/get-categories";
import { getBlogCopy, getFeaturedPosts } from "@/lib/blog/get-posts";
import { getUpcomingEvents } from "@/lib/events/get-events";

export const metadata: Metadata = {
  title: "Blog",
  description: "Publicações da ONG Gabriel sobre acolhimento, prevenção e cuidado em saúde mental.",
};

type BlogPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    categoria?: string | string[];
  }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const [copy, featured, categories, upcoming] = await Promise.all([
    getBlogCopy(),
    getFeaturedPosts(),
    getCategories(),
    getUpcomingEvents(),
  ]);

  return (
    <>
      <FeaturedCarousel posts={featured} copy={copy} />
      <Suspense fallback={<LatestPostsFallback copy={copy} categories={categories} />}>
        <LatestPosts searchParams={searchParams} copy={copy} categories={categories} />
      </Suspense>
      <UpcomingEvents events={upcoming.slice(0, 2)} copy={copy} />
      <SuggestCta copy={copy} />
    </>
  );
}
