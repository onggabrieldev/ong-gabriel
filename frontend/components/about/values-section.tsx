import type { ValuesContent, ValueTone } from "@/lib/about/types";

const tones = {
  saffron: "bg-saffron text-text",
  butter: "bg-butter text-text",
  soil: "bg-soil text-canvas",
  periwinkle: "bg-periwinkle text-text",
  sky: "bg-sky-deep text-text",
  indigo: "bg-indigo text-canvas",
  teal: "bg-teal text-text",
} as const satisfies Record<ValueTone, string>;

type ValuesSectionProps = {
  values: ValuesContent;
};

/*
  On large screens the seven values sit in rows of 2, 3, and 2 on a six-column grid.
  The first and sixth cards start at column 2 to center the short rows.
*/
export function ValuesSection({ values }: ValuesSectionProps) {
  return (
    <section aria-labelledby="values-title" className="bg-cream">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-10 px-4 pt-16 pb-20 lg:gap-20 lg:px-24 lg:pt-20 lg:pb-30">
        <h2
          id="values-title"
          className="text-center text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
        >
          {values.heading}
        </h2>
        <ul className="grid w-full max-w-95 gap-6 lg:max-w-305 lg:grid-cols-6 lg:gap-x-10 lg:gap-y-20">
          {values.items.map((value) => (
            <li
              key={value.id}
              className={`flex items-center justify-center rounded-r-[3.125rem] rounded-bl-[3.125rem] px-3 py-2.5 lg:col-span-2 lg:first:col-start-2 lg:nth-6:col-start-2 ${tones[value.tone]}`}
            >
              <span className="font-display text-[2rem] leading-[1.2] tracking-[0.02em]">
                {value.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
