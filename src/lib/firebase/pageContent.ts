import { adminDb } from "./admin";
import type { Currently, PageContent } from "@/types";

/**
 * Editable copy for the fixed pages (About, home intro, footer blurb) and the
 * Currently card. Stored in siteSettings/pages. The defaults are minimal and
 * true; the words are hers to write in /admin/pages.
 */

const DOC = { collection: "siteSettings", id: "pages" } as const;

export const EMPTY_CURRENTLY: Currently = { baking: "", craving: "", lastWalk: "", latestParcel: "" };

// DRAFT: needs Ruks (aboutTitle, aboutBody)
export const DEFAULT_PAGE_CONTENT: PageContent = {
  heroIntro: "",
  footerBlurb: "",
  aboutTitle: "About Ruks",
  aboutSubtitle: "",
  aboutBody: "<p>Ruks bakes. This is where the recipes live, written the way she makes them.</p><p>More from her here soon.</p>",
  aboutPhoto: "",
  aboutPhotoAlt: "",
  currently: { ...EMPTY_CURRENTLY },
};

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);

export function currentlyFrom(raw: unknown): Currently {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const updatedAt = (d.updatedAt as { toDate?: () => Date } | undefined)?.toDate?.();
  return {
    baking: str(d.baking, ""),
    craving: str(d.craving, ""),
    lastWalk: str(d.lastWalk, ""),
    latestParcel: str(d.latestParcel, ""),
    updatedAt: updatedAt instanceof Date ? updatedAt : d.updatedAt instanceof Date ? d.updatedAt : undefined,
  };
}

export function currentlyIsEmpty(c: Currently): boolean {
  return !c.baking && !c.craving && !c.lastWalk && !c.latestParcel;
}

export async function getPageContent(): Promise<PageContent> {
  const snap = await adminDb.collection(DOC.collection).doc(DOC.id).get();
  if (!snap.exists) return { ...DEFAULT_PAGE_CONTENT, currently: { ...EMPTY_CURRENTLY } };
  const d = snap.data() ?? {};
  const D = DEFAULT_PAGE_CONTENT;
  return {
    heroIntro: str(d.heroIntro, D.heroIntro),
    footerBlurb: str(d.footerBlurb, D.footerBlurb),
    aboutTitle: str(d.aboutTitle, D.aboutTitle),
    aboutSubtitle: str(d.aboutSubtitle, D.aboutSubtitle),
    aboutBody: str(d.aboutBody, D.aboutBody),
    aboutPhoto: str(d.aboutPhoto, D.aboutPhoto),
    aboutPhotoAlt: str(d.aboutPhotoAlt, D.aboutPhotoAlt),
    currently: currentlyFrom(d.currently),
    updatedAt: d.updatedAt?.toDate?.() ?? undefined,
  };
}

/** Never rejects: for the layout, home and About page. */
export async function getPageContentSafe(): Promise<PageContent> {
  try {
    return await getPageContent();
  } catch (error) {
    console.error("[pageContent] read failed, using defaults:", error);
    return { ...DEFAULT_PAGE_CONTENT, currently: { ...EMPTY_CURRENTLY } };
  }
}

export async function updatePageContent(data: Partial<Omit<PageContent, "updatedAt" | "currently">> & { currently?: Omit<Currently, "updatedAt"> }): Promise<void> {
  const payload: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.currently) payload.currently = { ...data.currently, updatedAt: new Date() };
  await adminDb.collection(DOC.collection).doc(DOC.id).set(payload, { merge: true });
}
