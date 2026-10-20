import Image from "next/image";
import type { HistoryContent } from "@/lib/about/types";

type HistorySectionProps = {
  history: HistoryContent;
};

export function HistorySection({ history }: HistorySectionProps) {
  const { video } = history;

  return (
    <section aria-labelledby="history-title" className="relative isolate bg-cream">
      <Image
        src={history.background.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-b from-cream/60 to-cream/12"
        aria-hidden="true"
      />
      <div className="mx-auto flex max-w-360 flex-col items-center gap-10 px-4 py-16 lg:gap-20 lg:px-20 lg:py-30">
        <h1
          id="history-title"
          className="text-center font-display text-[2.5rem] leading-[1.05] tracking-[0.02em] text-soil lg:text-display"
        >
          {history.heading}
        </h1>
        <div className="flex w-full flex-col overflow-hidden rounded-[0.625rem] bg-cream/90 shadow-panel lg:flex-row lg:items-center lg:gap-10">
          <div className="relative aspect-4/5 w-full shrink-0 sm:aspect-5/4 lg:aspect-auto lg:h-125.5 lg:w-156">
            {video ? (
              <video
                src={video.src}
                poster={history.poster.src}
                title={video.title}
                controls
                preload="none"
                className="size-full bg-ink object-cover"
              >
                <track
                  kind="captions"
                  src={video.captionsSrc}
                  srcLang="pt-BR"
                  label="Português"
                  default
                />
                Seu navegador não reproduz este vídeo.
              </video>
            ) : (
              <Image
                src={history.poster.src}
                alt={history.poster.alt}
                fill
                sizes="(min-width: 64rem) 39rem, 100vw"
                className="object-cover object-center"
              />
            )}
          </div>
          <div className="flex flex-col gap-6 px-6 py-8 text-body text-text lg:max-w-141.5 lg:px-0 lg:py-10">
            {history.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
