/**
 * Shared Wishlist (Like / Favorite) SSOT Utility
 * Manages localStorage synchronization and cross-component reactive events.
 */

const WISHLIST_STORAGE_KEY = "blank_seoul_wishlist";

let cachedWishlistRaw: string | null = null;
let cachedWishlist: string[] = [];
const SERVER_EMPTY_WISHLIST: string[] = [];

export function getWishlist(): string[] {
  if (typeof window === "undefined") return SERVER_EMPTY_WISHLIST;
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]";
    if (raw === cachedWishlistRaw) {
      return cachedWishlist;
    }
    cachedWishlistRaw = raw;
    const parsed = JSON.parse(raw);
    cachedWishlist = Array.isArray(parsed) ? parsed : [];
    return cachedWishlist;
  } catch {
    return cachedWishlist;
  }
}

export function getServerWishlistSnapshot(): string[] {
  return SERVER_EMPTY_WISHLIST;
}

export function getWishlistCountSnapshot(): number {
  return getWishlist().length;
}

export function getServerWishlistCountSnapshot(): number {
  return 0;
}

export function isWishlisted(productId?: string, productHandle?: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getWishlist();
  if (productId && list.includes(productId)) return true;
  if (productHandle && list.includes(productHandle)) return true;
  return false;
}

export function toggleWishlist(productId?: string, productHandle?: string): boolean {
  if (typeof window === "undefined") return false;
  const primaryId = productId || productHandle;
  if (!primaryId) return false;

  const current = getWishlist();
  const currentlySaved =
    (productId && current.includes(productId)) ||
    (productHandle && current.includes(productHandle));

  let updated: string[];
  if (currentlySaved) {
    updated = current.filter(
      (id) => id !== productId && id !== productHandle
    );
  } else {
    updated = [...current, primaryId];
  }

  try {
    const rawUpdated = JSON.stringify(updated);
    localStorage.setItem(WISHLIST_STORAGE_KEY, rawUpdated);
    cachedWishlistRaw = rawUpdated;
    cachedWishlist = updated;
    // Trigger native storage event so useSyncExternalStore subscribers in Header & Account update instantly
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("wishlist-change", { detail: updated }));
  } catch (err) {
    console.error("[Wishlist] Failed to save to localStorage:", err);
  }

  return !currentlySaved;
}

export function subscribeWishlist(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("wishlist-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("wishlist-change", callback);
  };
}
