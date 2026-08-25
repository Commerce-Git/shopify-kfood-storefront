"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ShelfItem {
  id: string;
  title: string;
  handle: string;
  artist: string;
  price: string;
  originalPrice?: string;
  material: string;
  image: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  available?: boolean;
}

interface EtsyCuratedShelfProps {
  id?: string;
  title: string;
  subtitle?: string;
  items: ShelfItem[];
  viewAllHref?: string;
}

export default function EtsyCuratedShelf({
  id,
  title,
  subtitle,
  items,
  viewAllHref = "/collections",
}: EtsyCuratedShelfProps) {
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

  return (
    <section className="py-8 sm:py-12 bg-[#FBF9F5]" id={id}>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Shelf Header (Etsy Style: Title on Left, [View all] on Right) */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <h2
              className="text-xl sm:text-2xl font-extrabold text-[#18181B] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="px-4 py-1.5 rounded-full border border-[#D8CEBA] text-xs font-bold text-[#18181B] hover:bg-[#F4EFE6] transition-colors shadow-2xs shrink-0"
          >
            View all
          </Link>
        </div>

        {/* 4-Card Responsive Grid (Etsy Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const isSaved = wishlist.includes(item.id);
            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-2xs hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Square Image with Rounded Corners & Wishlist Heart */}
                  <Link href={`/product/${item.handle}`} className="relative block aspect-square overflow-hidden bg-[#F5F0E6]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-106"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors" />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-2.5 left-2.5 bg-[#18181B]/85 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                        {item.badge}
                      </div>
                    )}

                    {/* Wishlist Heart Button (Etsy Style) */}
                    <button
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#18181B] hover:text-[#C25E38] shadow-xs transition-transform active:scale-90 cursor-pointer"
                      aria-label="Save to Wishlist"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isSaved ? "#C25E38" : "none"}
                        stroke={isSaved ? "#C25E38" : "currentColor"}
                        strokeWidth="2.5"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </Link>

                  {/* Etsy-Style Card Meta */}
                  <div className="p-3.5 sm:p-4">
                    {/* Line 1: Title (Truncated clean 1 line) */}
                    <h3
                      className="text-xs sm:text-sm font-bold text-[#18181B] leading-snug line-clamp-1 group-hover:text-[#C25E38] transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <Link href={`/product/${item.handle}`}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Line 2: Artist Attribution */}
                    <div className="text-[11px] font-semibold text-[#6B7280] mt-1">
                      by <span className="text-[#18181B] font-bold">{item.artist}</span> · Seoul
                    </div>

                    {/* Line 3: Pricing & Review (Etsy format: USD $XX.00) */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F2ECE1]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-black text-[#15803D]">
                          USD {item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[11px] text-[#9CA3AF] line-through font-normal">
                            USD {item.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#18181B]">
                        <span className="text-[#C25E38]">★</span> 5.0
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="px-3.5 pb-3.5 pt-0">
                  <Link
                    href={`/product/${item.handle}`}
                    className="w-full py-1.5 rounded-xl bg-[#F5F0E6] group-hover:bg-[#18181B] text-[#18181B] group-hover:text-white font-bold text-[11px] tracking-wider uppercase transition-colors block text-center border border-[#E8DFC8]"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
