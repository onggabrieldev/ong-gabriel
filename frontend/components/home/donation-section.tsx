import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { HoverHeart } from "@/components/ui/hover-heart";
import type { DonationContent } from "@/lib/home/types";

type DonationSectionProps = {
  donation: DonationContent;
};

export function DonationSection({ donation }: DonationSectionProps) {
  return (
    <section aria-labelledby="donation-title" className="bg-canvas">
      <div className="mx-auto grid max-w-360 items-center gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_--spacing(96)] lg:px-20 lg:py-24">
        <div className="order-2 lg:order-1">
          <h2
            id="donation-title"
            className="text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink-soft lg:text-headline"
          >
            {donation.title}
          </h2>
          <div className="mt-6 flex max-w-3xl flex-col gap-4 text-body text-text">
            {donation.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ButtonLink href={donation.action.href} className="group mt-10">
            {donation.action.label}
            <HoverHeart />
          </ButtonLink>
        </div>
        <div className="order-1 flex justify-center lg:order-2">
          <div className="flex size-64 items-center justify-center rounded-tl-[40%] rounded-tr-[40%] rounded-bl-[40%] bg-sky-deep p-6 lg:size-96">
            <Image
              src={donation.image.src}
              alt={donation.image.alt}
              width={donation.image.width}
              height={donation.image.height}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
