import { ShareButtons } from "@/components/recipe/ShareButtons";
import { Photo } from "@/components/shared/Photo";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Necklace } from "@/components/brand/Necklace";
import { StoryCard } from "@/components/lifestyle/StoryCard";
import { getLifestyleCategoryLabel } from "@/lib/constants";
import { formatDateLong } from "@/lib/facts";
import type { LifestylePost } from "@/types";

interface LifestylePostClientProps {
  post: LifestylePost;
  relatedPosts: LifestylePost[];
}

/** A story: category, title, date, the photo, then the words at reading measure. */
export function LifestylePostClient({ post, relatedPosts }: LifestylePostClientProps) {
  return (
    <article className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <header className="mb-8">
          <p className="text-sm text-[var(--color-text-2)] mb-3">{getLifestyleCategoryLabel(post.category)}</p>
          <h1 className="h-page text-[var(--color-text)] mb-4">{post.title}</h1>
          <p className="text-sm text-[var(--color-text-3)]">
            {formatDateLong(post.publishedAt)}. {post.readingTime} min read.
          </p>
        </header>

        <Photo src={post.coverImage} alt={post.coverImageAlt || post.title} label={post.title} ratio="wide" priority sizes="(min-width: 1024px) 720px, 100vw" className="w-full mb-10" />

        <div className="prose mb-10" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="py-6 border-t border-[var(--color-line)]">
          <ShareButtons title={post.title} slug={`lifestyle/${post.slug}`} />
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-16">
          <Necklace className="mb-12" />
          <SectionHeader title="More stories" href="/lifestyle" linkLabel="All the stories" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {relatedPosts.map((p) => (
              <StoryCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
