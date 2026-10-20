"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons/icon";
import { showToast } from "@/components/ui/toast";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedMessage: string;
};

const resetAfterMs = 2500;

export function CopyButton({ value, label, copiedMessage }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast(copiedMessage);
      timer.current = window.setTimeout(() => setCopied(false), resetAfterMs);
    } catch {
      setCopied(false);
      showToast("Não foi possível copiar", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-navy bg-canvas px-4 text-label font-semibold text-navy transition-colors hover:bg-sky"
    >
      {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
      {label}
    </button>
  );
}
