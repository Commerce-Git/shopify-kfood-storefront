"use client";

import Image from "next/image";

export default function EtsyEditorialSplitBanner() {
  return (
    <section className="py-8 sm:py-12 bg-[#FBF9F5]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-14 bg-[#1A2F25] text-white relative overflow-hidden border border-[#2D4A3E] shadow-lg">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C25E38]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left 60%: Hook & Brand Manifesto Story */}
            <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#D4A373]">
                <span>🇰🇷</span> 100% Made in Korea · Direct from Seoul
              </div>

              <h2
                className="text-2xl sm:text-4xl lg:text-[40px] font-serif font-bold text-white leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                100% Made in Korea. Crafted & Dispatched Direct from Seoul.
              </h2>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Zero cheap overseas counterfeits, no dropshipping. Every piece on Blank Seoul is 100% designed and crafted in Korea by verified artisan studios and skilled local workshops—dispatched directly from our Seoul hub straight to your doorstep with tracked global express.
              </p>

              {/* 3 Core Authenticity Pillars (Anti-Dropshipping Trust) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-4 border-t border-white/15 text-left">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A373]">
                    <span>🇰🇷</span> 100% Made in Korea
                  </div>
                  <p className="text-[11px] text-white/70 leading-snug">
                    Zero overseas counterfeits, 100% authentic Korean origin.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A373]">
                    <span>🏛️</span> Verified Korean Craft
                  </div>
                  <p className="text-[11px] text-white/70 leading-snug">
                    Original works by independent Korean designers & studios.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A373]">
                    <span>✈️</span> Direct Seoul Dispatch
                  </div>
                  <p className="text-[11px] text-white/70 leading-snug">
                    Insured express international delivery from Seoul Hub.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 5-Col: Natural Silk Texture Taegeukgi Artwork (Pure & Unobstructed) */}
            <div className="lg:col-span-5 relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-[#243E32] group">
              <Image
                src="/assets/korean_silk_taegeukgi_luxury_texture.jpg"
                alt="100% Made in Korea - Natural Korean Silk Woven Taegeukgi"
                fill
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
