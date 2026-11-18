import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/gallery/breadcrumb";
import { HeroSection } from "@/components/gallery/hero-section";
import { PhotoGallery } from "@/components/gallery/photo-gallery";
import { getPastEvent, getPastEvents } from "@/lib/events/get-events";
import { getGalleryPage } from "@/lib/gallery/get-gallery-page";

type GalleryEventPageProps = PageProps<"/galeria/[slug]">;

// Blocking: notFound() must run before the PPR shell streams. HTTP status stays a soft 404.
export const instant = false;

export async function generateStaticParams() {
  const events = await getPastEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: GalleryEventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPastEvent(slug);
  if (!event) {
    notFound();
  }
  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function GalleryEventPage({ params }: GalleryEventPageProps) {
  const page = await getGalleryPage();
  const { slug } = await params;
  const event = await getPastEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <HeroSection hero={page.hero} />
      <section aria-labelledby="gallery-photos-title" className="bg-canvas">
        <div className="mx-auto max-w-360 px-4 py-10 lg:px-20">
          <Breadcrumb copy={page.breadcrumb} current={event.title} />
          <h2 id="gallery-photos-title" className="sr-only">
            {page.photos.heading}: {event.title}
          </h2>
          <PhotoGallery photos={event.photos} copy={page.photos} />
        </div>
      </section>
    </>
  );
}
