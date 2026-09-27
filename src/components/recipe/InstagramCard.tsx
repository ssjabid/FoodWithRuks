"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { Skeleton } from "@/components/ui/Skeleton";

const InstagramEmbed = dynamic(() => import("@/components/recipe/InstagramEmbed").then((m) => m.InstagramEmbed), {
  ssr: false,
  loading: () => <Skeleton className="mx-auto h-[480px] w-full max-w-[328px] rounded-[var(--radius-lg)]" />,
});

/** The heavy Instagram script loads only when someone asks for it. */
export function InstagramCard({ url }: { url: string }) {
  const [load, setLoad] = useState(false);
  if (load) return <InstagramEmbed url={url} />;
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-line-strong)] px-4 py-4 flex flex-wrap items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-[var(--color-text-2)]">
        <InstagramIcon className="w-5 h-5" />
        There is a reel of this one.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLoad(true)}
          className="h-10 px-4 rounded-full bg-[var(--color-cheek)] text-[var(--color-on-cheek)] text-sm font-medium hover:bg-[var(--color-cheek-hover)] transition-colors"
        >
          Watch it here
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-full border-[1.5px] border-[var(--color-line-strong)] text-sm font-medium inline-flex items-center hover:border-[var(--color-cheek)] transition-colors">
          Open Instagram
        </a>
      </div>
    </div>
  );
}
