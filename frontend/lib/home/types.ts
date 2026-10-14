export type MediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type PageLink = {
  label: string;
  href: string;
};

export type SocialNetwork = "instagram" | "linkedin" | "youtube" | "facebook" | "x";

export type SocialProfile = {
  id: SocialNetwork;
  label: string;
  href: string;
};

export type HeroContent = {
  kicker: string;
  titleLines: readonly [string, string];
  summary: string;
  image: MediaAsset;
};

export type MissionContent = {
  heading: string;
  paragraphs: readonly string[];
  action: PageLink;
  flower: MediaAsset;
  values: readonly string[];
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  image: MediaAsset;
};

export type ActivitiesContent = {
  heading: string;
  items: readonly Activity[];
  action: PageLink;
};

export type SupportContent = {
  title: string;
  subtitle: string;
  paragraphs: readonly string[];
  action: PageLink;
  image: MediaAsset;
};

export type DonationContent = {
  title: string;
  paragraphs: readonly string[];
  action: PageLink;
  image: MediaAsset;
};

export type ImpactStat = {
  id: string;
  value: string;
  label: string;
};

export type ImpactContent = {
  title: string;
  stats: readonly ImpactStat[];
};

export type VolunteerContent = {
  title: string;
  subtitle: string;
  paragraphs: readonly string[];
  actionLabel: string;
  confirmTitle: string;
  confirmBody: readonly string[];
  confirmAction: string;
  cancelLabel: string;
  destinationHref: string;
  image: MediaAsset;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  portrait: MediaAsset | null;
};

export type TestimonialsContent = {
  heading: string;
  background: MediaAsset;
  items: readonly Testimonial[];
};

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

export type TributeContent = {
  heading: string;
  quote: string;
  portrait: MediaAsset;
  field: MediaAsset;
};

export type HomePageContent = {
  hero: HeroContent;
  mission: MissionContent;
  activities: ActivitiesContent;
  support: SupportContent;
  donation: DonationContent;
  impact: ImpactContent;
  volunteer: VolunteerContent;
  testimonials: TestimonialsContent;
  contact: ContactContent;
  tribute: TributeContent;
};
