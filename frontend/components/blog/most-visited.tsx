import Link from "next/link";
import type { Post } from "@/lib/blog/types";

type MostVisitedProps = {
  heading: string;
  posts: readonly Post[];
};

export function MostVisited({ heading, posts }: MostVisitedProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <aside
      aria-labelledby="most-visited-title"
      className="hidden border-l border-placeholder py-8 lg:block"
    >
      <div className="ps-4">
        <h2 id="most-visited-title" className="text-title font-bold text-ink">
          {heading}
        </h2>
        <ul className="mt-2 flex flex-col">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="block px-2.5 py-2.5 text-label text-saffron transition-colors hover:text-soil hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
