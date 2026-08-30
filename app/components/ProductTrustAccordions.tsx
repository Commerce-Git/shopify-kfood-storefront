"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { getArtistSlug, getArtistBySlug } from "@/lib/artists";

interface ProductTrustAccordionsProps {
  product: ShopifyProduct;
  className?: string;
}

function extractMaterials(tags: string[] = []): string[] {
  const materials: string[] = [];

  // 1. Tags with explicit "Material:" prefix
  for (const tag of tags) {
    if (tag.toLowerCase().startsWith("material:")) {
      const val = tag.substring(tag.indexOf(":") + 1).trim();
      if (val && !materials.includes(val)) {
        materials.push(val);
      }
    }
  }

  // 2. Secondary material composition tags
  const knownCompositionKeywords = [
    "metal alloy",
    "alloy metal",
    "brass",
    "glass beads",
    "pu leather",
    "genuine leather",
    "polyester",
    "cotton",
    "elastic band",
    "silk",
    "metal hardware",
    "silver leaf",
    "natural cotton",
    "mother of pearl",
  ];

  for (const tag of tags) {
    const clean = tag.trim();
    if (
      clean.toLowerCase().startsWith("artist:") ||
      clean.toLowerCase().startsWith("material:")
    ) {
      continue;
    }
    if (knownCompositionKeywords.some((k) => clean.toLowerCase().includes(k))) {
      if (!materials.some((m) => m.toLowerCase() === clean.toLowerCase())) {
        materials.push(clean);
      }
    }
  }

  return materials;
}

