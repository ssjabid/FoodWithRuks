"use client";

import { useState } from "react";
import { useIsClient } from "@/hooks/useIsClient";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

const pillClass =
  "h-10 px-4 rounded-full text-sm font-medium border-[1.5px] border-[var(--color-line-strong)] text-[var(--color-text-2)] hover:border-[var(--color-cheek)] hover:text-[var(--color-cheek)] transition-colors inline-flex items-center";

/** Two quiet ways to pass a recipe on. */
export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isClient = useIsClient();
  const origin = isClient ? window.location.origin : "";
  const url = `${origin}/${slug}`.replace(/\/{2,}/g, "/").replace(":/", "://");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-wrap gap-2 share-buttons">
      <button type="button" onClick={copyLink} className={pillClass} aria-live="polite">
        {copied ? (
          <span key="copied" className="fade-in text-[var(--color-success)]">
            Copied
          </span>
        ) : (
          <span key="copy" className="fade-in">
            Copy link
          </span>
        )}
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={pillClass}>
        WhatsApp
      </a>
    </div>
  );
}
