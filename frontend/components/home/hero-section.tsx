import Image from "next/image";
import type { HeroContent } from "@/lib/home/types";

type HeroSectionProps = {
  hero: HeroContent;
};

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-title" className="bg-cream">
      <div className="mx-auto grid max-w-360 items-center gap-8 px-4 pt-8 pb-12 lg:grid-cols-2 lg:gap-10 lg:px-20 lg:pt-16 lg:pb-24">
        <div className="max-w-xl">
          <p className="text-title font-bold text-indigo">{hero.kicker}</p>
          <h1
            id="hero-title"
            className="mt-4 font-display text-[2.3rem] leading-[1.1] tracking-[0.02em] text-indigo lg:text-display lg:leading-none"
          >
            <span className="block lg:inline">{hero.titleLines[0]}</span>{" "}
            <span className="block lg:inline">{hero.titleLines[1]}</span>
          </h1>
          <p className="mt-8 max-w-lg text-label font-semibold text-ink-soft">{hero.summary}</p>
        </div>
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          width={hero.image.width}
          height={hero.image.height}
          priority
          sizes="(min-width: 64rem) 36rem, 100vw"
          className="h-auto w-full rounded-md object-cover shadow-photo"
        />
      </div>
    </section>
  );
}
