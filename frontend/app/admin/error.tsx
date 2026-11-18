"use client";

import { useEffect } from "react";

type AdminErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function AdminErrorPage({ error, retry }: AdminErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-cream px-4 py-16 text-center">
      <h1 className="text-title font-bold text-ink-soft">Algo não saiu como esperado</h1>
      <p className="mt-4 max-w-md text-body text-text">
        Tivemos um problema para mostrar esta página. Tente de novo daqui a pouco.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-saffron px-4 text-label font-semibold text-ink-soft transition-colors hover:bg-saffron-soft"
      >
        Tentar de novo
      </button>
    </main>
  );
}
