"use client";

import { InstagramEmbed as Embed } from "react-social-media-embed";

const INSTAGRAM_URL = /^https:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/[\w-]+\/?/i;

export function isInstagramUrl(url?: string | null): url is string {
  return !!url && INSTAGRAM_URL.test(url.trim());
}

interface InstagramEmbedProps {
  url: string;
  className?: string;
}

/** Instagram post / reel embed. Load with `dynamic(..., { ssr: false })` — the embed touches `window`. */
export function InstagramEmbed({ url, className }: InstagramEmbedProps) {
  return (
    <div className={className}>
      <div className="flex justify-center rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <Embed url={url.trim()} width={328} captioned={false} />
      </div>
    </div>
  );
}
