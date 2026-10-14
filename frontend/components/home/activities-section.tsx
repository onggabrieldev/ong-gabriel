import { ActivityCard } from "@/components/home/activity-card";
import { ArrowRightIcon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button-link";
import type { ActivitiesContent } from "@/lib/home/types";

type ActivitiesSectionProps = {
  activities: ActivitiesContent;
};

export function ActivitiesSection({ activities }: ActivitiesSectionProps) {
  return (
    <section aria-labelledby="activities-title" className="bg-canvas">
      <div className="mx-auto flex max-w-360 flex-col gap-8 px-4 py-16 lg:px-20 lg:py-28">
        <h2 id="activities-title" className="sr-only">
          {activities.heading}
        </h2>
        <ul className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          {activities.items.map((activity) => (
            <li key={activity.id}>
              <ActivityCard activity={activity} />
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <ButtonLink href={activities.action.href} variant="text" className="group">
            {activities.action.label}
            <ArrowRightIcon className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:translate-none motion-reduce:group-hover:translate-none motion-reduce:group-focus-visible:translate-none" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
