import type { PageLink, SupportContent } from "@/lib/home/types";

export type AgendaHeroContent = {
  title: string;
  summary: string;
};

export type AgendaFilterCopy = {
  typeLabel: string;
  locationLabel: string;
  periodLabel: string;
  placeholder: string;
  applyLabel: string;
  clearLabel: string;
};

export type AgendaAppliedFilters = {
  tipo: string;
  local: string;
  periodo: string;
};

export type AgendaEventsCopy = {
  heading: string;
  moreLabel: string;
  emptyMessage: string;
  initialCount: number;
  detailsLabel: string;
  calendarLabel: string;
  registerLabel: string;
  registerDialogLabel: string;
  filters: AgendaFilterCopy;
};

export type AgendaFieldId = "name" | "email" | "phone";

export type AgendaFieldCopy = {
  id: AgendaFieldId;
  label: string;
  placeholder: string;
  requiredMessage: string;
};

export type AgendaRegistrationCopy = {
  datePrefix: string;
  fields: readonly AgendaFieldCopy[];
  terms: {
    prefix: string;
    linkLabel: string;
    href: string;
    requiredMessage: string;
  };
  updatesLabel: string;
  submitLabel: string;
  submittingLabel: string;
};

export type AgendaStatusCopy = {
  successTitle: string;
  successBody: readonly string[];
  successAction: string;
  errorTitle: string;
  errorBody: readonly string[];
  errorAction: string;
  closeLabel: string;
};

export type AgendaGalleryContent = {
  heading: string;
  summary: string;
  action: PageLink;
  cardActionLabel: string;
};

export type AgendaOutreachContent = {
  title: string;
  summary: string;
  action: PageLink;
};

export type AgendaPageContent = {
  hero: AgendaHeroContent;
  events: AgendaEventsCopy;
  registration: AgendaRegistrationCopy;
  status: AgendaStatusCopy;
  support: SupportContent;
  gallery: AgendaGalleryContent;
  outreach: AgendaOutreachContent;
};

export type RegistrationInput = {
  name: string;
  email: string;
  phone: string;
  acceptedTerms: boolean;
  wantsUpdates: boolean;
};

export type RegistrationResult = {
  ok: boolean;
};
