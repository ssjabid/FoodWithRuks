"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";
import { LifestyleForm } from "@/components/admin/LifestyleForm";
import type { LifestylePost } from "@/types";

export default function EditLifestylePostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<LifestylePost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch(`/api/admin/lifestyle/${id}`);
        if (res.ok) setPost(await res.json());
      } catch { /* silent */ }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) return <div className="text-center py-20 text-[var(--color-text-secondary)]">Post not found.</div>;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">Edit Post</h1>
      <LifestyleForm post={post} />
    </div>
  );
}
