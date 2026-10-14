import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import type { SupportContent } from "@/lib/home/types";

type SupportSectionProps = {
  support: SupportContent;
};

export function SupportSection({ support }: SupportSectionProps) {
  return (
    <section aria-labelledby="support-title" className="bg-mint">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-10 px-4 py-12 lg:flex-row lg:gap-20 lg:px-20 lg:py-20">
        <Image
          src={support.image.src}
          alt={support.image.alt}
          width={support.image.width}
          height={support.image.height}
          sizes="(min-width: 64rem) 24rem, 16rem"
          className="h-auto w-56 lg:w-80"
        />
        <div className="flex flex-1 flex-col gap-6">
          <h2
            id="support-title"
            className="font-display text-[2.5rem] leading-[1.05] tracking-[0.02em] text-indigo lg:text-display"
          >
            {support.title}
          </h2>
          <p className="text-title font-bold text-soil">{support.subtitle}</p>
          <div className="flex flex-col gap-4 text-label font-semibold text-text">
            {support.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex justify-end">
            <ButtonLink href={support.action.href} variant="saffronSoft">
              {support.action.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
