import Link from "next/link";
import type { ReactNode } from "react";
import { PostCard } from "@/components/blog/post-card";
import { getPosts } from "@/lib/blog/get-posts";
import type { BlogCopy, Category } from "@/lib/blog/types";

type SearchValues = {
  q?: string | string[];
  categoria?: string | string[];
};

type LatestPostsProps = {
  searchParams: Promise<SearchValues>;
  copy: BlogCopy;
  categories: readonly Category[];
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

function blogHref(query: string, categorySlug: string): string {
  const params = new URLSearchParams();
  if (query.length > 0) {
    params.set("q", query);
  }
  if (categorySlug.length > 0) {
    params.set("categoria", categorySlug);
  }
  const search = params.toString();
  return search.length > 0 ? `/blog?${search}` : "/blog";
}

export async function LatestPosts({ searchParams, copy, categories }: LatestPostsProps) {
  const params = await searchParams;
  const query = firstValue(params.q);
  const categorySlug = firstValue(params.categoria);
  const posts = await getPosts({
    query: query.length > 0 ? query : undefined,
    categorySlug: categorySlug.length > 0 ? categorySlug : undefined,
  });

  return (
    <LatestPostsLayout
      copy={copy}
      categories={categories}
      query={query}
      categorySlug={categorySlug}
    >
      {posts.length === 0 ? (
        <p role="status" className="text-center text-body text-muted">
          {copy.emptyState}
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} learnMoreLabel={copy.learnMoreLabel} />
            </li>
          ))}
        </ul>
      )}
    </LatestPostsLayout>
  );
}

export function LatestPostsFallback({
  copy,
  categories,
}: {
  copy: BlogCopy;
  categories: readonly Category[];
}) {
  return (
    <LatestPostsLayout copy={copy} categories={categories} query="" categorySlug="">
      <p role="status" className="text-center text-body text-muted">
        {copy.loadingPosts}
      </p>
    </LatestPostsLayout>
  );
}

function LatestPostsLayout({
  copy,
  categories,
  query,
  categorySlug,
  children,
}: {
  copy: BlogCopy;
  categories: readonly Category[];
  query: string;
  categorySlug: string;
  children: ReactNode;
}) {
  const allCurrent = categorySlug.length === 0;

  return (
    <section aria-labelledby="latest-posts-title" className="bg-canvas">
      <div className="mx-auto flex max-w-360 flex-col gap-8 px-4 py-16 lg:gap-10 lg:px-20 lg:py-16">
        <h2
          id="latest-posts-title"
          className="text-center text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline"
        >
          {copy.latestHeading}
        </h2>

        <div className="flex flex-col gap-4 px-0 lg:px-8">
          <search>
            <form action="/blog" method="get" className="flex items-center gap-2.5">
              <label htmlFor="blog-search" className="sr-only">
                {copy.searchLabel}
              </label>
              <input
                id="blog-search"
                type="search"
                name="q"
                defaultValue={query}
                placeholder={copy.searchPlaceholder}
                className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-2 text-body text-text placeholder:text-placeholder lg:max-w-80"
              />
              {categorySlug.length > 0 ? (
                <input type="hidden" name="categoria" value={categorySlug} />
              ) : null}
              <button
                type="submit"
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-sky-mid px-4 text-label font-semibold text-indigo-deep transition-colors hover:bg-sky-deep"
              >
                {copy.searchSubmit}
              </button>
            </form>
          </search>

          <nav aria-label={copy.categoriesLabel} className="flex flex-wrap items-center gap-1.5">
            <p className="text-label font-semibold text-ink">{copy.categoriesLabel}</p>
            <ul className="flex flex-wrap items-center">
              <li>
                <Link
                  href={blogHref(query, "")}
                  aria-current={allCurrent ? "page" : undefined}
                  className={`inline-flex h-12 items-center rounded-full px-4 text-label font-semibold transition-colors hover:text-soil hover:underline ${
                    allCurrent ? "text-soil underline decoration-2 underline-offset-4" : "text-navy"
                  }`}
                >
                  {copy.allCategoriesLabel}
                </Link>
              </li>
              {categories.map((category) => {
                const current = category.slug === categorySlug;
                return (
                  <li key={category.id}>
                    <Link
                      href={blogHref(query, category.slug)}
                      aria-current={current ? "page" : undefined}
                      className={`inline-flex h-12 items-center rounded-full px-4 text-label font-semibold transition-colors hover:text-soil hover:underline ${
                        current
                          ? "text-soil underline decoration-2 underline-offset-4"
                          : "text-navy"
                      }`}
                    >
                      {category.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {children}
      </div>
    </section>
  );
}
