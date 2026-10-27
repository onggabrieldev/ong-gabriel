import { arrowMotionClass } from "@/components/agenda/agenda-icons";
import { ArrowRightIcon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button-link";
import type { AgendaOutreachContent } from "@/lib/agenda/types";

type OutreachSectionProps = {
  outreach: AgendaOutreachContent;
};

export function OutreachSection({ outreach }: OutreachSectionProps) {
  return (
    <section aria-labelledby="outreach-title" className="bg-sky-deep">
      <div className="mx-auto flex max-w-360 flex-col items-center gap-6 px-4 py-16 text-center lg:px-20 lg:py-20">
        <h2
          id="outreach-title"
          className="max-w-4xl text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink-soft lg:text-headline"
        >
          {outreach.title}
        </h2>
        <p className="max-w-3xl text-body text-text">{outreach.summary}</p>
        <ButtonLink href={outreach.action.href} className="group">
          {outreach.action.label}
          <ArrowRightIcon className={arrowMotionClass} />
        </ButtonLink>
      </div>
    </section>
  );
}
