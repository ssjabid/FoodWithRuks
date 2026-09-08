"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { getFavorites, onFavoritesChange, toggleFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  slug: string;
  className?: string;
}

const subscribe = (cb: () => void) => onFavoritesChange(cb);
const getSnapshot = () => getFavorites().join(",");
const getServerSnapshot = () => "";

export function FavoriteButton({ slug, className }: FavoriteButtonProps) {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const favorited = favorites.split(",").includes(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(slug);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
      className={cn(
        "p-2 rounded-full bg-[var(--color-elevated)]/85 hover:bg-[var(--color-elevated)] transition-colors",
        className
      )}
    >
      <svg
        className={cn("w-5 h-5 transition-colors", favorited ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]")}
        fill={favorited ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
