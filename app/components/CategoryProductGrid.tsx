"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getArtistSlug } from "@/lib/artists";
import type { EtsyCardItem } from "./EtsyHorizontalShelf";

interface CategoryProductGridProps {
  id?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  items: EtsyCardItem[];
  viewAllHref: string;
  viewAllLabel?: string;
}

export default function CategoryProductGrid({
  id,
  badge,
  title,
  subtitle,
  items,
  viewAllHref,
  viewAllLabel,
}: CategoryProductGridProps) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blank_seoul_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleWishlist = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = wishlist.includes(itemId)
      ? wishlist.filter((i) => i !== itemId)
      : [...wishlist, itemId];
    setWishlist(updated);
    try {
      localStorage.setItem("blank_seoul_wishlist", JSON.stringify(updated));
    } catch {}
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 bg-white" id={id}>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4 border-b border-[#F2ECE1] pb-4">
          <div>
            {badge && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-[#C25E38] mb-1">
                {badge}
              </span>
            )}
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 px-5 py-2 rounded-full border border-[#18181B] text-xs font-bold text-[#18181B] hover:bg-[#18181B] hover:text-white transition-all shadow-2xs self-start sm:self-end shrink-0"
          >
            <span>{viewAllLabel || `View all (${items.length})`}</span>
            <span>→</span>
          </Link>
        </div>

        {/* 4-Column Open Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const isWishlisted = wishlist.includes(item.id);
            const artistSlug = getArtistSlug(item.artist);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8DFC8]/70 hover:border-[#C25E38] shadow-2xs hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Image Container with Wishlist Toggle */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FAF8F5] mb-3">
                    <Link href={`/product/${item.handle}`} className="block w-full h-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* 1-Click Wishlist Heart Button */}
                    <button
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md z-10 cursor-pointer ${
                        isWishlisted
                          ? "bg-[#C25E38] text-white scale-110"
                          : "bg-white/90 hover:bg-white text-[#18181B]/70 hover:text-[#C25E38]"
                      }`}
                      aria-label="Save to favorites"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>

                    {/* Verified Atelier Tag */}
                    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider text-[#1A2F25] shadow-2xs">
                      🏛️ Seoul Made
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#C25E38] transition-colors line-clamp-2 leading-snug">
                    <Link href={`/product/${item.handle}`}>
                      {item.title}
                    </Link>
                  </h3>
                </div>

                {/* Price & Shipping Info */}
                <div className="mt-3 pt-2.5 border-t border-[#F2ECE1] flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-base sm:text-lg font-black text-[#18181B]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      USD ${item.price}
                    </span>
                    {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                      <span className="text-[11px] text-[#9CA3AF] line-through font-normal">
                        ${item.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#2A6A4E]">
                    Tracked Dispatch
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
