import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/gallery/breadcrumb";
import { DonationCta } from "@/components/gallery/donation-cta";
import { GalleryEvents, GalleryEventsFallback } from "@/components/gallery/gallery-events";
import { HeroSection } from "@/components/gallery/hero-section";
import { getEventFilterOptions, getPastEvents } from "@/lib/events/get-events";
import { getGalleryPage } from "@/lib/gallery/get-gallery-page";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Explore nossos momentos de acolhimento e ações na nossa comunidade.",
};

export default async function GalleryPage() {
  const [page, events, options] = await Promise.all([
    getGalleryPage(),
    getPastEvents(),
    getEventFilterOptions(),
  ]);

  return (
    <>
      <HeroSection hero={page.hero} />
      <section aria-labelledby="gallery-list-title" className="bg-canvas">
        <div className="mx-auto max-w-360 px-4 py-10 lg:px-20">
          <Breadcrumb copy={page.breadcrumb} />
          <h2 id="gallery-list-title" className="sr-only">
            {page.list.heading}
          </h2>
          <Suspense
            fallback={
              <GalleryEventsFallback
                events={events}
                types={options.types}
                locations={options.locations}
                filtersCopy={page.filters}
                listCopy={page.list}
              />
            }
          >
            <GalleryEvents
              events={events}
              types={options.types}
              locations={options.locations}
              filtersCopy={page.filters}
              listCopy={page.list}
            />
          </Suspense>
        </div>
      </section>
      <DonationCta donation={page.donation} />
    </>
  );
}
