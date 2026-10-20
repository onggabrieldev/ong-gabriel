"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons/icon";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedMessage: string;
  className?: string;
};

type CopyState = "idle" | "copied" | "failed";

const resetAfterMs = 2500;

export function CopyButton({ value, label, copiedMessage, className = "" }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = window.setTimeout(() => setState("idle"), resetAfterMs);
  }

  const copied = state === "copied";

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
      >
        {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
        {label}
      </button>
      <p role="status" aria-live="polite" className="min-h-6.25 text-body text-ink-soft">
        {copied ? copiedMessage : null}
        {state === "failed" ? "Não foi possível copiar. Tente de novo." : null}
      </p>
    </div>
  );
}
