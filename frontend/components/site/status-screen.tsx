import Image from "next/image";
import type { ReactNode } from "react";
import type { StatusMessage } from "@/lib/site/status-pages";

type StatusScreenProps = {
  message: StatusMessage;
  // The sunflower takes the place of the middle digit, the zero in "404".
  code?: string;
  children: ReactNode;
};

export function StatusScreen({ message, code, children }: StatusScreenProps) {
  const before = code?.slice(0, 1);
  const after = code?.slice(2);

  return (
    <section aria-labelledby="status-title" className="bg-cream">
      <div className="mx-auto flex max-w-360 flex-col items-center px-4 py-16 text-center lg:px-20 lg:py-28">
        {code ? (
          <p className="flex items-center font-display text-[7rem] leading-none text-saffron sm:text-[10rem] lg:text-[12rem]">
            <span className="sr-only">Erro {code}</span>
            <span aria-hidden="true">{before}</span>
            <Image
              src="/brand/logo.svg"
              alt=""
              width={54}
              height={54}
              priority
              className="mx-1 size-[0.9em]"
            />
            <span aria-hidden="true">{after}</span>
          </p>
        ) : (
          <Image src="/brand/logo.svg" alt="" width={54} height={54} priority className="size-28" />
        )}
        <h1
          id="status-title"
          className="mt-8 max-w-2xl font-display text-[2.25rem] leading-[1.1] tracking-[0.02em] text-soil lg:text-headline"
        >
          {message.title}
        </h1>
        <div className="mt-6 flex max-w-xl flex-col gap-4 text-label font-semibold text-text">
          {message.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">{children}</div>
      </div>
    </section>
  );
}
