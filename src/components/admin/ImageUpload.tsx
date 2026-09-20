"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/adminFetch";
import { PHOTO_WIDTHS, prepareVariants } from "@/lib/imageResize";
import { rawContentUrl } from "@/lib/site";

type Status = "idle" | "preparing" | "uploading" | "done" | "error";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Sub-folder in public/images/uploads */
  folder: "recipes" | "lifestyle" | "steps" | "misc";
  /** Smaller layout for per-step photos */
  compact?: boolean;
  hint?: string;
}

/**
 * Photo field for the admin forms. The browser shrinks the photo, the API commits
 * it to the GitHub repo, and the public URL is stored on the document. A pasted
 * link still works for photos hosted elsewhere.
 */
export function ImageUpload({ label, value, onChange, folder, compact = false, hint }: ImageUploadProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const busy = status === "preparing" || status === "uploading";
  // Freshly committed photos are not on the site until the next deploy finishes;
  // the raw GitHub URL shows them immediately.
  const shown = preview ?? (value.startsWith("/images/") ? rawContentUrl(`public${value}`) : value);

  const handleFile = async (file: File) => {
    setMessage("");
    try {
      setStatus("preparing");
      const variants = await prepareVariants(file);
      setPreview(variants[0].dataUrl);
      setStatus("uploading");
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          folder,
          variants: variants.map((v, i) => ({ width: PHOTO_WIDTHS[i], dataUrl: v.dataUrl })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; preview?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      if (data.preview) setPreview(data.preview);
      setStatus("done");
      setMessage("Saved. It appears on the live site in about two minutes.");
    } catch (error) {
      setStatus("error");
      setPreview(null);
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clear = () => {
    onChange("");
    setPreview(null);
    setStatus("idle");
    setMessage("");
  };

  const thumb = compact ? "w-16 h-16" : "w-32 h-32 sm:w-40 sm:h-40";

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
      <div className="flex gap-4 items-start">
        <div
          className={cn(
            "shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center",
            thumb
          )}
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className={cn("h-full w-full object-cover", busy && "opacity-60")} />
          ) : (
            <svg className="w-6 h-6 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16l5-5 4 4 3-3 6 6" />
              <circle cx="16" cy="9" r="1.5" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={inputId}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3.5 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] transition-colors",
                busy && "pointer-events-none opacity-60"
              )}
            >
              {busy ? (status === "preparing" ? "Preparing…" : "Uploading…") : value ? "Replace photo" : "Choose photo"}
            </label>
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            {value && (
              <button
                type="button"
                onClick={clear}
                className="h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-secondary)] transition-colors"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrl((s) => !s)}
              className="h-9 px-2 text-sm text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-text-primary)]"
            >
              {showUrl ? "Hide link field" : "Paste a link instead"}
            </button>
          </div>

          {showUrl && (
            <input
              type="url"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setPreview(null);
              }}
              placeholder="https://..."
              className="field w-full h-10 px-3 rounded-[var(--radius-sm)] text-base sm:text-sm"
            />
          )}

          {(message || hint) && (
            <p
              className={cn(
                "text-xs",
                status === "error" ? "text-[var(--color-error)]" : status === "done" ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"
              )}
              aria-live="polite"
            >
              {message || hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
