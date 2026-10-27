import type { AgendaHeroContent } from "@/lib/agenda/types";

type HeroSectionProps = {
  hero: AgendaHeroContent;
};

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="agenda-hero-title"
      className="relative isolate overflow-hidden bg-cream"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[12%] size-96 rounded-full bg-saffron-soft/45 blur-3xl" />
        <div className="absolute right-[8%] -bottom-20 size-80 rounded-full bg-mint/55 blur-3xl" />
        <div className="absolute top-8 right-[28%] size-72 rounded-full bg-sky-mid/35 blur-3xl" />
        <div className="absolute inset-0 bg-cream/55" />
      </div>
      <div className="mx-auto flex min-h-80 max-w-360 flex-col items-center justify-center gap-6 px-4 py-16 text-center lg:min-h-100 lg:px-20">
        <h1
          id="agenda-hero-title"
          className="font-display text-[2.5rem] leading-[1.05] tracking-[0.02em] text-soil lg:text-display"
        >
          {hero.title}
        </h1>
        <p className="max-w-3xl text-label font-semibold text-ink-soft">{hero.summary}</p>
      </div>
    </section>
  );
}
