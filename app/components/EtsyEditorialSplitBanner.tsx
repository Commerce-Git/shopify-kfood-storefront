"use client";

import Image from "next/image";
import { isStoreLive } from "@/lib/constants";

export default function EtsyEditorialSplitBanner() {
  const live = isStoreLive();

  return (
    <section className="py-8 sm:py-12 bg-[#FBF9F5]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-14 bg-[#1A2F25] text-white relative overflow-hidden border border-[#2D4A3E] shadow-lg">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C25E38]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left 60%: Hook & Pure Brand Manifesto Story */}
            <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left">
              {/* Eyebrow Badge: Clear Launch Status */}
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#D4A373]">
                {!live ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>OFFICIAL LAUNCH &middot; ATELIER PREVIEW</span>
                  </>
                ) : (
                  <>
                    <span>🇰🇷</span>
                    <span>DIRECT DISPATCH FROM KOREA</span>
                  </>
                )}
              </div>

              {/* Main Headline: Prominent 2-Tier Opening Soon + Origin Guarantee */}
              <h2
                className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {!live ? (
                  <>
                    <span className="text-[#D4A373] block mb-1">Opening Soon.</span>
                    <span className="text-white">All Products Made in Korea.</span>
                  </>
                ) : (
                  <span className="text-white">All Products Made in Korea.</span>
                )}
              </h2>

              {/* Refined Single-Sentence Narrative (Zero Repetition, Pure Transparency) */}
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                {!live
                  ? "Every piece on Blank Seoul is authentically crafted by verified Korean artisans and local workshops. Our official direct international express dispatch will open soon."
                  : "Every product on Blank Seoul is authentically crafted in Korea—curated in Seoul from skilled local workshops and verified studios, dispatched directly with tracked global express."}
              </p>

              {/* Refined Dual Assurance Bar (Quiet Luxury & Clutter-Free) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-2 border-t border-white/15 text-left max-w-lg">
                <div className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">🏛️</span>
                  <div>
                    <h3 className="text-xs font-bold text-[#D4A373]">Verified Korean Workshops</h3>
                    <p className="text-[11px] text-white/70 leading-snug mt-0.5">
                      Curated directly from verified local master studios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">✈️</span>
                  <div>
                    <h3 className="text-xs font-bold text-[#D4A373]">
                      {!live ? "Global Dispatch Opening Soon" : "Tracked International Air"}
                    </h3>
                    <p className="text-[11px] text-white/70 leading-snug mt-0.5">
                      {!live
                        ? "Insured worldwide express launching shortly."
                        : "Insured express straight to your door."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5-Col: Natural Silk Texture Taegeukgi Artwork (Pure & Unobstructed) */}
            <div className="lg:col-span-5 relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-[#243E32] group">
              <Image
                src="/assets/korean_silk_taegeukgi_luxury_texture.jpg"
                alt="Made in Korea - Natural Korean Silk Woven Taegeukgi"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
