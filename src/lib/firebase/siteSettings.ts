import { adminDb } from "./admin";
import { SOCIAL_LINKS } from "@/lib/site";
import { isCollectionSlug } from "@/lib/collections";
import type { SiteSettings } from "@/types";

const DOC_PATH = { collection: "siteSettings", id: "general" } as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  recipeOfTheWeekSlug: "",
  instagramHandle: SOCIAL_LINKS.instagram.handle,
  heroNote: "",
  activeCollection: "",
  showBakery: false,
};

/**
 * Reads siteSettings/general merged over defaults. Never throws on a missing doc.
 * Older documents may still carry palette-picker fields (defaultPalette, showThemePicker); they are ignored.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await adminDb.collection(DOC_PATH.collection).doc(DOC_PATH.id).get();
  if (!snap.exists) return { ...DEFAULT_SITE_SETTINGS };
  const data = snap.data() ?? {};
  return {
    recipeOfTheWeekSlug: typeof data.recipeOfTheWeekSlug === "string" ? data.recipeOfTheWeekSlug : "",
    instagramHandle:
      typeof data.instagramHandle === "string" && data.instagramHandle ? data.instagramHandle : DEFAULT_SITE_SETTINGS.instagramHandle,
    heroNote: typeof data.heroNote === "string" ? data.heroNote : "",
    activeCollection: isCollectionSlug(data.activeCollection) ? data.activeCollection : "",
    showBakery: data.showBakery === true,
    updatedAt: data.updatedAt?.toDate?.() ?? undefined,
  };
}

/** Same as getSiteSettings but never rejects, for the root layout. */
export async function getSiteSettingsSafe(): Promise<SiteSettings> {
  try {
    return await getSiteSettings();
  } catch (error) {
    console.error("[siteSettings] read failed, using defaults:", error);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function updateSiteSettings(data: Partial<Omit<SiteSettings, "updatedAt">>): Promise<void> {
  await adminDb
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.id)
    .set({ ...data, updatedAt: new Date() }, { merge: true });
}
