import { KitchenTime } from "@/components/home/KitchenTime";
import { Offering } from "@/components/home/Offering";
import { CurrentlyCard } from "@/components/home/CurrentlyCard";
import { NewOutOfTheOven } from "@/components/home/NewOutOfTheOven";
import { CollectionsRow } from "@/components/home/CollectionsRow";
import { ComeBackFor } from "@/components/home/ComeBackFor";
import { StoriesTeaser } from "@/components/home/StoriesTeaser";
import { EmailLine } from "@/components/home/EmailLine";
import { EmptyKitchen } from "@/components/home/EmptyKitchen";
import { getPublishedRecipes, getRecipeOfTheWeek } from "@/lib/firebase/recipes";
import { getPublishedPosts } from "@/lib/firebase/lifestyle";
import { getSiteSettingsSafe } from "@/lib/firebase/siteSettings";
import { getPageContentSafe, currentlyIsEmpty } from "@/lib/firebase/pageContent";
import { nonEmptyCollections } from "@/lib/collections";
import { IS_PRODUCTION, postsOrFixtures, recipesOrFixtures } from "@/lib/content";
import type { Recipe, LifestylePost } from "@/types";

export const revalidate = 3600;

const byNewest = (a: Recipe, b: Recipe) =>
  new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();

export default async function HomePage() {
  const [rotwResult, recipesResult, postsResult, settings, content] = await Promise.all([
    Promise.allSettled([getRecipeOfTheWeek()]).then((r) => r[0]),
    Promise.allSettled([getPublishedRecipes({ limit: 100 })]).then((r) => r[0]),
    Promise.allSettled([getPublishedPosts()]).then((r) => r[0]),
    getSiteSettingsSafe(),
    getPageContentSafe(),
  ]);

  const realRecipes: Recipe[] = recipesResult.status === "fulfilled" ? recipesResult.value : [];
  if (recipesResult.status === "rejected") console.error("[home] recipes fetch failed:", recipesResult.reason);
  const recipes = recipesOrFixtures(realRecipes);
  const standingIn = realRecipes.length === 0;

  const realPosts: LifestylePost[] = postsResult.status === "fulfilled" ? postsResult.value : [];
  if (postsResult.status === "rejected") console.error("[home] stories fetch failed:", postsResult.reason);
  const posts = postsOrFixtures(realPosts);

  let featured: Recipe | null = null;
  if (!standingIn && rotwResult.status === "fulfilled" && rotwResult.value) featured = rotwResult.value;
  if (rotwResult.status === "rejected") console.error("[home] pinned recipe fetch failed:", rotwResult.reason);
  if (!featured) featured = [...recipes].sort(byNewest)[0] ?? null;

  const rest = recipes.filter((r) => r.slug !== featured?.slug);
  const latest = [...rest].sort(byNewest).slice(0, 3);
  const collections = nonEmptyCollections(
    recipes.filter((r) => !r.sample),
    settings.activeCollection
  );
  // Only with real data: at least 12 published recipes and real views
  const comeBackFor =
    realRecipes.length >= 12 && realRecipes.some((r) => r.viewCount > 0)
      ? [...realRecipes].sort((a, b) => b.viewCount - a.viewCount || b.rating.count - a.rating.count).slice(0, 4)
      : [];
  const showCurrently = !currentlyIsEmpty(content.currently);

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
      <KitchenTime />

      {standingIn && IS_PRODUCTION && <EmptyKitchen />}

      {featured && <Offering recipe={featured} note={settings.heroNote || featured.ruksNote || ""} intro={content.heroIntro} />}

      {latest.length > 0 ? (
        <NewOutOfTheOven recipes={latest} aside={showCurrently ? <CurrentlyCard currently={content.currently} /> : null} />
      ) : (
        showCurrently && (
          <section className="py-10 sm:py-14 max-w-md">
            <CurrentlyCard currently={content.currently} />
          </section>
        )
      )}

      {collections.length > 0 && <CollectionsRow rows={collections} />}

      {comeBackFor.length > 0 && <ComeBackFor recipes={comeBackFor} />}

      {posts.length > 0 && <StoriesTeaser posts={posts.slice(0, 3)} />}

      <EmailLine />
    </div>
  );
}
