import Link from "next/link";
import type { GalleryBreadcrumbCopy } from "@/lib/gallery/types";

type BreadcrumbProps = {
  copy: GalleryBreadcrumbCopy;
  current?: string;
};

export function Breadcrumb({ copy, current }: BreadcrumbProps) {
  const galleryIsCurrent = current === undefined;

  return (
    <nav aria-label={copy.navLabel} className="text-[0.75rem] leading-normal">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link
            href={copy.agenda.href}
            className="font-medium text-saffron transition-colors hover:text-soil hover:underline"
          >
            {copy.agenda.label}
          </Link>
        </li>
        <li aria-hidden="true" className="text-placeholder">
          /
        </li>
        <li>
          <Link
            href={copy.gallery.href}
            aria-current={galleryIsCurrent ? "page" : undefined}
            className="font-medium text-sky-mid transition-colors hover:text-soil hover:underline"
          >
            {copy.gallery.label}
          </Link>
        </li>
        {current ? (
          <>
            <li aria-hidden="true" className="text-placeholder">
              /
            </li>
            <li>
              <span aria-current="page" className="text-placeholder">
                {current}
              </span>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}
