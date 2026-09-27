import type { BadgeId } from "@/lib/constants";
import type { Recipe } from "@/types";

/**
 * Collections are filters over the cached published list (the same
 * getPublishedRecipes({ limit: 100 }) call the home page makes), so they
 * need no new Firestore queries or indexes. Empty ones are never linked.
 */

export type CollectionRule = { badge: BadgeId } | { occasion: string } | { category: string };

export interface Collection {
  slug: string;
  title: string;
  /** One or two sentences under the title. DRAFT: needs Ruks */
  intro: string;
  rule: CollectionRule;
  /** Seasonal collections are led with on the home page when picked in admin settings */
  seasonal?: boolean;
  /** Uses the sage accent (outdoor content) */
  sage?: boolean;
  /** Extra practical tips shown under the intro. DRAFT: needs Ruks */
  tips?: { title: string; items: string[] };
}

// DRAFT: needs Ruks (every intro and tip below)
export const COLLECTIONS: readonly Collection[] = [
  {
    slug: "care-packages",
    title: "Care packages",
    intro: "Bakes that post well, pack well and arrive in one piece. For sending to someone who needs one.",
    rule: { badge: "travels-well" },
    tips: {
      title: "How to pack a tin",
      items: [
        "Let everything cool completely first, or the steam softens the lot.",
        "Baking paper between the layers.",
        "A tin, not a box. Cardboard gives; a tin does not.",
        "Sturdy bakes post best: cookies, brownies, biscuits, a loaf.",
        "Soft-set things (custards, cheesecakes, anything with fresh cream) stay at home.",
      ],
    },
  },
  { slug: "first-tries", title: "First tries", intro: "First attempts, published as they happened. Some worked first time. Some took three goes.", rule: { badge: "first-try" } },
  { slug: "trail-tested", title: "Trail-tested", intro: "Bakes that have survived a rucksack, a hill and a picnic on a damp rock.", rule: { badge: "trail-tested" }, sage: true },
  { slug: "little-helpers", title: "Little helpers", intro: "Good to make with a small child. Nothing sharp, nothing fiddly, plenty to stir.", rule: { badge: "little-helpers" } },
  { slug: "make-ahead", title: "Make ahead", intro: "Better the next day, or happy in the freezer until you need them.", rule: { badge: "make-ahead" } },
  { slug: "taste-testers-picks", title: "The taste-tester's picks", intro: "The ones the taste-tester asks for again.", rule: { badge: "taste-testers-pick" } },
  { slug: "ramadan", title: "Ramadan", intro: "For iftar tables and the tins that get passed around.", rule: { occasion: "ramadan" }, seasonal: true },
  { slug: "eid", title: "Eid", intro: "What goes in the Eid tin.", rule: { occasion: "eid" }, seasonal: true },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function isCollectionSlug(value: unknown): value is string {
  return typeof value === "string" && COLLECTIONS.some((c) => c.slug === value);
}

export function matchesCollection(recipe: Recipe, collection: Collection): boolean {
  const rule = collection.rule;
  if ("badge" in rule) return (recipe.badges as string[]).includes(rule.badge);
  if ("occasion" in rule) return (recipe.specialOccasion as string[]).includes(rule.occasion);
  return (recipe.category as string[]).includes(rule.category);
}

export function recipesInCollection(recipes: Recipe[], collection: Collection): Recipe[] {
  return recipes.filter((r) => matchesCollection(r, collection));
}

/** Collections with at least one recipe, the active (seasonal) one first. */
export function nonEmptyCollections(recipes: Recipe[], activeSlug = ""): Array<{ collection: Collection; recipes: Recipe[] }> {
  const rows = COLLECTIONS.map((collection) => ({ collection, recipes: recipesInCollection(recipes, collection) })).filter((row) => row.recipes.length > 0);
  if (!activeSlug) return rows;
  return [...rows.filter((r) => r.collection.slug === activeSlug), ...rows.filter((r) => r.collection.slug !== activeSlug)];
}
