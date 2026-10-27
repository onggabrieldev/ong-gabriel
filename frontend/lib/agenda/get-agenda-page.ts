import { agendaPageContent } from "@/lib/agenda/content";
import type { AgendaPageContent } from "@/lib/agenda/types";

export async function getAgendaPage(): Promise<AgendaPageContent> {
  return agendaPageContent;
}
