import type { ImpactContent } from "@/lib/home/types";

type ImpactSectionProps = {
  impact: ImpactContent;
};

export function ImpactSection({ impact }: ImpactSectionProps) {
  return (
    <section aria-labelledby="impact-title" className="bg-canvas">
      <div className="mx-auto max-w-360 px-4 py-16 lg:px-20 lg:py-28">
        <h2
          id="impact-title"
          className="text-center text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
        >
          {impact.title}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {impact.stats.map((stat) => (
            <li key={stat.id} className="rounded-md bg-saffron px-4 py-4 text-center shadow-card">
              <p className="text-[2.25rem] leading-none font-bold text-indigo">{stat.value}</p>
              <p className="mt-1 text-body text-text">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
