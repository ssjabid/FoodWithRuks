"use client";

import { useState } from "react";
import { useIsClient } from "@/hooks/useIsClient";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

const pillClass =
  "h-9 px-4 rounded-full text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors inline-flex items-center";

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isClient = useIsClient();
  const origin = isClient ? window.location.origin : "";
  const url = `${origin}/${slug}`.replace(/\/{2,}/g, "/").replace(":/", "://");
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

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
          <span key="copied" className="fade-in inline-flex items-center gap-1 text-[var(--color-success)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied
          </span>
        ) : (
          <span key="copy" className="fade-in">Copy link</span>
        )}
      </button>

      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" className={pillClass}>
        WhatsApp
      </a>
      <a href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className={pillClass}>
        Pinterest
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className={pillClass}>
        X / Twitter
      </a>
    </div>
  );
}
