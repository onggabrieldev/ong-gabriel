import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Follow-up: move these icons into components/icons/icon.tsx when that path is in scope.
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

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  );
}

export function UserPlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M17 11v6" />
      <path d="M14 14h6" />
    </Svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 12a9 9 0 1 1-2.4-6" />
      <path d="M21 5v5h-5" />
    </Svg>
  );
}

export function SuccessIcon(props: IconProps) {
  return (
    <Svg {...props} className={`text-success ${props.className ?? ""}`}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5.2" />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path d="M12 7.5v6" className="stroke-canvas" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="1" className="fill-canvas" />
    </svg>
  );
}

export const arrowMotionClass =
  "size-6 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:translate-none motion-reduce:group-hover:translate-none motion-reduce:group-focus-visible:translate-none";
