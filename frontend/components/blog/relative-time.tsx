"use client";

import { useEffect, useState } from "react";

type RelativeTimeProps = {
  dateTime: string;
};

const divisions = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
] as const;

function formatRelative(iso: string, now: Date): string {
  const date = new Date(iso);
  let duration = (date.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return rtf.format(0, "second");
}

function formatAbsolute(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function RelativeTime({ dateTime }: RelativeTimeProps) {
  const absolute = formatAbsolute(dateTime);
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    setRelative(formatRelative(dateTime, new Date()));
  }, [dateTime]);

  return (
    <time dateTime={dateTime} title={absolute}>
      {relative ?? absolute}
    </time>
  );
}
