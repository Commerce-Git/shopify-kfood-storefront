"use client";

import { useState, useSyncExternalStore } from "react";
import {
  subscribeWishlist,
  getWishlist,
  getServerWishlistSnapshot,
  toggleWishlist,
} from "@/lib/wishlist";

interface WishlistHeartOverlayProps {
  productId: string;
  productHandle?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Reusable Quiet Luxury Wishlist (Like) Heart Overlay Button
 * - Mobile: Always visible (opacity-100) for touch devices
 * - Desktop: Hidden by default (md:opacity-0), reveals on card hover (md:group-hover:opacity-100)
 * - Favorited: Remains permanently visible (opacity-100 text-[#C25E38])
 * - Tactile: Spring physics pop animation (@keyframes heart-pop)
 * - Safe: Prevents event bubbling to avoid triggering parent Link navigation
 */
export default function WishlistHeartOverlay({
  productId,
  productHandle,
  className = "",
  size = "md",
}: WishlistHeartOverlayProps) {
  const wishlist = useSyncExternalStore(
    subscribeWishlist,
    getWishlist,
    getServerWishlistSnapshot
  );

  const [isPopping, setIsPopping] = useState(false);

  const isSaved =
    wishlist.includes(productId) ||
    Boolean(productHandle && wishlist.includes(productHandle));

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 350);
    toggleWishlist(productId, productHandle);
  };

  const buttonSizeClasses = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`absolute top-2.5 right-2.5 ${buttonSizeClasses} rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#18181B] hover:text-[#C25E38] shadow-xs border border-black/5 hover:border-black/10 transition-all duration-200 active:scale-90 cursor-pointer z-10 before:absolute before:-inset-2 before:content-[''] focus-visible:ring-2 focus-visible:ring-[#C25E38] focus-visible:outline-none focus-visible:opacity-100 focus-visible:pointer-events-auto ${
        isSaved
          ? "opacity-100 text-[#C25E38]"
          : "opacity-100 md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto"
      } ${isPopping ? "animate-heart-pop" : ""} ${className}`}
      aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={isSaved ? "#C25E38" : "none"}
        stroke={isSaved ? "#C25E38" : "currentColor"}
        strokeWidth="2.5"
        className="transition-colors duration-200"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
