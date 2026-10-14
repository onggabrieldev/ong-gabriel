import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  saffron: "bg-saffron text-ink-soft hover:bg-saffron-soft",
  saffronSoft: "bg-saffron-soft text-ink-soft hover:bg-saffron",
  sky: "bg-sky-mid text-indigo-deep hover:bg-sky-deep",
  outline: "border border-navy bg-canvas text-navy hover:bg-sky",
  text: "px-2 text-navy hover:underline",
} as const;

export type ButtonLinkVariant = keyof typeof variants;

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonLinkVariant;
};

export function ButtonLink({ variant = "saffron", className = "", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-4 text-label font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
