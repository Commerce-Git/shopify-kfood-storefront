/**
 * Shared Wishlist (Like / Favorite) SSOT Utility
 * Manages localStorage synchronization, Supabase cloud sync on login (Lossless Auto-Merge),
 * and cross-component reactive events.
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

export function toggleWishlist(
  productId?: string,
  productHandle?: string,
  userId?: string | null
): boolean {
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

    // Asynchronous background sync to Supabase if logged in
    if (userId) {
      const cleanHandle = productHandle || productId;
      if (cleanHandle) {
        import("@/lib/supabase/client")
          .then(({ createClient }) => {
            const supabase = createClient();
            if (currentlySaved) {
              supabase
                .from("customer_wishlist")
                .delete()
                .eq("user_id", userId)
                .eq("product_handle", cleanHandle)
                .then(() => {});
            } else {
              supabase
                .from("customer_wishlist")
                .upsert(
                  { user_id: userId, product_handle: cleanHandle },
                  { onConflict: "user_id,product_handle" }
                )
                .then(() => {});
            }
          })
          .catch(() => {});
      }
    }
  } catch (err) {
    console.error("[Wishlist] Failed to save to localStorage:", err);
  }

  return !currentlySaved;
}

/**
 * Lossless Auto-Merge on Login:
 * Fetches user's wishlisted items from Supabase, merges with local items,
 * upserts any new local items back to Supabase, and updates localStorage.
 */
export async function syncWishlistWithSupabase(userId: string): Promise<string[]> {
  if (typeof window === "undefined" || !userId) return getWishlist();

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // 1. Fetch remote items from Supabase
    const { data: remoteRows, error } = await supabase
      .from("customer_wishlist")
      .select("product_handle")
      .eq("user_id", userId);

    if (error) {
      console.warn("[Wishlist] Supabase select error:", error.message);
      return getWishlist();
    }

    const remoteHandles: string[] = (remoteRows || []).map((r) => r.product_handle);

    // 2. Current local items
    const localList = getWishlist();

    // 3. Union (Merge)
    const merged = Array.from(new Set([...localList, ...remoteHandles]));

    // 4. If there were local items missing in remote, upsert them
    const missingInRemote = localList.filter((h) => !remoteHandles.includes(h));
    if (missingInRemote.length > 0) {
      const rowsToInsert = missingInRemote.map((handle) => ({
        user_id: userId,
        product_handle: handle,
      }));
      await supabase.from("customer_wishlist").upsert(rowsToInsert, {
        onConflict: "user_id,product_handle",
      });
    }

    // 5. Update localStorage and cache
    const rawUpdated = JSON.stringify(merged);
    localStorage.setItem(WISHLIST_STORAGE_KEY, rawUpdated);
    cachedWishlistRaw = rawUpdated;
    cachedWishlist = merged;
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("wishlist-change", { detail: merged }));

    return merged;
  } catch (err) {
    console.warn("[Wishlist] Supabase sync exception:", err);
    return getWishlist();
  }
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
