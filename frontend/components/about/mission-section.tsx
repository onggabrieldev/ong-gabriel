import Image from "next/image";
import type { AboutMissionContent } from "@/lib/about/types";

type MissionSectionProps = {
  mission: AboutMissionContent;
};

export function MissionSection({ mission }: MissionSectionProps) {
  return (
    <section aria-labelledby="mission-title" className="bg-cream">
      <div className="mx-auto flex max-w-360 flex-col gap-10 px-4 py-16 lg:flex-row lg:items-center lg:px-20 lg:py-20">
        <div className="flex flex-1 flex-col gap-10 lg:px-9">
          <h2
            id="mission-title"
            className="text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-midnight lg:text-headline"
          >
            {mission.heading}
          </h2>
          <div className="flex flex-col gap-6 text-body text-text">
            {mission.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <Image
          src={mission.image.src}
          alt={mission.image.alt}
          width={mission.image.width}
          height={mission.image.height}
          sizes="(min-width: 64rem) 25rem, 100vw"
          className="aspect-square w-full shrink-0 rounded-[0.625rem] object-cover sm:mx-auto sm:w-100 lg:mx-0"
        />
      </div>
    </section>
  );
}
