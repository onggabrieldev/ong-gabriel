export function formatHeldOn(heldOn: string): string {
  const [year, month, day] = heldOn.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);

  const dayPart = parts.find((part) => part.type === "day")?.value ?? "";
  const monthPart = parts.find((part) => part.type === "month")?.value ?? "";
  const yearPart = parts.find((part) => part.type === "year")?.value ?? "";

  return `${dayPart} ${monthPart} ${yearPart}`;
}
