"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import { SOCIAL_LINKS } from "@/lib/site";
import { DEFAULT_PALETTE, PALETTES, PALETTE_IDS, type PaletteId } from "@/lib/theme";

interface RecipeOption {
  id: string;
  title: string;
  slug: string;
  status: string;
}

const fieldClass =
  "w-full h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]";

export default function AdminSettingsPage() {
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [recipeOfTheWeekSlug, setRecipeOfTheWeekSlug] = useState("");
  const [instagramHandle, setInstagramHandle] = useState<string>(SOCIAL_LINKS.instagram.handle);
  const [defaultPalette, setDefaultPalette] = useState<PaletteId>(DEFAULT_PALETTE);
  const [showThemePicker, setShowThemePicker] = useState(true);
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
          setInstagramHandle(s.instagramHandle ?? SOCIAL_LINKS.instagram.handle);
          setDefaultPalette(s.defaultPalette ?? DEFAULT_PALETTE);
          setShowThemePicker(s.showThemePicker ?? true);
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
        body: JSON.stringify({ recipeOfTheWeekSlug, instagramHandle, defaultPalette, showThemePicker }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not save settings." });
      } else {
        setMessage({ type: "success", text: "Saved. The site will update within a minute." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not save settings." });
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Site Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Home page highlights, appearance and social links.</p>
      </div>

      <form onSubmit={save} className="space-y-8 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <fieldset className="space-y-6">
          <legend className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">Appearance</legend>

          <div className="space-y-1.5">
            <label htmlFor="palette" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Default palette
            </label>
            <select
              id="palette"
              value={defaultPalette}
              onChange={(e) => setDefaultPalette(e.target.value as PaletteId)}
              disabled={loading}
              className={fieldClass}
            >
              {PALETTE_IDS.map((id) => (
                <option key={id} value={id}>
                  {PALETTES[id].label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-text-tertiary)]">{PALETTES[defaultPalette].description}</p>
            <div className="flex gap-2 pt-1" aria-hidden="true">
              {PALETTES[defaultPalette].preview.light.map((c, i) => (
                <span key={i} className="w-6 h-6 rounded-full border border-[var(--color-border)]" style={{ background: c }} />
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showThemePicker}
              onChange={(e) => setShowThemePicker(e.target.checked)}
              disabled={loading}
              className="mt-1 size-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block text-sm font-medium text-[var(--color-text-primary)]">Show the theme picker to visitors</span>
              <span className="block text-xs text-[var(--color-text-tertiary)]">
                Adds an &ldquo;Appearance&rdquo; section to the menu so visitors can try each palette. Turn off once you have settled on one.
                Visitors who already chose a palette keep it.
              </span>
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">Home page</legend>

          <div className="space-y-1.5">
            <label htmlFor="rotw" className="block text-sm font-medium text-[var(--color-text-primary)]">
              New this week (featured recipe)
            </label>
            <select id="rotw" value={recipeOfTheWeekSlug} onChange={(e) => setRecipeOfTheWeekSlug(e.target.value)} disabled={loading} className={fieldClass}>
              <option value="">Latest published recipe (automatic)</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-text-tertiary)]">Pins a recipe beside the home page headline. Leave on automatic to always show the newest one.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ig" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Instagram handle
            </label>
            <input
              id="ig"
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              disabled={loading}
              placeholder="@yourhandle"
              className={fieldClass}
            />
            <p className="text-xs text-[var(--color-text-tertiary)]">Stored for reference. Public links use the handle in the site config until a redeploy picks this up.</p>
          </div>
        </fieldset>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`} aria-live="polite">
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || loading}
          className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