export default function ProductTrustAccordions({
  product,
  className = "",
}: ProductTrustAccordionsProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(true); // Etsy standard: Default Open
  const [isReturnPopoverOpen, setIsReturnPopoverOpen] = useState(false); // Floating Popover state
  const [deliveryRange, setDeliveryRange] = useState<string>("7–14 business days");

  const artistProfile = product.vendor ? getArtistBySlug(getArtistSlug(product.vendor)) : null;
  const artistDisplayName = artistProfile?.nameEn || product.vendor || "Seoul Verified Atelier";
  const materials = extractMaterials(product.tags);

  // Hydration-safe dynamic date calculation
  useEffect(() => {
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
      const startDay = startDate.getDate();
      const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
      const endDay = endDate.getDate();

      if (startMonth === endMonth) {
        setDeliveryRange(`${startMonth} ${startDay}–${endDay}`);
      } else {
        setDeliveryRange(`${startMonth} ${startDay} – ${endMonth} ${endDay}`);
      }
    } catch {
      setDeliveryRange("7–14 business days");
    }
  }, []);

  return (
    <div className={`space-y-3 pt-6 border-t border-border-light ${className}`}>
      {/* ── ACCORDION 1: Item Details (100% DB-Backed & Verified Craft Facts) ── */}
      <div className="rounded-2xl border border-[#E8DFC8]/80 bg-[#FDF9F3]/60 overflow-hidden shadow-2xs transition-all duration-200">
        <button
          type="button"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          aria-expanded={isDetailsOpen}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-colors hover:bg-[#F8F3EA]/70 focus:outline-hidden min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">🌿</span>
            <span className="text-xs sm:text-sm font-bold text-[#18181B] tracking-tight">
              Item Details & Story
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-[#71717A] transition-transform duration-300 shrink-0 ${
              isDetailsOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDetailsOpen && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-[#3F3F46] space-y-3 border-t border-[#E8DFC8]/50 animate-fade-in">
            {/* Origin & Studio Badges (Top 2-Column Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-white/80 border border-[#E8DFC8]/60 flex items-center gap-2 shadow-2xs">
                <span className="text-sm shrink-0">🇰🇷</span>
                <div>
                  <span className="text-[10px] text-[#71717A] font-medium block uppercase tracking-wider">Origin</span>
                  <span className="text-xs font-bold text-[#18181B]">Made in Korea</span>
                </div>
              </div>

              {product.vendor ? (
                <Link
                  href={`/artists/${getArtistSlug(product.vendor)}`}
                  className="p-2.5 rounded-xl bg-white/80 border border-[#E8DFC8]/60 flex items-center gap-2 hover:border-[#C25E38]/60 transition-colors group/studio shadow-2xs"
                >
                  <span className="text-sm shrink-0">🏛️</span>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#71717A] font-medium block uppercase tracking-wider">Studio</span>
                    <span className="text-xs font-bold text-[#18181B] group-hover/studio:text-[#C25E38] truncate block">
                      {artistDisplayName} ›
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="p-2.5 rounded-xl bg-white/80 border border-[#E8DFC8]/60 flex items-center gap-2 shadow-2xs">
                  <span className="text-sm shrink-0">🏛️</span>
                  <div>
                    <span className="text-[10px] text-[#71717A] font-medium block uppercase tracking-wider">Studio</span>
                    <span className="text-xs font-bold text-[#18181B]">Seoul Verified Atelier</span>
                  </div>
                </div>
              )}
            </div>

            {/* Materials & Composition (Full-Width Wide Pill Tags) */}
            {materials.length > 0 && (
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/80 border border-[#E8DFC8]/60 space-y-1.5 shadow-2xs">
                <span className="text-[10px] text-[#71717A] font-medium block uppercase tracking-wider">
                  🧵 Materials & Composition
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {materials.map((mat) => (
                    <span
                      key={mat}
                      className="text-xs font-semibold text-[#18181B] bg-[#FAF9F6] border border-[#E8DFC8] px-2.5 py-1 rounded-lg shadow-2xs"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Real Artisan Description & Story from Shopify DB */}
            {product.descriptionHtml && (
              <div
                className="text-xs text-[#52525B] leading-relaxed pt-1 prose prose-sm max-w-none [&_.bg-purple-50]:!hidden [&_.border-purple-200]:!hidden"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── ACCORDION 2: Shipping & Return Policies (Store-Wide Official Policies: Default Open) ── */}
      <div className="rounded-2xl border border-[#E8DFC8]/80 bg-[#FDF9F3]/60 shadow-2xs transition-all duration-200">
        <button
          type="button"
          onClick={() => setIsShippingOpen(!isShippingOpen)}
          aria-expanded={isShippingOpen}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-colors hover:bg-[#F8F3EA]/70 focus:outline-hidden min-h-[48px] rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">📦</span>
            <span className="text-xs sm:text-sm font-bold text-[#18181B] tracking-tight">
              Shipping & Return Policies
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-[#71717A] transition-transform duration-300 shrink-0 ${
              isShippingOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isShippingOpen && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-[#3F3F46] space-y-3.5 border-t border-[#E8DFC8]/50 animate-fade-in">
            {/* 1. Dynamic Estimated Delivery Date */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E8DFC8]/70 flex items-center gap-3 shadow-2xs">
              <span className="text-base shrink-0">📅</span>
              <div className="text-xs sm:text-sm font-bold text-[#18181B]">
                Order today to get by <span className="text-[#C25E38] underline decoration-[#C25E38]/40">{deliveryRange}</span>
              </div>
            </div>

            {/* 2. Unified Clean Policies List (Etsy Signature Standard) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-sm shrink-0">✈️</span>
                <div>
                  <span className="font-bold text-[#18181B]">Tracked Express Dispatch:</span>{" "}
                  <span className="text-[#52525B]">Real-time international tracking number provided via email upon dispatch.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-sm shrink-0">🇰🇷</span>
                <div>
                  <span className="font-bold text-[#18181B]">Ships From:</span>{" "}
                  <span className="text-[#52525B]">South Korea</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-sm shrink-0">🛡️</span>
                <div className="w-full relative">
                  {/* Dotted Underline Popover Trigger (Etsy Standard) */}
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setIsReturnPopoverOpen(!isReturnPopoverOpen)}
                      onMouseEnter={() => setIsReturnPopoverOpen(true)}
                      onMouseLeave={() => setIsReturnPopoverOpen(false)}
                      className="font-bold text-[#18181B] underline decoration-dotted underline-offset-4 decoration-[#71717A] hover:text-[#C25E38] hover:decoration-[#C25E38] transition-colors cursor-help text-left"
                    >
                      Returns & exchanges accepted within 30 days
                    </button>

                    {/* Floating Speech-Bubble Popover Card (Pops up BELOW the trigger) */}
                    <div
                      className={`absolute left-0 top-full mt-2 w-64 sm:w-72 p-3 bg-white rounded-xl shadow-xl border border-[#E8DFC8] text-[11px] text-[#52525B] leading-relaxed z-40 transition-all duration-200 ${
                        isReturnPopoverOpen
                          ? "opacity-100 visible translate-y-0 pointer-events-auto"
                          : "opacity-0 invisible -translate-y-1 pointer-events-none"
                      }`}
                    >
                      {/* Speech Bubble Caret (Pointing UP to trigger) */}
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-[#E8DFC8] rotate-45" />

                      <p className="relative z-10">
                        Buyers are responsible for return shipping costs. If the item is not returned in its original condition, the buyer is responsible for any loss in value.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
