import { SectionHeader } from "@/components/shared/SectionHeader";
import { StoryCard } from "@/components/lifestyle/StoryCard";
import type { LifestylePost } from "@/types";

/** Three stories, photos first. Only rendered when there are posts (the page decides). */
export function StoriesTeaser({ posts }: { posts: LifestylePost[] }) {
  return (
    <section className="py-10 sm:py-14">
      <SectionHeader title="Stories" href="/lifestyle" linkLabel="All the stories" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-10">
        {posts.map((post) => (
          <StoryCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
