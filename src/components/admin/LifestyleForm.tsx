"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { rawContentUrl } from "@/lib/site";
import { adminFetch } from "@/lib/adminFetch";
import { slugify } from "@/lib/utils";
import { LIFESTYLE_CATEGORIES } from "@/lib/constants";
import type { LifestylePost } from "@/types";

interface LifestyleFormProps {
  post?: LifestylePost;
}

export function LifestyleForm({ post }: LifestyleFormProps) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) setSlug(slugify(value));
  };

  // Auto-calculate reading time (~200 words/min) from the visible text
  const plainText = content.replace(/<[^>]+>/g, " ").trim();
  const readingTime = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 200));

  const openPreview = async () => {
    try {
      const res = await adminFetch(`/api/admin/preview?type=post&slug=${encodeURIComponent(slug)}`);
      const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
      if (!res.ok || !data.path) throw new Error(data.error || "Could not create a preview link");
      window.open(data.path, "_blank", "noopener");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create a preview link");
    }
  };

  const handleSave = async (publishOverride?: "draft" | "published") => {
    const finalStatus = publishOverride || status;
    if (!title.trim()) { setError("Title is required"); return; }
    if (!plainText) { setError("Content is required"); return; }

    setError("");
    setSaving(true);

    const body = {
      title,
      slug,
      excerpt,
      coverImage,
      // photos inserted in the editor preview from raw GitHub; store the site path
      content: content.split(rawContentUrl("public")).join(""),
      category,
      readingTime,
      status: finalStatus,
    };

    try {
      const url = isEdit ? `/api/admin/lifestyle/${post.id}` : "/api/admin/lifestyle";
      const method = isEdit ? "PUT" : "POST";
      const res = await adminFetch(url, { method, body: JSON.stringify(body) });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to save");
      }
      router.push("/admin/lifestyle");
    } catch (e) {
      setError(e instanceof Error && e.message !== "Failed to save" ? e.message : "Failed to save post. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="p-3 rounded-[var(--radius-sm)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <Input label="Title" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" />
      <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" />
      <Textarea label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary..." />

      <ImageUpload label="Cover photo" value={coverImage} onChange={setCoverImage} folder="lifestyle" hint="Shown on the story cards and at the top of the post." />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
        >
          <option value="">Select category</option>
          {LIFESTYLE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <RichTextEditor
        label="Story"
        value={content}
        onChange={setContent}
        folder="lifestyle"
        placeholder="Write your story… Use the toolbar for headings, lists, links and photos."
      />

      <p className="text-xs text-[var(--color-text-tertiary)]">Estimated reading time: {readingTime} min</p>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={status === "published"}
            onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <span className="text-sm font-medium">Published</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="h-11 px-6 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave("published")}
          disabled={saving}
          className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update & Publish" : "Publish"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={openPreview}
            className="h-11 px-6 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors"
            title="Opens the saved version of this story in a new tab, even while it is a draft"
          >
            Preview
          </button>
        )}
        <button
          onClick={() => router.push("/admin/lifestyle")}
          className="h-11 px-6 rounded-[var(--radius-sm)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
