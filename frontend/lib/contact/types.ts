import type { SocialProfile } from "@/lib/home/types";

export type ContactFieldId = "name" | "email" | "message";

export type ContactField = {
  id: ContactFieldId;
  label: string;
  placeholder: string;
  hint: string;
  requiredMessage: string;
};

export type ContactContent = {
  title: string;
  description: string;
  fields: readonly ContactField[];
  submitLabel: string;
  inboxEmail: string | null;
  unavailableMessage: string;
  social: readonly SocialProfile[];
};

export type ContactPageContent = {
  contact: ContactContent;
};
