import type { ReactNode } from "react";

const controlClass =
  "mt-1 w-full rounded-lg border border-line bg-canvas px-2 text-body text-ink-soft transition-colors placeholder:text-placeholder hover:border-navy aria-invalid:border-danger";
export const inputClass = `${controlClass} h-10`;
export const textareaClass = `${controlClass} py-2`;
const hintClass = "pt-1 text-[0.6875rem] leading-snug text-muted";

type FieldProps = {
  id: string;
  label: string;
  error: string | undefined;
  hint?: ReactNode;
  // Character counts change while typing, so screen readers hear them.
  liveHint?: boolean;
  className?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

export function Field({ id, label, error, hint, liveHint, className, children }: FieldProps) {
  const ids = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <label htmlFor={id} className="text-label font-semibold text-text">
        {label}
      </label>
      {children(ids || undefined)}
      {hint ? (
        <p id={`${id}-hint`} aria-live={liveHint ? "polite" : undefined} className={hintClass}>
          {hint}
        </p>
      ) : null}
      <p
        id={`${id}-error`}
        className="min-h-5 text-sm font-semibold text-danger"
        aria-hidden={error ? undefined : true}
      >
        {error}
      </p>
    </div>
  );
}
