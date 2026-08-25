"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ============================================
   Platform Hero Banners Component
   Multi-card promotional exhibition carousel showcasing current
   curated seasonal drops, atelier spotlights, and special offers.
   ============================================ */

interface BannerCard {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  link: string;
  bgGradient: string;
  borderColor: string;
  images: string[];
}

const BANNERS: BannerCard[] = [
  {
    id: "banner-1",
    badge: "Monthly Curated Drop",
    badgeColor: "bg-[#C25E38] text-white",
    title: "August Seoul Drop",
    titleHighlight: "~30% OFF",
    subtitle: "Direct from verified Bukchon Hanok ateliers. Ends Aug 31.",
    link: "/#masterpieces",
    bgGradient: "from-[#FBF5ED] via-[#F6ECE0] to-[#EFE2D2]",
    borderColor: "border-[#E8D9C5]",
    images: [
      "/assets/korean_artisan_crafts_hero.jpg",
      "/assets/hopae_wallet_gift_box.jpg",
    ],
  },
  {
    id: "banner-2",
    badge: "24h Atelier Spotlight",
    badgeColor: "bg-[#1A2F25] text-white",
    title: "Master Spotlight:",
    titleHighlight: "까마귀 수장고",
    subtitle: "Joseon Hopae Leather & Royal Gukwha Chrysanthemum Knots.",
    link: "/#ateliers",
    bgGradient: "from-[#F4EFE6] via-[#EAE1D2] to-[#E0D4C0]",
    borderColor: "border-[#D8C9B4]",
    images: [
      "/assets/hopae_wallet_gift_box.jpg",
      "/assets/korean_craft_matte_packaging.jpg",
    ],
  },
  {
    id: "banner-3",
    badge: "Gift Packaging Event",
    badgeColor: "bg-[#B45309] text-white",
    title: "100% Free Hanji Wrap",
    titleHighlight: "Seoul Box",
    subtitle: "Pick any 3 items across 12 masterpieces + expedited dispatch.",
    link: "/#unboxing",
    bgGradient: "from-[#FCF7F0] via-[#F8EFE3] to-[#F1E5D5]",
    borderColor: "border-[#E6D7C3]",
    images: [
      "/assets/hanji_paper_luxury_wrapping.jpg",
      "/assets/ecobag_belly_band_packaging.jpg",
    ],
  },
];

export default function PlatformHeroBanners() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="pt-32 sm:pt-36 pb-6 bg-[#FBF9F5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative">
        {/* Multi-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className={`group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${banner.bgGradient} border ${banner.borderColor} shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-[210px] sm:h-[220px]`}
            >
              {/* Left Content */}
              <div className="relative z-10 max-w-[65%]">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2.5 shadow-2xs ${banner.badgeColor}`}>
                  {banner.badge}
                </span>
                <h3
                  className="text-lg sm:text-xl font-black text-[#18181B] leading-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {banner.title}
                  <span className="block text-[#C25E38] mt-0.5">{banner.titleHighlight}</span>
                </h3>
                <p className="text-[11px] text-[#6B7280] font-medium mt-1.5 line-clamp-2 leading-relaxed">
                  {banner.subtitle}
                </p>
              </div>

              {/* Right Images (Split Photo Collage) */}
              <div className="absolute right-3 bottom-3 top-3 w-[36%] flex flex-col gap-2 justify-center pointer-events-none">
                <div className="relative w-full h-[55%] rounded-xl overflow-hidden shadow-sm border border-white/80">
                  <Image
                    src={banner.images[0]}
                    alt={banner.title}
                    fill
                    sizes="(max-width: 768px) 30vw, 15vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                </div>
                <div className="relative w-full h-[38%] rounded-xl overflow-hidden shadow-sm border border-white/80">
                  <Image
                    src={banner.images[1]}
                    alt={banner.title}
                    fill
                    sizes="(max-width: 768px) 30vw, 15vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                </div>
              </div>

              {/* Hover Arrow Indicator */}
              <div className="relative z-10 text-[11px] font-bold text-[#1A2F25] group-hover:text-[#C25E38] transition-colors flex items-center gap-1">
                <span>Explore Drop</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
