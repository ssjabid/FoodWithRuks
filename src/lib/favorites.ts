import { STORAGE_KEYS } from "./site";

const STORAGE_KEY = STORAGE_KEYS.favorites;
const CHANGE_EVENT = "favorites-changed";

function notify(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribe to favourite changes (same tab via custom event, other tabs via storage). */
export function onFavoritesChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isFavorited(slug: string): boolean {
  return getFavorites().includes(slug);
}

export function saveFavorite(slug: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(slug)) {
    favorites.push(slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    notify();
  }
}

export function removeFavorite(slug: string): void {
  const favorites = getFavorites().filter((s) => s !== slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  notify();
}

export function toggleFavorite(slug: string): boolean {
  if (isFavorited(slug)) {
    removeFavorite(slug);
    return false;
  }
  saveFavorite(slug);
  return true;
}
