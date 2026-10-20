import Image from "next/image";
import type { FoundersContent } from "@/lib/about/types";

type FoundersSectionProps = {
  founders: FoundersContent;
};

export function FoundersSection({ founders }: FoundersSectionProps) {
  return (
    <section aria-labelledby="founders-title" className="bg-sky">
      <div className="mx-auto flex max-w-360 flex-col gap-10 px-4 py-16 lg:gap-20 lg:px-20 lg:py-20">
        <h2
          id="founders-title"
          className="text-center text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
        >
          {founders.heading}
        </h2>
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-20 lg:px-12">
          <Image
            src={founders.portrait.src}
            alt={founders.portrait.alt}
            width={founders.portrait.width}
            height={founders.portrait.height}
            sizes="(min-width: 64rem) 22.5rem, 100vw"
            className="h-88 w-full max-w-90 shrink-0 rounded-[0.625rem] object-cover object-[center_40%]"
          />
          <div className="flex w-full max-w-140.5 flex-col gap-6 lg:gap-8.75">
            <h3 className="text-title font-bold text-ink">{founders.names}</h3>
            <p className="text-body text-text">{founders.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
