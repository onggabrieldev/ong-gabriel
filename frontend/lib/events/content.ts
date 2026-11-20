import type { EventPeriod } from "@/lib/events/types";

export const eventPeriods = [
  { id: "next-30-days", label: "Próximos 30 dias" },
  { id: "next-90-days", label: "Próximos 90 dias" },
  { id: "this-year", label: "Este ano" },
] as const satisfies readonly EventPeriod[];
