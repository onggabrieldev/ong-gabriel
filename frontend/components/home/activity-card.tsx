import Image from "next/image";
import type { Activity } from "@/lib/home/types";

type ActivityCardProps = {
  activity: Activity;
};

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-canvas p-2.5">
      <Image
        src={activity.image.src}
        alt={activity.image.alt}
        width={activity.image.width}
        height={activity.image.height}
        sizes="(min-width: 64rem) 24rem, 100vw"
        className="aspect-4/5 w-full rounded-sm object-cover lg:aspect-auto lg:h-85"
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="text-title font-bold text-ink">{activity.title}</h3>
        <p className="text-body text-text">{activity.description}</p>
      </div>
    </article>
  );
}
