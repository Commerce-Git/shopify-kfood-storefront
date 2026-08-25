"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getArtistSlug } from "@/lib/artists";

export interface EtsyCardItem {
  id: string;
  title: string;
  handle: string;
  artist: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: string;
}

interface EtsyHorizontalShelfProps {
  id?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  items: EtsyCardItem[];
  viewAllHref?: string;
}

export default function EtsyHorizontalShelf({
  id,
  badge,
  title,
  subtitle,
  items,
  viewAllHref = "/collections",
}: EtsyHorizontalShelfProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blank_seoul_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const checkScrollPosition = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 20);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollPosition();
    el.addEventListener("scroll", checkScrollPosition, { passive: true });
    window.addEventListener("resize", checkScrollPosition);
    return () => {
      el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [items]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
    <section className="py-6 sm:py-8 bg-[#FFFFFF]" id={id}>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Etsy Shelf Header: Badge & Title on Left, [View all] on Right */}
        <div className="flex items-end justify-between mb-4 gap-4">
          <div>
            {badge && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-[#C25E38] mb-1">
                {badge}
              </span>
            )}
            <h2
              className="text-xl sm:text-2xl font-bold text-[#18181B] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#6B7280] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="px-4 py-1.5 rounded-full border border-[#222222] text-xs font-bold text-[#18181B] hover:bg-[#F5F0E6] transition-colors shadow-2xs shrink-0 mb-1"
          >
            View all
          </Link>
        </div>

        {/* Carousel Container with Floating Left / Right Arrows */}
        <div className="relative group/carousel">
          {/* Floating Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute -left-3 sm:-left-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#18181B]/90 hover:bg-[#18181B] text-white flex items-center justify-center shadow-xl transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Floating Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute -right-3 sm:-right-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#18181B]/90 hover:bg-[#18181B] text-white flex items-center justify-center shadow-xl transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Horizontal Scroll Track */}
          <div
            ref={scrollContainerRef}
            className="flex items-start gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
          >
            {items.map((item) => {
              const isSaved = wishlist.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="w-[170px] sm:w-[210px] lg:w-[225px] shrink-0 snap-start flex flex-col group cursor-pointer"
                >
                  {/* Square Image Card with Smooth Rounded Corners & Heart Button */}
                  <Link
                    href={`/product/${item.handle}`}
                    className="relative block aspect-square rounded-2xl overflow-hidden bg-[#F5F0E6] border border-[#E8DFC8] shadow-2xs group-hover:shadow-md transition-all"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 170px, 225px"
                      className="object-cover transition-transform duration-500 group-hover:scale-106"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/6 transition-colors" />

                    {/* Wishlist Heart Icon (Etsy Style) */}
                    <button
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#18181B] hover:text-[#C25E38] shadow-xs transition-transform active:scale-90"
                      aria-label="Wishlist"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={isSaved ? "#C25E38" : "none"}
                        stroke={isSaved ? "#C25E38" : "currentColor"}
                        strokeWidth="2.5"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </Link>

                  {/* Etsy Info: 1-line Truncated Title & Green USD Price */}
                  <div className="mt-2.5 px-0.5">
                    <h3
                      className="text-xs sm:text-sm font-medium text-[#18181B] leading-tight line-clamp-1 group-hover:underline"
                      title={item.title}
                    >
                      <Link href={`/product/${item.handle}`}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Pricing (Etsy Format: Green bold USD price + strikethrough original) */}
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className={`text-xs sm:text-sm font-bold ${item.originalPrice ? "text-[#15803D]" : "text-[#18181B]"}`}>
                        USD {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[11px] text-[#6B7280] line-through font-normal">
                          USD {item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
