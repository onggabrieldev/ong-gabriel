import type { SVGProps } from "react";
import type { SocialNetwork } from "@/lib/home/types";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20s-7-4.4-7-9.1C5 8 6.8 6.2 9.1 6.2c1.3 0 2.4.6 2.9 1.6.5-1 1.6-1.6 2.9-1.6 2.3 0 4.1 1.8 4.1 4.7C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </Svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6v12" />
      <path d="M15 6v12" />
    </Svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
    </Svg>
  );
}

export function SocialIcon({ id, ...props }: IconProps & { id: SocialNetwork }) {
  if (id === "instagram") {
    return (
      <Svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
      </Svg>
    );
  }

  if (id === "linkedin") {
    return (
      <Svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 11v5" />
        <path d="M8 8h.01" />
        <path d="M12 16v-3.2a1.8 1.8 0 0 1 3.6 0V16" />
      </Svg>
    );
  }

  if (id === "youtube") {
    return (
      <Svg {...props}>
        <rect x="3" y="7" width="18" height="10" rx="3" />
        <path d="m11 10 4 2-4 2z" fill="currentColor" stroke="none" />
      </Svg>
    );
  }

  if (id === "facebook") {
    return (
      <Svg {...props}>
        <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v5h3v-5h2.2l.8-3H13V9c0-.6.4-1 1-1Z" />
      </Svg>
    );
  }

  return (
    <Svg {...props}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </Svg>
  );
}
