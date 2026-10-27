import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/article-body";
import { MostVisited } from "@/components/blog/most-visited";
import { PostCard } from "@/components/blog/post-card";
import { RelativeTime } from "@/components/blog/relative-time";
import { ShareRow } from "@/components/blog/share-row";
import {
  getBlogCopy,
  getMostVisitedPosts,
  getPost,
  getPosts,
  getRelatedPosts,
} from "@/lib/blog/get-posts";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

// The page reads params and calls notFound() for unknown slugs, so it blocks on purpose.
export const instant = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Artigo" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [post, copy] = await Promise.all([getPost(slug), getBlogCopy()]);

  if (!post) {
    notFound();
  }

  const [related, popular] = await Promise.all([
    getRelatedPosts(post.slug, 3),
    getMostVisitedPosts(5),
  ]);
  const mostVisited = popular.filter((item) => item.slug !== post.slug).slice(0, 4);

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-360 px-4 py-10 lg:px-20 lg:py-20">
        <nav aria-label="Navegação estrutural" className="text-xs">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/blog"
                className="text-saffron transition-colors hover:text-soil hover:underline"
              >
                {copy.breadcrumbBlog}
              </Link>
            </li>
            <li className="text-placeholder" aria-hidden="true">
              /
            </li>
            <li className="text-placeholder">{copy.breadcrumbArticles}</li>
            <li className="text-placeholder" aria-hidden="true">
              /
            </li>
            <li className="text-muted" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_--spacing(50)] lg:items-start">
          <article>
            <h1 className="text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink lg:text-headline">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center text-label font-semibold">
              <p className="border-r border-placeholder px-2.5 py-2.5 text-saffron">
                {post.author}
              </p>
              <p className="border-r border-placeholder px-2.5 py-2.5 text-saffron">
                {post.category.label}
              </p>
              <p className="border-r border-placeholder px-2.5 py-2.5 text-muted">
                <RelativeTime dateTime={post.publishedAt} />
              </p>
            </div>
            <div className="relative mt-6 aspect-2/1 w-full overflow-hidden">
              <Image
                src={post.cover.src}
                alt={post.cover.alt}
                fill
                priority
                sizes="(min-width: 64rem) 70vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-10">
              <ArticleBody blocks={post.body} />
            </div>
            <div className="mt-10">
              <ShareRow
                path={`/blog/${post.slug}`}
                title={post.title}
                tags={post.tags}
                copy={copy}
              />
            </div>
          </article>
          <MostVisited heading={copy.mostVisitedHeading} posts={mostVisited} />
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="related-posts-title" className="mt-16 lg:mt-20">
            <h2
              id="related-posts-title"
              className="text-[2.25rem] leading-[1.15] font-semibold tracking-[0.01em] text-ink-soft lg:text-headline"
            >
              {copy.relatedHeading}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {related.map((item) => (
                <li key={item.id}>
                  <PostCard post={item} learnMoreLabel={copy.learnMoreLabel} showExcerpt={false} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
