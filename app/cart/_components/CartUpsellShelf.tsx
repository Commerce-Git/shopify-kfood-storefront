"use client";

import React from "react";
import Image from "next/image";
import type { CompanionProduct, ArtistToFollow } from "@/app/api/cart-companions/route";
import CartArtistFollowCard from "./CartArtistFollowCard";
import { useArtistFollow } from "@/lib/hooks/useArtistFollow";

interface CartUpsellShelfProps {
  companions: CompanionProduct[];
  artistsToFollow: ArtistToFollow[];
  isLoading: boolean;
  addedUpsellId: string | null;
  onAddUpsell: (upsell: CompanionProduct) => void;
}

export default function CartUpsellShelf({
  companions,
  artistsToFollow,
  isLoading,
  addedUpsellId,
  onAddUpsell,
}: CartUpsellShelfProps) {
  const { isFollowed } = useArtistFollow();

  // "추가 상품이 없을 때, 이미 팔로잉 중이면 아무것도 표시하지 않는다" (100% 완전 차단)
  const unFollowedArtists = artistsToFollow.filter(
    (artist) => !isFollowed(artist.slug)
  );

  // 1. Loading Skeleton State (Prevents Layout Shift)
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-5 shadow-2xs animate-pulse">
        <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#E8DFC8]/40">
          <div className="w-5 h-5 bg-[#F4EFE6] rounded-full" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-[#F4EFE6] rounded w-48" />
            <div className="h-2.5 bg-[#F4EFE6] rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-20 bg-[#FDF9F3]/60 rounded-xl border border-[#E8DFC8]/60" />
          <div className="h-20 bg-[#FDF9F3]/60 rounded-xl border border-[#E8DFC8]/60 hidden sm:block" />
        </div>
      </div>
    );
  }

  // 2. Empty state: Nothing to recommend or follow
  if (companions.length === 0 && unFollowedArtists.length === 0) {
    return null;
  }

  // 3. Follow Card Only (When all products of in-cart artists are already collected / 0 remaining)
  if (companions.length === 0 && unFollowedArtists.length > 0) {
    return (
      <div className="space-y-3">
        {unFollowedArtists.map((artist) => (
          <CartArtistFollowCard key={artist.slug} artist={artist} />
        ))}
      </div>
    );
  }

  // 4. Studio Companion Products (+ Optional Compact Follow Banner for Multi-Artist Carts)
  const primaryArtistName = companions[0]?.artist?.name || "Artisan";

  return (
    <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#E8DFC8]/50">
        <svg className="w-4 h-4 text-[#C25E38] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-[#18181B] uppercase tracking-wider">
            Complete Your {primaryArtistName} Collection
          </h2>
          <p className="text-[11px] text-[#71717A]">
            Handcrafted companion pieces from the same studio in Korea — 1-click addition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {companions.slice(0, 2).map((upsell) => (
          <div
            key={upsell.variantId}
            className="p-3 rounded-xl bg-[#FDF9F3]/70 border border-[#E8DFC8] flex items-center justify-between gap-3 hover:bg-[#FDF9F3] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-lg bg-white border border-[#E8DFC8] overflow-hidden shrink-0 relative">
                <Image
                  src={upsell.image.url}
                  alt={upsell.image.altText || upsell.title}
                  fill
                  unoptimized={upsell.image.url.includes("cdn.shopify.com")}
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#18181B] line-clamp-1 leading-tight">
                  {upsell.title}
                </p>
                <p className="text-[10px] text-[#71717A] line-clamp-1 mt-0.5">
                  {upsell.storyPitch}
                </p>
                <p className="text-xs font-extrabold text-[#C25E38] mt-1">
                  ${upsell.price}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAddUpsell(upsell)}
              disabled={Boolean(addedUpsellId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer ${
                addedUpsellId === upsell.variantId
                  ? "bg-[#2E7D32] text-white border border-[#2E7D32] scale-105"
                  : "bg-white border border-[#C25E38] text-[#C25E38] hover:bg-[#C25E38] hover:text-white"
              }`}
            >
              {addedUpsellId === upsell.variantId ? "✓ Added!" : "+ Add"}
            </button>
          </div>
        ))}
      </div>

      {/* Multi-Artist Sub-Slot: If an artist in the cart has no other products, offer compact follow */}
      {unFollowedArtists.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#E8DFC8]/50 space-y-2">
          {unFollowedArtists.map((artist) => (
            <CartArtistFollowCard key={artist.slug} artist={artist} compact />
          ))}
        </div>
      )}
    </div>
  );
}
