import { revalidatePath } from "next/cache";
import { COLLECTIONS } from "@/lib/collections";

/** Every public path that can change when a recipe is written. */
export function revalidateRecipes(...slugs: (string | undefined)[]) {
  for (const p of ["/", "/recipes", "/bakes", "/cooking", "/sitemap.xml", "/feed.xml"]) revalidatePath(p);
  for (const c of COLLECTIONS) revalidatePath(`/collections/${c.slug}`);
  for (const slug of slugs) if (slug) revalidatePath(`/recipes/${slug}`);
  revalidatePath("/", "layout"); // the Cooking nav item appears/disappears with the first cooking recipe
}

export function revalidatePosts(...slugs: (string | undefined)[]) {
  for (const p of ["/", "/lifestyle", "/sitemap.xml", "/feed.xml"]) revalidatePath(p);
  for (const slug of slugs) if (slug) revalidatePath(`/lifestyle/${slug}`);
}

/** Settings and page copy touch the layout (header/footer) and the home page. */
export function revalidateSiteCopy() {
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/bakery");
}
