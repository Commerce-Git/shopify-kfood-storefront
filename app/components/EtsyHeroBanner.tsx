"use client";

import Link from "next/link";
import Image from "next/image";

export default function EtsyHeroBanner() {
  return (
    <section className="pt-28 sm:pt-36 pb-8 sm:pb-12 bg-[#FBF9F5]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="bg-[#F5F0E6] rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#E8DFC8] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E1D7C3] text-xs font-bold text-[#1A2F25] uppercase tracking-wider w-fit mx-auto lg:mx-0 shadow-2xs">
                <span>🇰🇷</span> Curated Korean Artisan Collective
              </div>

              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#18181B] leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Discover Extraordinary Handcrafted Pieces,{" "}
                <span className="text-[#C25E38] block sm:inline">Direct from Seoul.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#4B5563] max-w-xl leading-relaxed">
                Connect directly with Korea&apos;s independent master craft studios. Every single piece is personally handmade by verified artisans, inspected for excellence, and dispatched directly from Seoul ateliers with tracked international shipping.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/#shelf-edc"
                  className="px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#C25E38] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm"
                >
                  Shop the 12 Works →
                </Link>
                <Link
                  href="/#ateliers"
                  className="px-6 py-3 rounded-full bg-white hover:bg-[#FBF9F5] text-[#18181B] font-bold text-xs sm:text-sm tracking-wide border border-[#D8CEBA] transition-all shadow-2xs"
                >
                  🏛️ Meet Our Ateliers
                </Link>
              </div>
            </div>

            {/* Right Visual Card (Etsy Style Featured Craft Card) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[420px] aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-white/80 group bg-white">
                <Image
                  src="/assets/korean_artisan_crafts_hero.jpg"
                  alt="Handcrafted Korean Artisan Masterpiece Collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373]">
                    Featured Atelier Collection
                  </span>
                  <p className="text-sm sm:text-base font-bold leading-snug mt-0.5" style={{ fontFamily: "var(--font-heading)" }}>
                    Joseon Hopae Leather & Silk Knot Crafts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
