import Image from "next/image";
import type { PostBodyBlock } from "@/lib/blog/types";

type ArticleBodyProps = {
  blocks: readonly PostBodyBlock[];
};

export function ArticleBody({ blocks }: ArticleBodyProps) {
  return (
    <div className="flex flex-col gap-7">
      {blocks.map((block) => {
        if (block.type === "heading") {
          const Heading = block.level === 2 ? "h2" : "h3";
          return (
            <Heading key={block.id} className="text-title font-bold text-ink">
              {block.text}
            </Heading>
          );
        }

        if (block.type === "image") {
          return (
            <Image
              key={block.id}
              src={block.image.src}
              alt={block.image.alt}
              width={block.image.width}
              height={block.image.height}
              sizes="(min-width: 64rem) 70vw, 100vw"
              className="w-full rounded-md object-cover"
            />
          );
        }

        return (
          <p key={block.id} className="text-body text-text">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
