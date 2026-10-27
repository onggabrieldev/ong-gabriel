import type { MediaAsset, PageLink } from "@/lib/home/types";

export type GalleryHeroContent = {
  title: string;
  summary: string;
};

export type GalleryBreadcrumbCopy = {
  navLabel: string;
  agenda: PageLink;
  gallery: PageLink;
};

export type GalleryFilterField = {
  label: string;
  placeholder: string;
};

export type GalleryFiltersCopy = {
  type: GalleryFilterField;
  location: GalleryFilterField;
  applyLabel: string;
  clearLabel: string;
};

export type GalleryListCopy = {
  heading: string;
  loadMoreLabel: string;
  empty: string;
  resultCount: string;
};

export type GalleryPhotosCopy = {
  heading: string;
  loadMoreLabel: string;
  empty: string;
  resultCount: string;
  photoLabel: string;
  counterSeparator: string;
  previousLabel: string;
  nextLabel: string;
  closeLabel: string;
};

export type GalleryDonationContent = {
  title: string;
  paragraphs: readonly string[];
  action: PageLink;
  image: MediaAsset;
};

export type GalleryPageContent = {
  hero: GalleryHeroContent;
  breadcrumb: GalleryBreadcrumbCopy;
  filters: GalleryFiltersCopy;
  list: GalleryListCopy;
  photos: GalleryPhotosCopy;
  donation: GalleryDonationContent;
};
