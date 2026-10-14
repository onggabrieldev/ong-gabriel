import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button-link";
import type { MissionContent } from "@/lib/home/types";

type MissionSectionProps = {
  mission: MissionContent;
};

export function MissionSection({ mission }: MissionSectionProps) {
  return (
    <section aria-labelledby="mission-title" className="bg-sky">
      <div className="mx-auto flex max-w-360 flex-col gap-8 py-8 lg:flex-row lg:items-center lg:gap-10 lg:py-5">
        <h2 id="mission-title" className="sr-only">
          {mission.heading}
        </h2>
        <div className="relative mx-auto hidden w-56 shrink-0 lg:mx-0 lg:block lg:w-72">
          <Image
            src={mission.flower.src}
            alt=""
            width={mission.flower.width}
            height={mission.flower.height}
            className="h-auto w-full mix-blend-multiply"
          />
        </div>
        <ul className="sr-only">
          {mission.values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
        <div className="px-4 pb-4 lg:py-16 lg:pr-20 lg:pl-10">
          <div className="flex max-w-4xl flex-col gap-8 text-label font-semibold text-text">
            {mission.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10 flex justify-end">
            <ButtonLink href={mission.action.href} variant="text" className="group">
              {mission.action.label}
              <ArrowRightIcon className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:translate-none motion-reduce:group-hover:translate-none motion-reduce:group-focus-visible:translate-none" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
