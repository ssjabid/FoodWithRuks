"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalRecipes: number;
  totalPosts: number;
  pendingComments: number;
  unreadMessages: number;
}

interface RecipeSummary {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

const STAT_CARDS = [
  { key: "totalRecipes", label: "Total Recipes", color: "text-[var(--color-primary)]", href: "/admin/recipes" },
  { key: "totalPosts", label: "Total Posts", color: "text-blue-600 dark:text-blue-400", href: "/admin/lifestyle" },
  { key: "pendingComments", label: "Pending Comments", color: "text-amber-600 dark:text-amber-400", href: "/admin/comments" },
  { key: "unreadMessages", label: "Unread Messages", color: "text-rose-600 dark:text-rose-400", href: "/admin/messages" },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, recipesRes] = await Promise.all([
          adminFetch("/api/admin/stats"),
          adminFetch("/api/admin/recipes"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (recipesRes.ok) {
          const all = await recipesRes.json();
          setRecipes(all.slice(0, 5));
        }
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">Welcome back to FoodWithRuks Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
          >
            <Link
              href={card.href}
              className="block p-5 rounded-[var(--radius-lg)] bg-[var(--color-elevated)] border border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <p className="text-sm text-[var(--color-text-secondary)]">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                {loading ? "—" : stats ? stats[card.key as keyof Stats] : 0}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/recipes/new"
            className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Recipe
          </Link>
          <Link
            href="/admin/lifestyle/new"
            className="h-9 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-medium inline-flex items-center gap-2 hover:bg-[var(--color-secondary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>
      </div>

      {/* Recent recipes */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-3">Recent Recipes</h2>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">Loading...</div>
          ) : recipes.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">
              No recipes yet.{" "}
              <Link href="/admin/recipes/new" className="text-[var(--color-primary)] hover:underline">
                Create your first recipe
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/admin/recipes/${recipe.id}/edit`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-secondary)] transition-colors"
                >
                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate mr-3">{recipe.title}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        recipe.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {recipe.status}
                    </span>
                    <span className="hidden sm:block text-xs text-[var(--color-text-tertiary)]">
                      {recipe.updatedAt ? formatDate(new Date(recipe.updatedAt)) : ""}
                    </span>
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
