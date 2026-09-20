import { getPublishedRecipes } from "@/lib/firebase/recipes";
import { getPublishedPosts } from "@/lib/firebase/lifestyle";
import { SAMPLE_RECIPES, SAMPLE_LIFESTYLE_POSTS } from "@/lib/sampleData";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of recipes and stories, newest first. */
export async function GET() {
  let recipes, posts;
  try {
    recipes = await getPublishedRecipes({ limit: 30 });
    if (recipes.length === 0) recipes = SAMPLE_RECIPES;
  } catch {
    recipes = SAMPLE_RECIPES;
  }
  try {
    posts = await getPublishedPosts();
    if (posts.length === 0) posts = SAMPLE_LIFESTYLE_POSTS;
  } catch {
    posts = SAMPLE_LIFESTYLE_POSTS;
  }

  const items = [
    ...recipes.map((r) => ({
      title: r.title,
      link: `${SITE_URL}/recipes/${r.slug}`,
      description: r.description,
      date: r.publishedAt ?? r.createdAt,
      category: "Recipe",
    })),
    ...posts.map((p) => ({
      title: p.title,
      link: `${SITE_URL}/lifestyle/${p.slug}`,
      description: p.excerpt,
      date: p.publishedAt ?? p.createdAt,
      category: "Story",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 40);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>en-gb</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${i.link}</link>
      <guid>${i.link}</guid>
      <category>${i.category}</category>
      <pubDate>${i.date.toUTCString()}</pubDate>
      <description>${esc(i.description)}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
