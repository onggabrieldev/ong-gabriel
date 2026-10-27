import type { RegistrationInput, RegistrationResult } from "@/lib/agenda/types";

// Placeholder seam for the API. Swap the body for a fetch and keep the signature.

const registrationDelayMs = 600;

export async function submitRegistration(
  _eventId: string,
  _data: RegistrationInput,
): Promise<RegistrationResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, registrationDelayMs);
  });

  return { ok: true };
}
