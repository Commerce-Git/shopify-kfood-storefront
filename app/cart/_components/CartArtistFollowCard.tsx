"use client";

import React from "react";
import Image from "next/image";
import ArtistFollowButton from "@/app/components/ArtistFollowButton";
import { useArtistFollow } from "@/lib/hooks/useArtistFollow";
import type { ArtistToFollow } from "@/app/api/cart-companions/route";

interface CartArtistFollowCardProps {
  artist: ArtistToFollow;
  compact?: boolean;
}

export default function CartArtistFollowCard({
  artist,
  compact = false,
}: CartArtistFollowCardProps) {
  const { isFollowed } = useArtistFollow();

  // "추가 상품이 없을 때, 이미 팔로잉 중이면 아무것도 표시하지 않는다" (100% 완전 차단)
  if (isFollowed(artist.slug)) {
    return null;
  }

  const isBlankSeoul = artist.slug === "blank-seoul";

  if (compact) {
    return (
      <div className="rounded-xl bg-[#FDF9F3] border border-[#E8DFC8] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-[#18181B]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-[#C25E38] shrink-0"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Follow {artist.name} for Drops</span>
          </div>
          <p className="text-[11px] text-[#71717A] mt-0.5">
            Limited small-batch studio releases.
          </p>
        </div>
        <div className="shrink-0 w-full sm:w-auto">
          <ArtistFollowButton
            artistSlug={artist.slug}
            artistName={artist.name}
            variant="compact"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Studio Avatar + Action Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] overflow-hidden shrink-0 relative flex items-center justify-center shadow-2xs">
            {isBlankSeoul ? (
              <Image
                src="/assets/blank_seoul_symbol.png"
                alt="Blank Seoul Master Studio Seal"
                fill
                className="object-contain p-1"
                sizes="40px"
              />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#8C827A]"
                aria-hidden="true"
              >
                <path d="M8 3h8" />
                <path d="M9 3v2c-3 3-5 5.5-5 9a8 8 0 0 0 16 0c0-3.5-2-6-5-9V3" />
                <path d="M9 21h6" />
              </svg>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-[#18181B] truncate">
              Follow {artist.name} for upcoming drops
            </h3>
            <p className="text-[11px] text-[#8C827A] mt-0.5 leading-tight">
              Curated Korean master studio releases.
            </p>
          </div>
        </div>

        {/* Right: Delegated Artist Follow Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <ArtistFollowButton
            artistSlug={artist.slug}
            artistName={artist.name}
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
}
