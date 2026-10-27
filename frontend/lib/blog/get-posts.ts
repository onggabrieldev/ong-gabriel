import { blogCopy, posts } from "@/lib/blog/content";
import type { BlogCopy, Post, PostFilters } from "@/lib/blog/types";

function firstString(value: string | undefined): string {
  return value?.trim() ?? "";
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function blockText(post: Post): string {
  return post.body
    .map((block) => {
      if (block.type === "image") {
        return block.image.alt;
      }
      return block.text;
    })
    .join(" ");
}

function matchesQuery(post: Post, query: string): boolean {
  if (query.length === 0) {
    return true;
  }
  const haystack = normalize(
    [
      post.title,
      post.excerpt,
      post.author,
      post.category.label,
      blockText(post),
      ...post.tags.map((tag) => tag.label),
    ].join(" "),
  );
  return haystack.includes(normalize(query));
}

function byNewest(left: Post, right: Post): number {
  return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
}

function byPopularity(left: Post, right: Post): number {
  return right.popularity - left.popularity;
}

export async function getBlogCopy(): Promise<BlogCopy> {
  return blogCopy;
}

export async function getPosts(filters: PostFilters = {}): Promise<readonly Post[]> {
  const query = firstString(filters.query);
  const categorySlug = firstString(filters.categorySlug);

  return posts
    .filter((post) => (categorySlug.length === 0 ? true : post.category.slug === categorySlug))
    .filter((post) => matchesQuery(post, query))
    .toSorted(byNewest);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return posts.find((post) => post.slug === slug);
}

export async function getFeaturedPosts(): Promise<readonly Post[]> {
  return posts.filter((post) => post.featured);
}

export async function getMostVisitedPosts(limit: number): Promise<readonly Post[]> {
  return posts.toSorted(byPopularity).slice(0, limit);
}

export async function getRelatedPosts(slug: string, limit: number): Promise<readonly Post[]> {
  const current = posts.find((post) => post.slug === slug);
  if (!current) {
    return [];
  }

  const sameCategory = posts.filter(
    (post) => post.slug !== slug && post.category.id === current.category.id,
  );
  const others = posts.filter(
    (post) => post.slug !== slug && post.category.id !== current.category.id,
  );

  return [...sameCategory, ...others].slice(0, limit);
}
