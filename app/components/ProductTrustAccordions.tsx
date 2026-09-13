"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { getArtistSlug, getArtistBySlug } from "@/lib/artists";
import { getCategoryCareStandards, type CareBadgeVariant } from "@/lib/config/categoryMaster";

interface ProductTrustAccordionsProps {
  product: ShopifyProduct;
  className?: string;
}

const emptySubscribe = () => () => {};

const BADGE_STYLES: Record<CareBadgeVariant, string> = {
  emerald: "bg-emerald-50/90 text-emerald-800 border-emerald-200/80",
  amber: "bg-amber-50/90 text-amber-900 border-amber-200/80",
  indigo: "bg-[#F3EFEA] text-[#18181B] border-[#E8DFC8]",
  stone: "bg-[#FAF8F5] text-[#27272A] border-[#E8DFC8]",
};

function getDynamicDeliveryRange(): string {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
    const endDay = endDate.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  } catch {
    return "7–14 business days";
  }
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
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const deliveryRange = isClient ? getDynamicDeliveryRange() : "7–14 business days";

  // Support post-purchase unboxing QR care card deep linking (#craft-care)
  const isCareHash = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("hashchange", onStoreChange);
      return () => window.removeEventListener("hashchange", onStoreChange);
    },
    () => window.location.hash === "#craft-care",
    () => false
  );
  const [isCareManualOpen, setIsCareManualOpen] = useState<boolean | null>(null);
  const isCareOpen = isCareManualOpen !== null ? isCareManualOpen : isCareHash;

  useEffect(() => {
    if (isCareHash) {
      const el = document.getElementById("craft-care");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
    }
  }, [isCareHash]);

  const careData = getCategoryCareStandards(product);
  const artistProfile = product.vendor ? getArtistBySlug(getArtistSlug(product.vendor), product.vendor) : null;
  const artistDisplayName = product.vendor?.trim() || artistProfile?.name || "Blank Seoul";
  const materials = extractMaterials(product.tags);

  return (
    <div className={`space-y-3 pt-6 border-t border-border-light ${className}`}>
      {/* ── ACCORDION 1: Item Details (100% DB-Backed & Verified Craft Facts) ── */}
      <div className="rounded-2xl border border-[#E8DFC8]/80 bg-[#FDF9F3]/60 overflow-hidden shadow-2xs transition-all duration-200">
        <button
          type="button"
          id="item-details-header"
          aria-controls="item-details-content"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          aria-expanded={isDetailsOpen}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-all duration-150 select-none touch-manipulation [-webkit-tap-highlight-color:transparent] hover:bg-[#F8F3EA]/70 active:bg-[#F2ECE0]/90 active:scale-[0.995] focus:outline-hidden min-h-[48px]"
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
          <div
            id="item-details-content"
            role="region"
            aria-labelledby="item-details-header"
            className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-[#3F3F46] space-y-3 border-t border-[#E8DFC8]/50 animate-fade-in"
          >
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
          id="shipping-policies-header"
          aria-controls="shipping-policies-content"
          onClick={() => setIsShippingOpen(!isShippingOpen)}
          aria-expanded={isShippingOpen}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-all duration-150 select-none touch-manipulation [-webkit-tap-highlight-color:transparent] hover:bg-[#F8F3EA]/70 active:bg-[#F2ECE0]/90 active:scale-[0.995] focus:outline-hidden min-h-[48px] rounded-2xl"
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
          <div
            id="shipping-policies-content"
            role="region"
            aria-labelledby="shipping-policies-header"
            className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-[#3F3F46] space-y-3.5 border-t border-[#E8DFC8]/50 animate-fade-in"
          >
            {/* 1. Dynamic Estimated Delivery Date */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E8DFC8]/70 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-base shrink-0">📅</span>
                <div className="text-xs sm:text-sm font-bold text-[#18181B]">
                  Order today to get by <span className="text-[#C25E38] underline decoration-[#C25E38]/40">{deliveryRange}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                Free Shipping
              </span>
            </div>

            {/* 2. Unified Clean Policies List (2026 Quiet Luxury Standard) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-sm shrink-0">✈️</span>
                <div>
                  <span className="font-bold text-[#18181B]">Pre-Cleared Express:</span>{" "}
                  <span className="text-[#52525B]">Dispatched direct from Korea with end-to-end barcode tracking.</span>
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
                  {/* Dotted Underline Popover Trigger */}
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setIsReturnPopoverOpen(!isReturnPopoverOpen)}
                      onMouseEnter={() => setIsReturnPopoverOpen(true)}
                      onMouseLeave={() => setIsReturnPopoverOpen(false)}
                      className="font-bold text-[#18181B] underline decoration-dotted underline-offset-4 decoration-[#71717A] hover:text-[#C25E38] hover:decoration-[#C25E38] transition-colors cursor-help text-left"
                    >
                      30-Day Safe Delivery & Protection Guarantee
                    </button>

                    {/* Floating Speech-Bubble Popover Card */}
                    <div
                      className={`absolute left-0 top-full mt-2 w-64 sm:w-80 p-3.5 bg-white rounded-xl shadow-xl border border-[#E8DFC8] text-[11px] text-[#52525B] leading-relaxed z-40 transition-all duration-200 ${
                        isReturnPopoverOpen
                          ? "opacity-100 visible translate-y-0 pointer-events-auto"
                          : "opacity-0 invisible -translate-y-1 pointer-events-none"
                      }`}
                    >
                      {/* Speech Bubble Caret */}
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-[#E8DFC8] rotate-45" />

                      <p className="relative z-10 font-medium text-[#18181B] mb-1">
                        Zero-Hassle Protection Guarantee
                      </p>
                      <p className="relative z-10 text-[11px] text-[#52525B]">
                        In the rare event your item arrives damaged, defective, or goes missing in transit, send us a quick photo within 30 days for an immediate free replacement or full refund. No international return shipping required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ACCORDION 3: Care & Safety Standards (Safe-by-Default SSOT) ── */}
      <div id="craft-care" className="rounded-2xl border border-[#E8DFC8]/80 bg-[#FDF9F3]/60 overflow-hidden shadow-2xs transition-all duration-200 scroll-mt-24">
        <button
          type="button"
          id="craft-care-header"
          aria-controls="craft-care-content"
          onClick={() => setIsCareManualOpen(!isCareOpen)}
          aria-expanded={isCareOpen}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 text-left transition-all duration-150 select-none touch-manipulation [-webkit-tap-highlight-color:transparent] hover:bg-[#F8F3EA]/70 active:bg-[#F2ECE0]/90 active:scale-[0.995] focus:outline-hidden min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">🍵</span>
            <span className="text-xs sm:text-sm font-bold text-[#18181B] tracking-tight">
              Care & Safety Standards
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block max-w-[130px] sm:max-w-none truncate text-[9px] sm:text-[10px] uppercase font-semibold text-[#71717A] tracking-wider bg-white/80 border border-[#E8DFC8]/60 px-2 py-0.5 rounded-md">
              {careData.categoryTitle}
            </span>
            <svg
              className={`w-4 h-4 text-[#71717A] transition-transform duration-300 shrink-0 ${
                isCareOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isCareOpen && (
          <div
            id="craft-care-content"
            role="region"
            aria-labelledby="craft-care-header"
            className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 text-xs text-[#3F3F46] space-y-3.5 border-t border-[#E8DFC8]/50 animate-fade-in"
          >
            {/* Dynamic Care Badges Row (Quiet Luxury Certificate Header) */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {careData.badges.map((badge) => (
                <span
                  key={badge.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-2xs transition-colors ${
                    BADGE_STYLES[badge.variant] || BADGE_STYLES.stone
                  }`}
                >
                  <span className="text-xs shrink-0" aria-hidden="true">{badge.icon}</span>
                  <span className="font-semibold">{badge.label}</span>
                  {badge.subtitle && (
                    <span className="opacity-70 text-[10px] font-normal">
                      · {badge.subtitle}
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* 1. Purity & Regulatory Standards */}
            <div className="p-3 rounded-xl bg-white/80 border border-[#E8DFC8]/60 space-y-1 shadow-2xs">
              <span className="text-[10px] text-[#71717A] font-semibold block uppercase tracking-wider">
                🌿 Purity & Regulatory Standards
              </span>
              <p className="text-xs text-[#52525B] leading-relaxed">
                {careData.purityStatement}
              </p>
            </div>

            {/* 2. Connoisseur Care & Preservation */}
            <div className="p-3 rounded-xl bg-white/80 border border-[#E8DFC8]/60 space-y-1.5 shadow-2xs">
              <span className="text-[10px] text-[#71717A] font-semibold block uppercase tracking-wider">
                🧼 Connoisseur Care & Preservation
              </span>
              <ul className="space-y-1.5 pt-0.5">
                {careData.connoisseurCare.map((rule, idx) => (
                  <li key={idx} className="text-xs text-[#52525B] leading-relaxed flex items-start gap-1.5">
                    <span className="text-[#C25E38] shrink-0 font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. The Welcoming Ritual */}
            {careData.firstUseRitual && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-1 shadow-2xs">
                <span className="text-[10px] text-[#C25E38] font-bold block uppercase tracking-wider">
                  🎁 {careData.firstUseRitual.title}
                </span>
                <p className="text-xs text-[#52525B] leading-relaxed italic">
                  &ldquo;{careData.firstUseRitual.description}&rdquo;
                </p>
              </div>
            )}

            {/* 4. Regulatory Trust Footer */}
            <div className="pt-1 text-[11px] text-[#71717A] flex items-center gap-1.5 border-t border-[#E8DFC8]/40">
              <span className="shrink-0">⚖️</span>
              <span className="leading-tight">{careData.regulatoryFooter}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
