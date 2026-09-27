"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { getFavorites, onFavoritesChange, toggleFavorite } from "@/lib/favorites";
import { Mark } from "@/components/brand/Mark";

interface SaveButtonProps {
  slug: string;
  className?: string;
  /** Icon-only for tight spots */
  compact?: boolean;
}

const subscribe = (cb: () => void) => onFavoritesChange(cb);
const getSnapshot = () => getFavorites().join(",");
const getServerSnapshot = () => "";

/**
 * Save = the squish. The mark's eyes close into a smile and the cheeks warm when a
 * recipe is saved (within 400ms; reduced motion swaps instantly). Saved recipes stay
 * in this browser (localStorage `ar_favorites`, kept for compatibility).
 */
export function SaveButton({ slug, className, compact = false }: SaveButtonProps) {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const saved = favorites.split(",").includes(slug);
  const [justToggled, setJustToggled] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const onClick = () => {
    toggleFavorite(slug);
    setJustToggled(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustToggled(false), 450);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Saved. Tap to remove from your saved recipes" : "Save this recipe"}
      data-squish={justToggled ? "1" : undefined}
      className={cn(
        "squish-btn inline-flex items-center justify-center gap-2 h-12 rounded-full border-[1.5px] transition-colors",
        compact ? "w-12" : "pl-2.5 pr-4",
        saved
          ? "border-[var(--color-cheek)] bg-[var(--color-blush)] text-[var(--color-on-blush)]"
          : "border-[var(--color-line-strong)] text-[var(--color-text)] hover:border-[var(--color-cheek)]",
        className
      )}
    >
      <Mark state={saved ? "squished" : "open"} size={26} />
      {!compact && <span className="text-sm font-semibold">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
