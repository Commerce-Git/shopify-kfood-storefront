"use client";

import Link from "next/link";
import Image from "next/image";

export default function PlatformHero() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden bg-[#FBF9F5]">
      {/* Background Subtle Hanji Fiber Watermark Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2318181B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C25E38]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Platform Statement & Dual CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4EFE6] border border-[#E8E2D6] w-fit mx-auto lg:mx-0 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#C25E38] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#1A2F25]" style={{ fontFamily: "var(--font-heading)" }}>
                Curated Korean Artisan Collective
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#18181B] leading-[1.1] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The Global Stage for{" "}
              <span className="text-[#C25E38] relative inline-block">
                Korea&apos;s Independent
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#C25E38]/20"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  fill="currentColor"
                >
                  <path d="M0 15 Q 50 0, 100 15 L 100 20 Q 50 5, 0 20 Z" />
                </svg>
              </span>{" "}
              Artisans.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6B7280] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover authentic, handcrafted treasures born in Seoul&apos;s heritage ateliers. 
              Each piece is personally crafted with centuries-old tradition, verified for excellence, and delivered straight from Korea.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/#masterpieces"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#1A2F25] text-white font-bold text-sm tracking-wide shadow-md hover:bg-[#112019] hover:shadow-lg transition-all text-center"
              >
                Explore 12 Masterpieces →
              </Link>
              <Link
                href="/#ateliers"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#FFFFFF] text-[#18181B] font-bold text-sm tracking-wide border border-[#E8E2D6] hover:bg-[#F4EFE6] hover:border-[#D8D0C0] transition-all text-center"
              >
                🏛️ Meet Our Ateliers
              </Link>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 sm:pt-8 border-t border-[#E8E2D6] mt-4">
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                  100%
                </p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">Handcrafted in Seoul</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                  Verified
                </p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">Independent Ateliers</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                  Plastic-Free
                </p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">Mulberry Hanji Wrap</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[480px] aspect-4/5 rounded-3xl overflow-hidden border border-[#E8E2D6] shadow-xl bg-white group">
              <Image
                src="/assets/korean_artisan_crafts_hero.jpg"
                alt="Blank Seoul Handcrafted Korean Artisan Masterpiece Collection"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Badge 1: Atelier Origin */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E8E2D6] shadow-sm flex items-center gap-1.5 text-xs font-bold text-[#1A2F25]">
                <span>🇰🇷</span> Seoul Heritage Ateliers
              </div>

              {/* Bottom Caption Card */}
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-[#D4A373]">
                  Curated Artisan Collection
                </p>
                <p className="text-base sm:text-lg font-bold leading-snug mt-1" style={{ fontFamily: "var(--font-heading)" }}>
                  Authentic Crafts, Preserving Joseon Heritage
                </p>
                <p className="text-xs text-white/80 mt-1">
                  Personally handmade in Seoul studios with pure silk knots, leather, and fine embroidery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
