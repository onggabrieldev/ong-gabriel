import type { ContactContent, ImpactStat, MediaAsset, PageLink } from "@/lib/home/types";

export type DonationHeroContent = {
  title: string;
  summary: string;
  action: PageLink;
  background: MediaAsset;
};

export type PixContent = {
  title: string;
  qrCode: MediaAsset;
  keyLabel: string;
  keyType: string;
  key: string;
  keyValue: string;
  copyKeyLabel: string;
  copyCodeLabel: string;
  code: string;
};

export type BankDetail = {
  id: string;
  label: string;
  value: string;
};

export type BankContent = {
  title: string;
  details: readonly BankDetail[];
};

export type DonationOptionsContent = {
  heading: string;
  pix: PixContent;
  bank: BankContent;
};

export type DonationImpactContent = {
  heading: string;
  stats: readonly ImpactStat[];
  background: MediaAsset;
  photos: readonly [MediaAsset, MediaAsset, MediaAsset, MediaAsset];
};

export type DonationPageContent = {
  hero: DonationHeroContent;
  options: DonationOptionsContent;
  contact: ContactContent;
  impact: DonationImpactContent;
};
