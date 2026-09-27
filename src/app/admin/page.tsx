"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalRecipes: number;
  totalPosts: number;
  pendingComments: number;
  unreadMessages: number;
  subscribers: number;
}

interface RecipeSummary {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

interface CurrentlyForm {
  baking: string;
  craving: string;
  lastWalk: string;
  latestParcel: string;
}

const EMPTY_CURRENTLY: CurrentlyForm = { baking: "", craving: "", lastWalk: "", latestParcel: "" };
const CURRENTLY_MAX = 60;
const CURRENTLY_ROWS: Array<{ key: keyof CurrentlyForm; label: string }> = [
  { key: "baking", label: "Baking" },
  { key: "craving", label: "Craving" },
  { key: "lastWalk", label: "Last walk" },
  { key: "latestParcel", label: "Latest parcel" },
];

const STAT_CARDS = [
  { key: "totalRecipes", label: "Recipes", href: "/admin/recipes" },
  { key: "totalPosts", label: "Stories", href: "/admin/lifestyle" },
  { key: "pendingComments", label: "Comments waiting", href: "/admin/comments" },
  { key: "unreadMessages", label: "Unread messages", href: "/admin/messages" },
  { key: "subscribers", label: "On the email list", href: "/admin/subscribers" },
] as const;

const fieldClass =
  "w-full h-11 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] text-base sm:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currently, setCurrently] = useState<CurrentlyForm>(EMPTY_CURRENTLY);
  const [savingCurrently, setSavingCurrently] = useState(false);
  const [currentlyMessage, setCurrentlyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, recipesRes, pagesRes] = await Promise.all([adminFetch("/api/admin/stats"), adminFetch("/api/admin/recipes"), adminFetch("/api/admin/pages")]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (recipesRes.ok) {
          const all = await recipesRes.json();
          setRecipes(all.slice(0, 5));
        }
        if (pagesRes.ok) {
          const d = (await pagesRes.json()) as { currently?: Partial<CurrentlyForm> };
          setCurrently({
            baking: d.currently?.baking ?? "",
            craving: d.currently?.craving ?? "",
            lastWalk: d.currently?.lastWalk ?? "",
            latestParcel: d.currently?.latestParcel ?? "",
          });
        }
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveCurrently(e: React.FormEvent) {
    e.preventDefault();
    setSavingCurrently(true);
    setCurrentlyMessage(null);
    try {
      const res = await adminFetch("/api/admin/pages", { method: "PUT", body: JSON.stringify({ currently }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setCurrentlyMessage({ type: "error", text: data.error || "Could not save." });
      else setCurrentlyMessage({ type: "success", text: "Saved. It shows on the front page within a minute." });
    } catch {
      setCurrentlyMessage({ type: "error", text: "Could not save." });
    }
    setSavingCurrently(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">Hello Ruks.</p>
      </div>

      {/* Currently: the quickest thing to update, so it comes first */}
      <form onSubmit={saveCurrently} className="rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">Currently</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Four short lines on the front page. Empty ones stay hidden.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CURRENTLY_ROWS.map((row) => (
            <label key={row.key} className="block">
              <span className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">{row.label}</span>
              <input
                type="text"
                value={currently[row.key]}
                onChange={(e) => setCurrently((c) => ({ ...c, [row.key]: e.target.value.slice(0, CURRENTLY_MAX) }))}
                maxLength={CURRENTLY_MAX}
                disabled={loading}
                className={fieldClass}
              />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={savingCurrently || loading}
            className="h-11 px-5 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savingCurrently ? "Saving…" : "Save"}
          </button>
          {currentlyMessage && (
            <p className={`text-sm ${currentlyMessage.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`} aria-live="polite">
              {currentlyMessage.text}
            </p>
          )}
        </div>
      </form>

      {/* Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map((card) => (
          <Link key={card.key} href={card.href} className="block p-5 rounded-[var(--radius-lg)] bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
            <p className="text-sm text-[var(--color-text-secondary)]">{card.label}</p>
            <p className="text-3xl font-semibold mt-1 text-[var(--color-text-primary)]">{loading ? "…" : stats ? stats[card.key] : 0}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Add something</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/recipes/new" className="h-11 px-5 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            New bake
          </Link>
          <Link href="/admin/lifestyle/new" className="h-11 px-5 rounded-full border border-[var(--color-border)] text-sm font-medium inline-flex items-center gap-2 hover:bg-[var(--color-secondary)] transition-colors">
            New story
          </Link>
        </div>
      </div>

      {/* Recent recipes */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Recent recipes</h2>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">Loading…</div>
          ) : recipes.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">
              Nothing yet.{" "}
              <Link href="/admin/recipes/new" className="text-[var(--color-primary)] hover:underline">
                Add the first bake
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/admin/recipes/${recipe.id}/edit`} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-secondary)] transition-colors">
                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate mr-3">{recipe.title}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        recipe.status === "published" ? "bg-[var(--color-accent-soft)] text-[var(--color-text-primary)]" : "bg-[var(--color-secondary)] text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {recipe.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="hidden sm:block text-xs text-[var(--color-text-tertiary)]">{recipe.updatedAt ? formatDate(new Date(recipe.updatedAt)) : ""}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
