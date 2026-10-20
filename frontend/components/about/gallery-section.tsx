import { GalleryCarousel } from "@/components/about/gallery-carousel";
import type { GalleryContent } from "@/lib/about/types";

type GallerySectionProps = {
  gallery: GalleryContent;
};

export function GallerySection({ gallery }: GallerySectionProps) {
  return (
    <section aria-labelledby="gallery-title" className="bg-cream py-16 lg:py-30">
      <h2 id="gallery-title" className="sr-only">
        {gallery.heading}
      </h2>
      <GalleryCarousel label={gallery.heading} photos={gallery.photos} />
    </section>
  );
}
