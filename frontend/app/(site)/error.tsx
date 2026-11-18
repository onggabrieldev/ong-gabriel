"use client";

import { ErrorFallback } from "@/components/site/error-fallback";

type SiteErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function SiteErrorPage({ error, retry }: SiteErrorPageProps) {
  return <ErrorFallback error={error} retry={retry} />;
}
