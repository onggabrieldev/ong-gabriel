import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { HoverHeart } from "@/components/ui/hover-heart";
import type { DonationHeroContent } from "@/lib/donation/types";

type HeroSectionProps = {
  hero: DonationHeroContent;
};

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section aria-labelledby="donation-hero-title" className="relative isolate bg-canvas">
      <Image
        src={hero.background.src}
        alt={hero.background.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-center opacity-50"
      />
      <div className="mx-auto flex min-h-100 max-w-360 flex-col items-center justify-center gap-6 px-4 py-16 text-center lg:min-h-125 lg:px-20">
        <h1
          id="donation-hero-title"
          className="font-display text-[2.5rem] leading-[1.05] tracking-[0.02em] text-soil lg:text-display"
        >
          {hero.title}
        </h1>
        <p className="max-w-3xl text-label font-semibold text-text">{hero.summary}</p>
        <ButtonLink href={hero.action.href} className="group">
          {hero.action.label}
          <HoverHeart />
        </ButtonLink>
      </div>
    </section>
  );
}
