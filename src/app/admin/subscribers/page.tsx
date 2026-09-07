"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import type { Subscriber } from "@/types";

const SOURCE_LABEL: Record<Subscriber["source"], string> = {
  home: "Home page",
  footer: "Footer",
  "newsletter-page": "Newsletter page",
};

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/subscribers");
      if (res.ok) setSubscribers(await res.json());
    } catch {
      /* silent */
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await adminFetch(`/api/admin/subscribers/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
      setSubscribers((prev) => prev.filter((s) => s.id !== deleteId));
    } catch {
      /* silent */
    }
    setDeleteId(null);
  }

  // A plain <a download> can't carry the Bearer token, so fetch the CSV and hand it over as a blob.
  async function exportCsv() {
    setExporting(true);
    try {
      const res = await adminFetch("/api/admin/subscribers?format=csv");
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    }
    setExporting(false);
  }

  const visible = subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
  const active = subscribers.filter((s) => s.status === "subscribed").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {active} subscribed{subscribers.length !== active ? ` · ${subscribers.length - active} unsubscribed` : ""}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting || subscribers.length === 0}
          className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <input
        type="search"
        placeholder="Search by email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:max-w-sm h-10 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
      />

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
            {subscribers.length === 0 ? "No subscribers yet." : "No matches."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface)] text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Email</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)] hidden sm:table-cell">Source</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)] hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {visible.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i, 20) * 0.02 }}
                  >
                    <td className="px-4 py-3 text-[var(--color-text-primary)] break-all">{s.email}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden sm:table-cell">{SOURCE_LABEL[s.source] ?? s.source}</td>
                    <td className="px-4 py-3 text-[var(--color-text-tertiary)] hidden md:table-cell">
                      {s.createdAt ? formatDate(new Date(s.createdAt)) : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.status === "subscribed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="h-8 px-3 rounded-[var(--radius-sm)] border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Remove subscriber">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          This removes <span className="font-medium text-[var(--color-text-primary)]">{deleteId}</span> from the list. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="h-9 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors">Cancel</button>
          <button onClick={handleDelete} className="h-9 px-4 rounded-[var(--radius-sm)] bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
