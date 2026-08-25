"use client";

import Image from "next/image";
import Link from "next/link";

export default function HanjiUnboxingSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#F4EFE6] border-t border-[#E8E2D6]" id="unboxing">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-4/5 rounded-2xl overflow-hidden border border-[#E8E2D6] shadow-md">
                <Image
                  src="/assets/hanji_paper_luxury_wrapping.jpg"
                  alt="Authentic Korean Mulberry Hanji Wrapping"
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#E8E2D6] shadow-md">
                  <Image
                    src="/assets/korean_craft_matte_packaging.jpg"
                    alt="Hanji Backing Card Keyring Packaging"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#E8E2D6] shadow-md">
                  <Image
                    src="/assets/ecobag_belly_band_packaging.jpg"
                    alt="Belly Band Eco-bag Presentation"
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Value Proposition */}
          <div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E2D6] text-xs font-bold text-[#1A2F25] uppercase tracking-wider w-fit mx-auto lg:mx-0">
              <span>🌿</span> Heritage Unboxing Ritual
            </div>

            <h2
              className="text-2xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wrapped in 1,000 Years of Mulberry Hanji Tradition.
            </h2>

            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
              We believe a handcrafted piece deserves a packaging that honors its maker. Every single order from Blank Seoul is individually inspected, dressed in textured natural mulberry Hanji paper, bound with organic jute cords, and sealed with a traditional Korean crest.
            </p>

            {/* 3 Value Pillars */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 text-left">
                <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E8E2D6] flex items-center justify-center text-sm shrink-0 shadow-2xs">
                  🌱
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#18181B]">100% Plastic-Free & Eco-Conscious</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Biodegradable raw mulberry bark fibers and paper cards protect your gifts without synthetic plastics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-left">
                <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E8E2D6] flex items-center justify-center text-sm shrink-0 shadow-2xs">
                  🔍
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#18181B]">Seoul Hub 3-Stage Quality Inspection</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Each item is received directly from the maker&apos;s hands and thoroughly quality-checked before international dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-left">
                <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E8E2D6] flex items-center justify-center text-sm shrink-0 shadow-2xs">
                  🎁
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#18181B]">Gift-Ready Arrival</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Ready to be gifted the second it reaches your doorstep—no extra gift wrapping needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/#masterpieces"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#C25E38] hover:text-[#A74B28] transition-colors"
              >
                Experience the collection today →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
