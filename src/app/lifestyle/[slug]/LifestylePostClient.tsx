import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ShareButtons } from "@/components/recipe/ShareButtons";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { formatDate } from "@/lib/utils";
import { getLifestyleCategoryLabel } from "@/lib/constants";
import type { LifestylePost } from "@/types";

interface LifestylePostClientProps {
  post: LifestylePost;
  relatedPosts: LifestylePost[];
}

export function LifestylePostClient({ post, relatedPosts }: LifestylePostClientProps) {
  return (
    <article className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <header className="mb-8">
          <Badge variant="accent" className="mb-4">{getLifestyleCategoryLabel(post.category)}</Badge>
          <h1 className="h-page text-[var(--color-text-primary)] mb-4">{post.title}</h1>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {formatDate(post.publishedAt)} · {post.readingTime} min read
          </p>
        </header>

        <FoodPlaceholder className="w-full h-64 sm:h-80 mb-10" />

        <div className="prose mb-10" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="py-6 border-t border-[var(--color-border)]">
          <ShareButtons title={post.title} slug={`lifestyle/${post.slug}`} />
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-16">
          <SectionHeader eyebrow="Keep reading" title="More stories" href="/lifestyle" linkLabel="All stories" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {relatedPosts.map((p) => (
              <Link key={p.slug} href={`/lifestyle/${p.slug}`} className="group block rounded-[var(--radius-md)]">
                <FoodPlaceholder ratio="landscape" className="w-full group-hover:opacity-90 transition-opacity" />
                <div className="pt-3">
                  <Badge variant="accent" className="mb-2">{getLifestyleCategoryLabel(p.category)}</Badge>
                  <h3 className="h-card text-[var(--color-text-primary)] group-hover:underline underline-offset-[3px] decoration-1 mb-1 line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{p.readingTime} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
