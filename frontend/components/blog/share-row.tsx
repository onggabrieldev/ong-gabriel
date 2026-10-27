import { SocialIcon } from "@/components/icons/icon";
import type { BlogCopy, Tag } from "@/lib/blog/types";

type ShareRowProps = {
  url: string;
  title: string;
  tags: readonly Tag[];
  copy: BlogCopy;
};

export function ShareRow({ url, title, tags, copy }: ShareRowProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shares = [
    {
      id: "facebook" as const,
      label: copy.shareFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "x" as const,
      label: copy.shareX,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      id: "linkedin" as const,
      label: copy.shareOther,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-label font-semibold text-ink-soft">{copy.shareLabel}</p>
        <ul className="flex items-center gap-2">
          {shares.map((share) => (
            <li key={share.id}>
              <a
                href={share.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-full text-navy transition-colors hover:bg-sky hover:text-soil"
              >
                <SocialIcon id={share.id} className="size-6" />
                <span className="sr-only">
                  {share.label} ({copy.newTabSuffix})
                </span>
              </a>
            </li>
          ))}
        </ul>
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
