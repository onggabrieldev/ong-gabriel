"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/site/status-screen";
import { ButtonLink } from "@/components/ui/button-link";
import { errorContent } from "@/lib/site/status-pages";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen message={errorContent}>
      <button
        type="button"
        onClick={() => retry()}
        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
      >
        {errorContent.retryLabel}
      </button>
      <ButtonLink href={errorContent.homeLink.href} variant="outline">
        {errorContent.homeLink.label}
      </ButtonLink>
    </StatusScreen>
  );
}
