import type { GalleryHeroContent } from "@/lib/gallery/types";

type HeroSectionProps = {
  hero: GalleryHeroContent;
};

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section aria-labelledby="gallery-hero-title" className="bg-canvas">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-6 px-4 py-10 text-center lg:px-20">
        <h1
          id="gallery-hero-title"
          className="font-display text-[2.5rem] leading-[1.05] tracking-[0.02em] text-indigo lg:text-display"
        >
          {hero.title}
        </h1>
        <p className="max-w-3xl text-label font-semibold text-indigo">{hero.summary}</p>
      </div>
    </section>
  );
}
