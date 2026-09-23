"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import {
  getFollowedArtists,
  getFollowedArtistsSnapshot,
  getServerFollowedArtistsSnapshot,
  subscribeFollowedArtists,
  addFollowedArtistSupabase,
  removeFollowedArtistSupabase,
  ARTIST_FOLLOW_STORAGE_KEY,
} from "@/lib/followed-artists";

const STORAGE_EMAIL_KEY = "blank_seoul_follow_email";

// Debounce timer map for rapid-click flood prevention
const pendingNetworkTimers = new Map<string, NodeJS.Timeout>();

export function useArtistFollow() {
  const { user } = useAuth();

  // 1. React 19 external store subscription (0 hydration lag, zero tearing, zero flicker)
  const followedSlugs = useSyncExternalStore(
    subscribeFollowedArtists,
    getFollowedArtistsSnapshot,
    getServerFollowedArtistsSnapshot
  );

  const isFollowed = useCallback(
    (slug: string) => followedSlugs.includes(slug.toLowerCase().trim()),
    [followedSlugs]
  );

  const getSavedEmail = useCallback((): string => {
    if (user?.email) return user.email.trim().toLowerCase();
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(STORAGE_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  }, [user]);

  const followArtist = useCallback(
    async (slug: string, artistName: string, emailOverride?: string) => {
      const email = emailOverride?.trim().toLowerCase() || getSavedEmail();
      const normalizedSlug = slug.toLowerCase().trim();

      // 1. Instant 0ms Optimistic Update (SSOT: localStorage + Broadcast)
      const currentList = getFollowedArtists();
      if (!currentList.includes(normalizedSlug)) {
        const nextList = [...currentList, normalizedSlug];
        try {
          localStorage.setItem(ARTIST_FOLLOW_STORAGE_KEY, JSON.stringify(nextList));
          if (email) localStorage.setItem(STORAGE_EMAIL_KEY, email);
        } catch {}
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("artist-follow-change"));
        }
      }

      // 2. Rapid-click protection: Clear any pending debounced sync for this artist
      if (pendingNetworkTimers.has(normalizedSlug)) {
        clearTimeout(pendingNetworkTimers.get(normalizedSlug)!);
        pendingNetworkTimers.delete(normalizedSlug);
      }

      // Debounce server-side sync by 250ms to absorb rapid consecutive clicks
      const timer = setTimeout(() => {
        pendingNetworkTimers.delete(normalizedSlug);

        // A. Primary SSOT: Supabase persistent write for authenticated users (0.5ms index query)
        if (user?.id) {
          addFollowedArtistSupabase(user.id, normalizedSlug, artistName).catch((err) => {
            console.warn("[Artist Follow] Supabase upsert notice:", err);
          });
        }

        // B. Secondary Mirror: Shopify Customer Tag with keepalive for page navigation resilience
        if (email) {
          fetch("/api/artists/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              artistSlug: normalizedSlug,
              artistName,
              action: "follow",
            }),
            keepalive: true, // Browser completes request even if user navigates away or checks out
          }).catch((err) => {
            console.warn("[Artist Follow] Background Shopify sync notice:", err);
          });
        }
      }, 250);

      pendingNetworkTimers.set(normalizedSlug, timer);

      return {
        success: true,
        message: `You are now following ${artistName}.`,
      };
    },
    [user, getSavedEmail]
  );

  const unfollowArtist = useCallback(
    async (slug: string, artistName: string, emailOverride?: string) => {
      const email = emailOverride?.trim().toLowerCase() || getSavedEmail();
      const normalizedSlug = slug.toLowerCase().trim();

      // 1. Instant 0ms Optimistic Update
      const currentList = getFollowedArtists();
      const nextList = currentList.filter((s) => s.toLowerCase() !== normalizedSlug);
      try {
        localStorage.setItem(ARTIST_FOLLOW_STORAGE_KEY, JSON.stringify(nextList));
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("artist-follow-change"));
      }

      // 2. Rapid-click protection
      if (pendingNetworkTimers.has(normalizedSlug)) {
        clearTimeout(pendingNetworkTimers.get(normalizedSlug)!);
        pendingNetworkTimers.delete(normalizedSlug);
      }

      const timer = setTimeout(() => {
        pendingNetworkTimers.delete(normalizedSlug);

        // A. Primary SSOT: Supabase deletion
        if (user?.id) {
          removeFollowedArtistSupabase(user.id, normalizedSlug).catch((err) => {
            console.warn("[Artist Follow] Supabase delete notice:", err);
          });
        }

        // B. Secondary Mirror: Shopify tag removal with keepalive
        if (email) {
          fetch("/api/artists/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              artistSlug: normalizedSlug,
              artistName,
              action: "unfollow",
            }),
            keepalive: true,
          }).catch((err) => {
            console.warn("[Artist Follow] Background Shopify sync notice:", err);
          });
        }
      }, 250);

      pendingNetworkTimers.set(normalizedSlug, timer);

      return {
        success: true,
        message: `Unfollowed ${artistName}.`,
      };
    },
    [user, getSavedEmail]
  );

  return {
    followedSlugs,
    isFollowed,
    followArtist,
    unfollowArtist,
    loadingSlug: null,
    userEmail:
      user?.email ||
      (typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_EMAIL_KEY)
        : null),
  };
}
