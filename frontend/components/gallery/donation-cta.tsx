import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { HoverHeart } from "@/components/ui/hover-heart";
import type { GalleryDonationContent } from "@/lib/gallery/types";

type DonationCtaProps = {
  donation: GalleryDonationContent;
};

export function DonationCta({ donation }: DonationCtaProps) {
  return (
    <section
      aria-labelledby="gallery-donation-title"
      className="bg-linear-to-r from-sky-deep via-cream to-butter"
    >
      <div className="mx-auto flex max-w-360 flex-col items-center gap-10 px-4 py-16 lg:flex-row lg:items-center lg:gap-10 lg:px-20 lg:py-20">
        <div className="flex size-64 shrink-0 items-center justify-center overflow-hidden rounded-tl-[40%] rounded-tr-[40%] rounded-bl-[40%] lg:size-96">
          <Image
            src={donation.image.src}
            alt={donation.image.alt}
            width={donation.image.width}
            height={donation.image.height}
            sizes="(min-width: 64rem) 24rem, 16rem"
            className="h-auto w-full"
          />
        </div>
        <div className="flex flex-1 flex-col gap-10">
          <h2
            id="gallery-donation-title"
            className="font-display text-[2.5rem] leading-[1.05] tracking-[0.02em] text-soil lg:text-display"
          >
            {donation.title}
          </h2>
          <div className="flex flex-col gap-1 text-label text-text">
            {donation.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex justify-end">
            <ButtonLink href={donation.action.href} className="group">
              {donation.action.label}
              <HoverHeart />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
