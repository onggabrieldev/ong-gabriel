import { donationPageContent } from "@/lib/donation/content";
import type { DonationPageContent } from "@/lib/donation/types";

export async function getDonationPage(): Promise<DonationPageContent> {
  return donationPageContent;
}
