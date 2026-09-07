"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import type { LifestylePost } from "@/types";

export default function AdminLifestylePage() {
  const [posts, setPosts] = useState<LifestylePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/lifestyle");
      if (res.ok) setPosts(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await adminFetch(`/api/admin/lifestyle/${deleteId}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch { /* silent */ }
    setDeleteId(null);
  }

  const filtered = posts.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Lifestyle Posts</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{posts.length} total</p>
        </div>
        <Link
          href="/admin/lifestyle/new"
          className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      <div className="flex gap-3">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Title</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)] hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Status</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)] hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((post, i) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-[var(--color-secondary)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{post.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[var(--color-text-secondary)]">{post.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden md:table-cell">
                      {post.updatedAt ? formatDate(new Date(post.updatedAt)) : ""}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/lifestyle/${post.id}/edit`} className="text-[var(--color-primary)] hover:underline">Edit</Link>
                        <button onClick={() => setDeleteId(post.id)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Post">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Are you sure? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="h-9 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors">Cancel</button>
          <button onClick={handleDelete} className="h-9 px-4 rounded-[var(--radius-sm)] bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
