"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import { SOCIAL_LINKS } from "@/lib/site";

interface RecipeOption {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function AdminSettingsPage() {
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [recipeOfTheWeekSlug, setRecipeOfTheWeekSlug] = useState("");
  const [instagramHandle, setInstagramHandle] = useState<string>(SOCIAL_LINKS.instagram.handle);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, recipesRes] = await Promise.all([
          adminFetch("/api/admin/settings"),
          adminFetch("/api/admin/recipes"),
        ]);
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setRecipeOfTheWeekSlug(s.recipeOfTheWeekSlug ?? "");
          setInstagramHandle(s.instagramHandle ?? SOCIAL_LINKS.instagram.handle);
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
        body: JSON.stringify({ recipeOfTheWeekSlug, instagramHandle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not save settings." });
      } else {
        setMessage({ type: "success", text: "Saved. The home page will update shortly." });
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
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Home page highlights and social links.</p>
      </div>

      <form onSubmit={save} className="space-y-6 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <div className="space-y-1.5">
          <label htmlFor="rotw" className="block text-sm font-medium text-[var(--color-text-primary)]">
            New Recipe of the Week
          </label>
          <select
            id="rotw"
            value={recipeOfTheWeekSlug}
            onChange={(e) => setRecipeOfTheWeekSlug(e.target.value)}
            disabled={loading}
            className="w-full h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
          >
            <option value="">Latest published recipe (automatic)</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.slug}>
                {r.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Pins a recipe to the top of the home page. Leave on automatic to always show the newest one.
          </p>
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
            className="w-full h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          />
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Stored for reference. The public links use the handle in the site config until a redeploy picks this up.
          </p>
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`} aria-live="polite">
            {message.text}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || loading}
            className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
