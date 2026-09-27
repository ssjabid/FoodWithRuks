import Link from "next/link";
import { Photo } from "@/components/shared/Photo";
import { getLifestyleCategoryLabel } from "@/lib/constants";
import { formatDateLong } from "@/lib/facts";
import type { LifestylePost } from "@/types";

interface StoryCardProps {
  post: LifestylePost;
  priority?: boolean;
  /** h2 on the stories index, h3 inside teasers and "More stories" */
  headingLevel?: "h2" | "h3";
}

/** A story card: the photo carries it, then the category, the title and the date. */
export function StoryCard({ post, priority = false, headingLevel: Heading = "h3" }: StoryCardProps) {
  return (
    <article className="group h-full">
      <Link href={`/lifestyle/${post.slug}`} className="block">
        <Photo
          src={post.coverImage}
          alt={post.coverImageAlt || post.title}
          label={post.title}
          ratio="landscape"
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="w-full group-hover:opacity-90 transition-opacity"
        />
        <div className="pt-3">
          <p className="text-sm text-[var(--color-text-2)]">{getLifestyleCategoryLabel(post.category)}</p>
          <Heading className="h-card text-[var(--color-text)] mt-1 group-hover:underline underline-offset-[3px] decoration-1 line-clamp-2">{post.title}</Heading>
          <p className="text-xs text-[var(--color-text-3)] mt-2">{formatDateLong(post.publishedAt)}</p>
        </div>
      </Link>
    </article>
  );
}
