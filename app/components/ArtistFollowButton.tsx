"use client";

import React from "react";
import { useArtistFollow } from "@/lib/hooks/useArtistFollow";

export interface ArtistFollowButtonProps {
  artistSlug: string;
  artistName: string;
  variant?: "hero" | "compact" | "profile";
  className?: string;
}

function BellIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

/**
 * 2026 YouTube / Twitter(X) Benchmark Follow Button
 * - Followed state: Clean, calm '✓ Following' pill. Zero negative 'Unfollow' text by default.
 * - On hover: Smoothly flips to '✕ Unfollow' (global standard).
 * - Unfollowed state: High-contrast '[Bell] Follow Studio Drops' capsule.
 */
export default function ArtistFollowButton({
  artistSlug,
  artistName,
  variant = "hero",
  className = "",
}: ArtistFollowButtonProps) {
  const { isFollowed, followArtist, unfollowArtist, loadingSlug } =
    useArtistFollow();

  const followed = isFollowed(artistSlug);
  const isLoading = loadingSlug === artistSlug.toLowerCase();
  const isHero = variant === "hero";

  const handleToggleFollow = async () => {
    if (isLoading) return;
    if (followed) {
      await unfollowArtist(artistSlug, artistName);
    } else {
      await followArtist(artistSlug, artistName);
    }
  };

  // Profile cards offer following without implying that email alerts are configured.
  if (variant === "profile") {
    return (
      <div className={`min-w-0 ${className}`}>
        <button
          type="button"
          onClick={handleToggleFollow}
          disabled={isLoading}
          aria-label={`Follow ${artistName}`}
          aria-pressed={followed}
          title={followed ? `Unfollow ${artistName}` : `Follow ${artistName}`}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-stone-300 bg-transparent px-4 py-2.5 text-sm font-semibold leading-5 text-zinc-800 transition-colors hover:border-stone-500 hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2D4A3E] disabled:cursor-wait disabled:opacity-60"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {followed ? <path d="m5 12 4 4L19 6" /> : <path d="M12 5v14M5 12h14" />}
          </svg>
          {isLoading ? "Saving…" : followed ? "Following" : "Follow"}
        </button>
      </div>
    );
  }

  // State 1: Followed State (YouTube / Twitter Benchmark: Clean 'Following' with Hover-Flip to 'Unfollow')
  if (followed) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={handleToggleFollow}
          disabled={isLoading}
          className={`group ${
            isHero
              ? "px-5 py-2 sm:py-2.5 text-xs sm:text-sm"
              : "px-3.5 py-2 sm:py-1.5 text-xs"
          } rounded-full font-bold border transition-all cursor-pointer inline-flex items-center justify-center gap-1.5
          bg-stone-100/90 hover:bg-rose-50/80 border-stone-200/90 hover:border-rose-200 text-stone-700 hover:text-rose-700 shadow-2xs active:scale-95`}
          aria-label={`Unfollow ${artistName}`}
        >
          {/* Checkmark icon (idle) / X icon (hover) */}
          <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-emerald-600 group-hover:hidden transition-all"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-rose-600 hidden group-hover:block transition-all"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>

          {/* Idle Text: 'Following' (평상시에는 깔끔하게 'Following'만 노출) */}
          <span className="group-hover:hidden">
            {isLoading ? "..." : "Following"}
          </span>

          {/* Hover Text: 'Unfollow' (마우스 올렸을 때만 직관적으로 취소 텍스트 전환) */}
          <span className="hidden group-hover:inline">
            {isLoading ? "..." : "Unfollow"}
          </span>
        </button>
      </div>
    );
  }

  // State 2: Default Unfollowed State Button (Pure Quiet Luxury Capsule)
  return (
    <div className={`inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`btn-primary ${
          isHero
            ? "px-6 py-2.5 sm:py-3 text-xs sm:text-sm shadow-sm"
            : "px-4 py-2 text-xs shadow-2xs"
        } rounded-full font-bold inline-flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all`}
        aria-label={`Follow ${artistName} for new releases`}
      >
        <BellIcon className="w-3.5 h-3.5" />
        <span>{isLoading ? "Joining..." : "Follow Studio Drops"}</span>
      </button>
    </div>
  );
}
