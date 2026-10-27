import type { MediaAsset, PageLink } from "@/lib/home/types";

export type Category = {
  id: string;
  slug: string;
  label: string;
};

export type Tag = {
  id: string;
  slug: string;
  label: string;
};

export type ParagraphBlock = {
  type: "paragraph";
  id: string;
  text: string;
};

export type HeadingBlock = {
  type: "heading";
  id: string;
  level: 2 | 3;
  text: string;
};

export type ImageBlock = {
  type: "image";
  id: string;
  image: MediaAsset;
};

export type PostBodyBlock = ParagraphBlock | HeadingBlock | ImageBlock;

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: readonly PostBodyBlock[];
  category: Category;
  tags: readonly Tag[];
  author: string;
  publishedAt: string;
  cover: MediaAsset;
  featured: boolean;
  popularity: number;
};

export type PostFilters = {
  query?: string;
  categorySlug?: string;
};

export type BlogCopy = {
  featuredRegionLabel: string;
  readPostLabel: string;
  previousPostLabel: string;
  nextPostLabel: string;
  latestHeading: string;
  searchPlaceholder: string;
  searchLabel: string;
  searchSubmit: string;
  categoriesLabel: string;
  allCategoriesLabel: string;
  learnMoreLabel: string;
  emptyState: string;
  loadingPosts: string;
  upcomingHeading: string;
  eventDetailsLabel: string;
  suggestTitle: string;
  suggestBody: string;
  suggestAction: PageLink;
  breadcrumbBlog: string;
  breadcrumbArticles: string;
  shareLabel: string;
  shareFacebook: string;
  shareX: string;
  shareOther: string;
  newTabSuffix: string;
  mostVisitedHeading: string;
  relatedHeading: string;
};
