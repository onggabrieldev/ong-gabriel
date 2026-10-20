import type { MediaAsset } from "@/lib/home/types";

export type VideoAsset = {
  src: string;
  captionsSrc: string;
  title: string;
};

export type HistoryContent = {
  heading: string;
  paragraphs: readonly string[];
  poster: MediaAsset;
  video: VideoAsset | null;
  background: MediaAsset;
};

export type AboutMissionContent = {
  heading: string;
  paragraphs: readonly string[];
  image: MediaAsset;
};

export type ValueTone = "saffron" | "butter" | "soil" | "periwinkle" | "sky" | "indigo" | "teal";

export type OrganizationValue = {
  id: string;
  label: string;
  tone: ValueTone;
};

export type ValuesContent = {
  heading: string;
  items: readonly OrganizationValue[];
};

export type FoundersContent = {
  heading: string;
  names: string;
  description: string;
  portrait: MediaAsset;
};

export type GalleryPhoto = MediaAsset & {
  id: string;
};

export type GalleryContent = {
  heading: string;
  photos: readonly GalleryPhoto[];
};

export type AboutPageContent = {
  history: HistoryContent;
  mission: AboutMissionContent;
  values: ValuesContent;
  founders: FoundersContent;
  gallery: GalleryContent;
};
