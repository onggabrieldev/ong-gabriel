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
        unoptimized
        className="aspect-4/5 w-full rounded-sm object-cover lg:aspect-auto lg:h-85"
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Two reserved lines keep the descriptions in a row aligned. */}
        <h3 className="text-title font-bold text-ink wrap-break-word lg:min-h-[2lh]">
          {activity.title}
        </h3>
        <p className="text-body text-text wrap-break-word">{activity.description}</p>
      </div>
    </article>
  );
}
