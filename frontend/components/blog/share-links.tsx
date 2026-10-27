"use client";

import { useSyncExternalStore } from "react";
import { SocialIcon } from "@/components/icons/icon";

function subscribe(): () => void {
  return () => {};
}

function getOrigin(): string {
  return window.location.origin;
}

function getServerOrigin(): string {
  return "";
}

type ShareLinksProps = {
  path: string;
  title: string;
  facebookLabel: string;
  xLabel: string;
  otherLabel: string;
  newTabSuffix: string;
};

export function ShareLinks({
  path,
  title,
  facebookLabel,
  xLabel,
  otherLabel,
  newTabSuffix,
}: ShareLinksProps) {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const url = origin ? `${origin}${path}` : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shares = [
    {
      id: "facebook" as const,
      label: facebookLabel,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "x" as const,
      label: xLabel,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      id: "linkedin" as const,
      label: otherLabel,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
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
              {share.label} ({newTabSuffix})
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
