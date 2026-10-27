import { ShareLinks } from "@/components/blog/share-links";
import type { BlogCopy, Tag } from "@/lib/blog/types";

type ShareRowProps = {
  path: string;
  title: string;
  tags: readonly Tag[];
  copy: BlogCopy;
};

export function ShareRow({ path, title, tags, copy }: ShareRowProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-label font-semibold text-ink-soft">{copy.shareLabel}</p>
        <ShareLinks
          path={path}
          title={title}
          facebookLabel={copy.shareFacebook}
          xLabel={copy.shareX}
          otherLabel={copy.shareOther}
          newTabSuffix={copy.newTabSuffix}
        />
      </div>
      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <li key={tag.id} className="rounded-full bg-line/80 px-4 py-1.5 text-label text-muted">
              {tag.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
