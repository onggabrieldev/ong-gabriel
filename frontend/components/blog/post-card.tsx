import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button-link";
import type { Post } from "@/lib/blog/types";

type PostCardProps = {
  post: Post;
  learnMoreLabel: string;
};

export function PostCard({ post, learnMoreLabel }: PostCardProps) {
  const href = `/blog/${post.slug}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-canvas p-2.5">
      <Link
        href={href}
        className="block overflow-hidden rounded-sm transition-opacity hover:opacity-90"
      >
        <Image
          src={post.cover.src}
          alt={post.cover.alt}
          width={post.cover.width}
          height={post.cover.height}
          sizes="(min-width: 64rem) 24rem, 100vw"
          className="h-85 w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="w-fit rounded-full bg-line px-1.75 py-0.75 text-xs text-ink-soft">
          {post.category.label}
        </p>
        <h3 className="text-title font-bold text-ink">
          <Link href={href} className="transition-colors hover:text-navy hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="text-body text-text">{post.excerpt}</p>
        <div className="mt-auto flex justify-end">
          <ButtonLink href={href} variant="text" className="group h-12 px-4">
            {learnMoreLabel}
            <ArrowRightIcon className="size-6 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none motion-reduce:translate-none motion-reduce:group-hover:translate-none motion-reduce:group-focus-visible:translate-none" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
