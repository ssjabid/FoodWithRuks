import { adminDb } from "./admin";
import { SITE_NAME, TAGLINE_SECONDARY } from "@/lib/site";
import type { PageContent } from "@/types";

/**
 * Editable copy for the fixed pages (home intro, footer blurb, About page).
 * Stored in siteSettings/pages; the defaults below are the original hardcoded
 * copy, so the site reads the same until Ruks edits it in /admin/pages.
 */

const DOC = { collection: "siteSettings", id: "pages" } as const;

export const DEFAULT_PAGE_CONTENT: PageContent = {
  heroIntro: `Wholesome, easy-to-follow recipes and family life from ${SITE_NAME}.`,
  footerBlurb: `${TAGLINE_SECONDARY}. Wholesome, easy-to-follow recipes and family life, shared with love.`,
  aboutTitle: "Hi, I'm Ruks!",
  aboutSubtitle: `The home cook behind ${SITE_NAME}`,
  aboutBody: [
    `<p>Welcome to ${SITE_NAME}, my little corner of the internet where food meets love. Agooh is our little one, and most of what you will find here has been tested on a very honest audience of one before it ever reaches you.</p>`,
    `<p>My cooking journey started in my family's kitchen, watching my mum create magic with simple ingredients. Every dish had a story, every spice had a purpose, and every meal brought the family together.</p>`,
    `<p>Today I share those recipes with the same energy: food that is easy to follow, wholesome, and full of flavour. Pure comfort, cooked simply. Nothing complicated, nothing you cannot find in a normal supermarket, and always enough for seconds.</p>`,
    `<p>Beyond the kitchen you will find our days out, the places we love to eat, our travels with a toddler in tow, and the crafts that keep rainy afternoons cheerful. Thank you for being here. ${TAGLINE_SECONDARY}.</p>`,
  ].join("\n"),
  aboutPhoto: "",
};

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);

export async function getPageContent(): Promise<PageContent> {
  const snap = await adminDb.collection(DOC.collection).doc(DOC.id).get();
  if (!snap.exists) return { ...DEFAULT_PAGE_CONTENT };
  const d = snap.data() ?? {};
  const D = DEFAULT_PAGE_CONTENT;
  return {
    heroIntro: str(d.heroIntro, D.heroIntro),
    footerBlurb: str(d.footerBlurb, D.footerBlurb),
    aboutTitle: str(d.aboutTitle, D.aboutTitle),
    aboutSubtitle: str(d.aboutSubtitle, D.aboutSubtitle),
    aboutBody: str(d.aboutBody, D.aboutBody),
    aboutPhoto: str(d.aboutPhoto, D.aboutPhoto),
    updatedAt: d.updatedAt?.toDate?.() ?? undefined,
  };
}

/** Never rejects — for the layout, home and About page. */
export async function getPageContentSafe(): Promise<PageContent> {
  try {
    return await getPageContent();
  } catch (error) {
    console.error("[pageContent] read failed, using defaults:", error);
    return { ...DEFAULT_PAGE_CONTENT };
  }
}

export async function updatePageContent(data: Partial<Omit<PageContent, "updatedAt">>): Promise<void> {
  await adminDb.collection(DOC.collection).doc(DOC.id).set({ ...data, updatedAt: new Date() }, { merge: true });
}
