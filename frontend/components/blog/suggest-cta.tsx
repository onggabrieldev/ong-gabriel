import { ButtonLink } from "@/components/ui/button-link";
import type { BlogCopy } from "@/lib/blog/types";

type SuggestCtaProps = {
  copy: BlogCopy;
};

export function SuggestCta({ copy }: SuggestCtaProps) {
  return (
    <section aria-labelledby="blog-suggest-title" className="bg-periwinkle">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-3 px-4 py-16 text-center lg:px-20 lg:py-20">
        <h2
          id="blog-suggest-title"
          className="text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
        >
          {copy.suggestTitle}
        </h2>
        <p className="max-w-3xl text-body text-text">{copy.suggestBody}</p>
        <ButtonLink href={copy.suggestAction.href} variant="outline" className="mt-2 w-50">
          {copy.suggestAction.label}
        </ButtonLink>
      </div>
    </section>
  );
}
