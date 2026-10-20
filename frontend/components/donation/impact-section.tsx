import Image from "next/image";
import type { DonationImpactContent } from "@/lib/donation/types";

type ImpactSectionProps = {
  impact: DonationImpactContent;
};

// Figma places the four photos as an overlapping collage on a 664 × 531 frame.
const photoSlots = [
  { className: "top-0 left-[7.2%] h-[48.8%] w-[39%]", sizes: "(min-width: 64rem) 16rem, 40vw" },
  {
    className: "top-[4.6%] right-0 h-[44.3%] w-[53.1%]",
    sizes: "(min-width: 64rem) 22rem, 54vw",
  },
  { className: "top-1/2 left-0 h-[37.9%] w-[44.9%]", sizes: "(min-width: 64rem) 19rem, 45vw" },
  {
    className: "bottom-0 left-[46.2%] h-[48.8%] w-[39%]",
    sizes: "(min-width: 64rem) 16rem, 40vw",
  },
] as const;

export function ImpactSection({ impact }: ImpactSectionProps) {
  return (
    <section aria-labelledby="donation-impact-title" className="relative isolate bg-canvas">
      <Image
        src={impact.background.src}
        alt={impact.background.alt}
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center opacity-50"
      />
      <div className="mx-auto grid max-w-360 items-center gap-12 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,--spacing(166))] lg:gap-16 lg:px-20 lg:py-10">
        <div className="flex flex-col gap-10 lg:gap-16 lg:py-10">
          <h2
            id="donation-impact-title"
            className="font-display text-[2.5rem] leading-[1.05] tracking-[0.02em] text-indigo lg:text-display"
          >
            {impact.heading}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            {impact.stats.map((stat) => (
              <li
                key={stat.id}
                className="flex flex-col items-center justify-center rounded-md bg-sky-deep px-4 py-3 text-center shadow-card"
              >
                <p className="text-[2.25rem] leading-none font-bold text-indigo">{stat.value}</p>
                <p className="mt-1 max-w-52 text-body text-text">{stat.label}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-5/4 w-full max-w-166">
          {impact.photos.map((photo, index) => (
            <div
              key={photo.src}
              className={`absolute overflow-hidden rounded-3xl lg:rounded-[3rem] ${photoSlots[index].className}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={photoSlots[index].sizes}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
