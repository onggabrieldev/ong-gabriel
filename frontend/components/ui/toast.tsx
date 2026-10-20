"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons/icon";

export type ToastTone = "success" | "error";

type ToastDetail = {
  message: string;
  tone: ToastTone;
};

type ToastState = ToastDetail & {
  id: number;
};

const toastEvent = "ong-gabriel:toast";
const visibleForMs = 2500;
const fadeOutMs = 200;

export function showToast(message: string, tone: ToastTone = "success") {
  window.dispatchEvent(new CustomEvent<ToastDetail>(toastEvent, { detail: { message, tone } }));
}

// Mounted once in the layout. The live region stays in the DOM so every message is announced.
export function Toaster() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    function onToast(event: Event) {
      const { detail } = event as CustomEvent<ToastDetail>;
      window.clearTimeout(timer.current);
      setToast((current) => ({ ...detail, id: (current?.id ?? 0) + 1 }));
      setVisible(true);
      timer.current = window.setTimeout(() => {
        setVisible(false);
        timer.current = window.setTimeout(() => setToast(null), fadeOutMs);
      }, visibleForMs);
    }

    window.addEventListener(toastEvent, onToast);
    return () => {
      window.removeEventListener(toastEvent, onToast);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-4 bottom-34 z-40 flex max-w-[calc(100vw-2rem)] justify-end"
    >
      {toast ? (
        <p
          key={toast.id}
          className={`inline-flex items-center gap-2 rounded-3xl bg-indigo-deep px-4 py-2 text-body font-semibold text-cream shadow-card transition-[opacity,translate] duration-200 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:translate-y-0 motion-reduce:transition-opacity ${
            visible ? "opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {toast.tone === "success" ? (
            <CheckIcon className="size-4.5 shrink-0 text-saffron" />
          ) : (
            <CloseIcon className="size-4.5 shrink-0 text-saffron" />
          )}
          {toast.message}
        </p>
      ) : null}
    </div>
  );
}
