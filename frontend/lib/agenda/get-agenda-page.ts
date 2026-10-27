import { agendaPageContent } from "@/lib/agenda/content";
import type { AgendaPageContent, RegistrationInput, RegistrationResult } from "@/lib/agenda/types";

export async function getAgendaPage(): Promise<AgendaPageContent> {
  return agendaPageContent;
}

const registrationDelayMs = 600;

export async function submitRegistration(
  eventId: string,
  _data: RegistrationInput,
): Promise<RegistrationResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, registrationDelayMs);
  });

  return { ok: eventId.length > 0 };
}
