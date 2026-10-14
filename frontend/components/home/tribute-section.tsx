import Image from "next/image";
import type { TributeContent } from "@/lib/home/types";

type TributeSectionProps = {
  tribute: TributeContent;
};

export function TributeSection({ tribute }: TributeSectionProps) {
  return (
    <section aria-labelledby="tribute-title" className="bg-cream">
      <div className="mx-auto grid w-full max-w-360 lg:min-h-188 lg:grid-cols-[minmax(--spacing(80),--spacing(160))_1fr] lg:bg-ink">
        <div className="flex flex-col justify-center gap-10 bg-cream px-4 py-12 text-soil lg:px-20">
          <h2 id="tribute-title" className="sr-only">
            {tribute.heading}
          </h2>
          <blockquote className="text-title font-medium italic">{tribute.quote}</blockquote>
          <Image
            src={tribute.portrait.src}
            alt={tribute.portrait.alt}
            width={tribute.portrait.width}
            height={tribute.portrait.height}
            sizes="(min-width: 64rem) 32rem, 100vw"
            className="mx-auto h-72 w-full object-cover object-center"
          />
        </div>
        <div className="px-4 pb-12 lg:h-full lg:px-0 lg:pb-0">
          <div className="relative mx-auto h-72 w-full lg:h-full lg:min-h-188">
            <Image
              src={tribute.field.src}
              alt=""
              fill
              sizes="(min-width: 64rem) 60vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-ink/20" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
