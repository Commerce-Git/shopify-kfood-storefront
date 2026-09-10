"use client";

import React from "react";
import Image from "next/image";
import type { UpsellCandidate } from "@/lib/config/cart-upsells";

interface CartUpsellShelfProps {
  availableUpsells: UpsellCandidate[];
  addedUpsellId: string | null;
  onAddUpsell: (upsell: UpsellCandidate) => void;
}

export default function CartUpsellShelf({
  availableUpsells,
  addedUpsellId,
  onAddUpsell,
}: CartUpsellShelfProps) {
  if (availableUpsells.length === 0) return null;

  return (
    <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#E8DFC8]/50">
        <span className="text-base">✨</span>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-[#18181B] uppercase tracking-wider">
            Complete Your Blank Seoul Box
          </h2>
          <p className="text-[11px] text-[#71717A]">
            Popular companion pieces made in Korea — 1-click addition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableUpsells.slice(0, 2).map((upsell) => (
          <div
            key={upsell.variantId}
            className="p-3 rounded-xl bg-[#FDF9F3]/60 border border-[#E8DFC8] flex items-center justify-between gap-3 hover:bg-[#FDF9F3] transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#E8DFC8] overflow-hidden shrink-0 relative">
                <Image
                  src={upsell.image.url}
                  alt={upsell.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#18181B] truncate">
                  {upsell.title}
                </p>
                <p className="text-xs font-extrabold text-[#C25E38] mt-0.5">
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
    </div>
  );
}
