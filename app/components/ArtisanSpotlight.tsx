"use client";

import Image from "next/image";

export default function ArtisanSpotlight() {
  return (
    <section className="py-24 bg-transparent text-white relative" id="artisan-spotlight">
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column — Text & 3-Second Trust Summary */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">

            {/* Punchy 2-Line Headline */}
            <h2 className="heading-xl text-white leading-tight">
              Korean Craftsmanship,{" "}
              <span className="bg-gradient-to-r from-[#F5D0A9] via-[#E8AA70] to-[#C77B4A] bg-clip-text text-transparent block">Direct From Korea.</span>
            </h2>

            {/* Crisp 1-Line Value Proposition Subtitle */}
            <p
              className="text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Connecting your space directly with Korea&apos;s master artisans. <strong className="text-white font-semibold">Individually handcrafted with care</strong>.
            </p>

            {/* 3 Core Trust Pillars — Symmetrical 1-Line Minimal Badges */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 mt-6 pt-6 sm:mt-8 sm:pt-8 border-t border-white/10">
              <div className="whitespace-nowrap text-xs sm:text-sm font-bold text-white flex items-center justify-center lg:justify-start gap-1.5" style={{ fontFamily: "var(--font-heading)" }}>
                <span>🏛️</span> Master Korean Artisans
              </div>

              <div className="whitespace-nowrap text-xs sm:text-sm font-bold text-white flex items-center justify-center lg:justify-start gap-1.5" style={{ fontFamily: "var(--font-heading)" }}>
                <span>✨</span> Handcrafted Heritage
              </div>

              <div className="whitespace-nowrap text-xs sm:text-sm font-bold text-white flex items-center justify-center lg:justify-start gap-1.5" style={{ fontFamily: "var(--font-heading)" }}>
                <span>✈️</span> Direct Korea Dispatch
              </div>
            </div>
          </div>

          {/* Right Column — Seal of Authenticity Emblem Card (Enlarged to 440px) */}
          <div
            className="lg:col-span-6 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[440px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-[#F5F3EC]">
              <Image
                src="/assets/blank_seoul_symbol.png"
                alt="Blank Seoul Traditional Heritage Symbol"
                fill
                sizes="(max-width: 1024px) 100vw, 440px"
                className="object-cover scale-105"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
