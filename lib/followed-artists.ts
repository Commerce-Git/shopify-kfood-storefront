/**
 * Shared Followed Artists SSOT Utility
 * Manages localStorage synchronization, Supabase cloud sync on login (Lossless Auto-Merge),
 * and cross-component reactive events.
 */

export const ARTIST_FOLLOW_STORAGE_KEY = "blank_seoul_followed_artists";

let cachedFollowedRaw: string | null = null;
let cachedFollowed: string[] = [];
const SERVER_EMPTY_LIST: string[] = [];

export function getFollowedArtists(): string[] {
  if (typeof window === "undefined") return SERVER_EMPTY_LIST;
  try {
    const raw = localStorage.getItem(ARTIST_FOLLOW_STORAGE_KEY) || "[]";
    if (raw === cachedFollowedRaw) {
      return cachedFollowed;
    }
    cachedFollowedRaw = raw;
    const parsed = JSON.parse(raw);
    cachedFollowed = Array.isArray(parsed) ? parsed : [];
    return cachedFollowed;
  } catch {
    return cachedFollowed;
  }
}

export function getServerFollowedArtistsSnapshot(): string[] {
  return SERVER_EMPTY_LIST;
}

export function getFollowedArtistsSnapshot(): string[] {
  return getFollowedArtists();
}

export function isArtistFollowed(slug?: string): boolean {
  if (!slug || typeof window === "undefined") return false;
  return getFollowedArtists().includes(slug.toLowerCase().trim());
}

export function subscribeFollowedArtists(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("artist-follow-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("artist-follow-change", callback);
  };
}

/**
 * Lossless Auto-Merge on Login:
 * Fetches user's followed studios from Supabase, merges with local items,
 * upserts any new local items back to Supabase, and updates localStorage.
 */
export async function syncFollowedArtistsWithSupabase(userId: string): Promise<string[]> {
  if (typeof window === "undefined" || !userId) return getFollowedArtists();

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // 1. Fetch remote items from Supabase
    const { data: remoteRows, error } = await supabase
      .from("customer_followed_artists")
      .select("artist_slug")
      .eq("user_id", userId);

    if (error) {
      // Table may not exist yet if migration pending; log warning and return local
      console.warn("[Followed Artists] Supabase select notice:", error.message);
      return getFollowedArtists();
    }

    const remoteSlugs: string[] = (remoteRows || []).map((r) => r.artist_slug.toLowerCase());

    // 2. Current local items
    const localList = getFollowedArtists().map((s) => s.toLowerCase());

    // 3. Union (Merge)
    const merged = Array.from(new Set([...localList, ...remoteSlugs]));

    // 4. If there were local items missing in remote, upsert them
    const missingInRemote = localList.filter((s) => !remoteSlugs.includes(s));
    if (missingInRemote.length > 0) {
      const rowsToInsert = missingInRemote.map((slug) => ({
        user_id: userId,
        artist_slug: slug,
        artist_name: slug,
        notify_drops: true,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("customer_followed_artists").upsert(rowsToInsert, {
        onConflict: "user_id,artist_slug",
      });
    }

    // 5. Update localStorage and cache
    const rawUpdated = JSON.stringify(merged);
    localStorage.setItem(ARTIST_FOLLOW_STORAGE_KEY, rawUpdated);
    cachedFollowedRaw = rawUpdated;
    cachedFollowed = merged;

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("artist-follow-change"));

    return merged;
  } catch (err) {
    console.warn("[Followed Artists] Supabase sync exception:", err);
    return getFollowedArtists();
  }
}

/**
 * Direct Supabase Cloud Sync helper for active login sessions
 */
export async function addFollowedArtistSupabase(
  userId: string,
  artistSlug: string,
  artistName: string = ""
): Promise<void> {
  if (!userId || !artistSlug) return;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("customer_followed_artists").upsert(
      {
        user_id: userId,
        artist_slug: artistSlug.toLowerCase().trim(),
        artist_name: artistName,
        notify_drops: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,artist_slug" }
    );
  } catch (err) {
    console.warn("[Followed Artists] Failed to upsert to Supabase:", err);
  }
}

export async function removeFollowedArtistSupabase(
  userId: string,
  artistSlug: string
): Promise<void> {
  if (!userId || !artistSlug) return;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase
      .from("customer_followed_artists")
      .delete()
      .eq("user_id", userId)
      .eq("artist_slug", artistSlug.toLowerCase().trim());
  } catch (err) {
    console.warn("[Followed Artists] Failed to delete from Supabase:", err);
  }
}
