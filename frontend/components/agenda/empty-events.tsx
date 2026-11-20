import Link from "next/link";
import { arrowMotionClass, CalendarIcon } from "@/components/agenda/agenda-icons";
import { ArrowRightIcon } from "@/components/icons/icon";
import type { AgendaEmptyCopy } from "@/lib/agenda/types";

type EmptyEventsProps = {
  copy: AgendaEmptyCopy;
  // True when the agenda has events and the filters hid all of them.
  filtered: boolean;
  onClearFilters: () => void;
};

const actionClass =
  "group inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-navy bg-canvas px-6 text-label font-semibold text-navy transition-colors hover:bg-sky";

export function EmptyEvents({ copy, filtered, onClearFilters }: EmptyEventsProps) {
  const content = filtered ? copy.filtered : copy.none;

  return (
    <div className="flex flex-col items-center gap-6 rounded-xl bg-cream px-6 py-12 text-center lg:py-16">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-sky-mid text-indigo-deep">
        <CalendarIcon className="size-8" />
      </span>
      <div className="flex max-w-xl flex-col gap-2">
        <p className="text-label font-semibold text-ink">{content.title}</p>
        <p className="text-body text-muted">{content.summary}</p>
      </div>
      {filtered ? (
        <button type="button" className={actionClass} onClick={onClearFilters}>
          {copy.filtered.actionLabel}
        </button>
      ) : (
        <Link href={copy.none.action.href} className={actionClass}>
          {copy.none.action.label}
          <ArrowRightIcon className={arrowMotionClass} />
        </Link>
      )}
    </div>
  );
}
