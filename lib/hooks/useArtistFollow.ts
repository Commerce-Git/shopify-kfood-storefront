"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/components/AuthProvider";

const STORAGE_KEY = "blank_seoul_followed_artists";

export function useArtistFollow() {
  const { user } = useAuth();
  const [followedSlugs, setFollowedSlugs] = useState<string[]>([]);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFollowedSlugs(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const isFollowed = useCallback(
    (slug: string) => followedSlugs.includes(slug.toLowerCase()),
    [followedSlugs]
  );

  const followArtist = useCallback(
    async (slug: string, artistName: string, emailOverride?: string) => {
      const email = emailOverride?.trim() || user?.email || "";
      const normalizedSlug = slug.toLowerCase();

      if (!email) {
        return { success: false, error: "Please enter an email address." };
      }

      setLoadingSlug(normalizedSlug);

      try {
        const res = await fetch("/api/artists/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            artistSlug: normalizedSlug,
            artistName,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setFollowedSlugs((prev) => {
            const next = Array.from(new Set([...prev, normalizedSlug]));
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });

          return {
            success: true,
            message: data.message || `You are now following ${artistName}.`,
          };
        } else {
          return {
            success: false,
            error: data.error || "Failed to follow artist. Please try again.",
          };
        }
      } catch {
        return {
          success: false,
          error: "Network error. Please check your connection.",
        };
      } finally {
        setLoadingSlug(null);
      }
    },
    [user?.email]
  );

  return {
    followedSlugs,
    isFollowed,
    followArtist,
    loadingSlug,
    userEmail: user?.email || null,
  };
}
