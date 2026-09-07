"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import type { ContactMessage } from "@/types";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/messages");
      if (res.ok) setMessages(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  async function toggleRead(id: string, currentRead: boolean) {
    try {
      await adminFetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        body: JSON.stringify({ read: !currentRead }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m)));
    } catch { /* silent */ }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await adminFetch(`/api/admin/messages/${deleteId}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== deleteId));
    } catch { /* silent */ }
    setDeleteId(null);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {messages.filter((m) => !m.read).length} unread
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">No messages yet.</div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-[var(--radius-lg)] border bg-[var(--color-elevated)] overflow-hidden ${
                msg.read ? "border-[var(--color-border)]" : "border-[var(--color-primary)]/30"
              }`}
            >
              <button
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-[var(--color-secondary)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${msg.read ? "text-[var(--color-text-secondary)]" : "font-medium text-[var(--color-text-primary)]"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                      {msg.name} &middot; {msg.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[var(--color-text-tertiary)] flex-shrink-0">
                  {msg.createdAt ? formatDate(new Date(msg.createdAt)) : ""}
                </span>
              </button>

              <AnimatePresence>
                {expandedId === msg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-text-primary)] mt-3 whitespace-pre-wrap">{msg.message}</p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => toggleRead(msg.id, msg.read)}
                          className="h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-secondary)] transition-colors"
                        >
                          Mark as {msg.read ? "unread" : "read"}
                        </button>
                        <button
                          onClick={() => setDeleteId(msg.id)}
                          className="h-8 px-3 rounded-[var(--radius-sm)] border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Message">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Are you sure? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="h-9 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors">Cancel</button>
          <button onClick={handleDelete} className="h-9 px-4 rounded-[var(--radius-sm)] bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
