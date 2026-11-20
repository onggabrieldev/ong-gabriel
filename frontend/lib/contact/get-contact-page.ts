import { contactPageContent } from "@/lib/contact/content";
import type { ContactPageContent } from "@/lib/contact/types";

export async function getContactPage(): Promise<ContactPageContent> {
  return contactPageContent;
}
