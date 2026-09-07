"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import type { Comment } from "@/types";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/comments");
      if (res.ok) setComments(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  async function handleApprove(id: string) {
    try {
      await adminFetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "approved" }),
      });
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c)));
    } catch { /* silent */ }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await adminFetch(`/api/admin/comments/${deleteId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== deleteId));
    } catch { /* silent */ }
    setDeleteId(null);
  }

  const filtered = comments.filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Comments</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {comments.filter((c) => c.status === "pending").length} pending
        </p>
      </div>

      <div className="flex gap-3">
        {(["pending", "approved", "all"] as const).map((f) => (
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

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">No comments found.</div>
        ) : (
          filtered.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-medium text-[var(--color-primary)]">{comment.recipeSlug}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {comment.createdAt ? formatDate(new Date(comment.createdAt)) : ""}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg key={j} className={`w-3 h-3 ${j < comment.rating ? "text-amber-400" : "text-[var(--color-border)]"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)]">{comment.text}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {comment.status === "pending" && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="h-8 px-3 rounded-[var(--radius-sm)] bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteId(comment.id)}
                    className="h-8 px-3 rounded-[var(--radius-sm)] border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Comment">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Are you sure? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="h-9 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors">Cancel</button>
          <button onClick={handleDelete} className="h-9 px-4 rounded-[var(--radius-sm)] bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
