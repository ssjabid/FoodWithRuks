"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import { SOCIAL_LINKS } from "@/lib/site";
import { COLLECTIONS } from "@/lib/collections";

interface RecipeOption {
  id: string;
  title: string;
  slug: string;
  status: string;
}

const HERO_NOTE_MAX = 80;

const fieldClass =
  "w-full h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]";
const labelClass = "block text-sm font-medium text-[var(--color-text-primary)]";
const hintClass = "text-xs text-[var(--color-text-tertiary)]";

export default function AdminSettingsPage() {
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [recipeOfTheWeekSlug, setRecipeOfTheWeekSlug] = useState("");
  const [heroNote, setHeroNote] = useState("");
  const [activeCollection, setActiveCollection] = useState("");
  const [instagramHandle, setInstagramHandle] = useState<string>(SOCIAL_LINKS.instagram.handle);
  const [showBakery, setShowBakery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, recipesRes] = await Promise.all([adminFetch("/api/admin/settings"), adminFetch("/api/admin/recipes")]);
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setRecipeOfTheWeekSlug(s.recipeOfTheWeekSlug ?? "");
          setHeroNote(s.heroNote ?? "");
          setActiveCollection(s.activeCollection ?? "");
          setInstagramHandle(s.instagramHandle ?? SOCIAL_LINKS.instagram.handle);
          setShowBakery(Boolean(s.showBakery));
        }
        if (recipesRes.ok) {
          const all: RecipeOption[] = await recipesRes.json();
          setRecipes(all.filter((r) => r.status === "published"));
        }
      } catch {
        /* silent */
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ recipeOfTheWeekSlug, instagramHandle, heroNote, activeCollection, showBakery }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not save settings." });
      } else {
        setMessage({ type: "success", text: "Saved. The site updates within a minute." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not save settings." });
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Site settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">What the front page leads with, and a couple of switches.</p>
      </div>

      <form onSubmit={save} className="space-y-8 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <fieldset className="space-y-6">
          <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Front page</legend>

          <div className="space-y-1.5">
            <label htmlFor="rotw" className={labelClass}>
              The bake on the front page
            </label>
            <select id="rotw" value={recipeOfTheWeekSlug} onChange={(e) => setRecipeOfTheWeekSlug(e.target.value)} disabled={loading} className={fieldClass}>
              <option value="">The newest published bake (automatic)</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.title}
                </option>
              ))}
            </select>
            <p className={hintClass}>The first thing visitors see. Leave on automatic and it is always your latest.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="heroNote" className={labelClass}>
              Your line under it
            </label>
            <input
              id="heroNote"
              type="text"
              value={heroNote}
              onChange={(e) => setHeroNote(e.target.value.slice(0, HERO_NOTE_MAX))}
              disabled={loading}
              maxLength={HERO_NOTE_MAX}
              placeholder="made these for you x"
              className={fieldClass}
            />
            <p className={hintClass}>
              Shown in your handwriting next to the bake. Short is best. {heroNote.length}/{HERO_NOTE_MAX}. Empty means the bake&apos;s own note is used.
            </p>
            {heroNote && (
              <p className="note text-[var(--color-text-secondary)] pt-1" aria-hidden="true">
                {heroNote}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="collection" className={labelClass}>
              Lead with a collection
            </label>
            <select id="collection" value={activeCollection} onChange={(e) => setActiveCollection(e.target.value)} disabled={loading} className={fieldClass}>
              <option value="">None (collections in their usual order)</option>
              {COLLECTIONS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                  {c.seasonal ? " (seasonal)" : ""}
                </option>
              ))}
            </select>
            <p className={hintClass}>Puts one collection first on the front page, for Ramadan or Eid say. It only shows once it has a bake in it.</p>
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Elsewhere</legend>

          <div className="space-y-1.5">
            <label htmlFor="ig" className={labelClass}>
              Instagram handle
            </label>
            <input id="ig" type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} disabled={loading} placeholder="@yourhandle" className={fieldClass} />
            <p className={hintClass}>Stored for reference. The public links use the handle in the site config until a redeploy picks this up.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={showBakery} onChange={(e) => setShowBakery(e.target.checked)} disabled={loading} className="mt-1 size-5 accent-[var(--color-primary)]" />
            <span>
              <span className={labelClass}>Show the someday bakery page</span>
              <span className={hintClass}>
                A hidden page at /bakery with a waiting list. Search engines are told to ignore it. Off means the address returns a 404.
              </span>
            </span>
          </label>
        </fieldset>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`} aria-live="polite">
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || loading}
          className="h-12 px-6 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
