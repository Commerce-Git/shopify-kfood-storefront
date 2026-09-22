"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import {
  subscribeWishlist,
  getWishlistCountSnapshot,
  getServerWishlistCountSnapshot,
} from "@/lib/wishlist";
import { triggerHaptic } from "@/lib/haptics";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();

  // Wishlist live count using React 19 external store
  const wishlistCount = useSyncExternalStore(
    subscribeWishlist,
    getWishlistCountSnapshot,
    getServerWishlistCountSnapshot
  );

  // 1. Route-aware visibility: Auto-hide on Product Detail Page (PDP)
  // On /product/..., the MobileStickyBottomBar (Buy Box) takes 100% precedence for conversion
  const isPDP = pathname?.startsWith("/product/");
  if (isPDP) {
    return null;
  }

  // Active route helpers
  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/collections");
  const isFavorites = pathname.startsWith("/wishlist");
  const isAccount =
    pathname.startsWith("/account") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/order-lookup");
  const isCart = pathname === "/cart";

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-out select-none"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      <div className="grid grid-cols-5 items-center justify-around h-14 max-w-lg mx-auto px-1">
        {/* 1. Home Tab */}
        <Link
          href="/"
          onClick={() => triggerHaptic(8)}
          className="flex flex-col items-center justify-center py-1 transition-transform active:scale-90"
        >
          <div
            className={`flex items-center justify-center h-8 px-3.5 rounded-full transition-all duration-200 ${
              isHome
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isHome ? (
              // Solid Home
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            ) : (
              // Outline Home
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1V9.5z" />
              </svg>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
              isHome ? "font-bold text-foreground" : "font-medium text-muted-foreground"
            }`}
          >
            Home
          </span>
        </Link>

        {/* 2. Shop Tab */}
        <Link
          href="/collections"
          onClick={() => triggerHaptic(8)}
          className="flex flex-col items-center justify-center py-1 transition-transform active:scale-90"
        >
          <div
            className={`flex items-center justify-center h-8 px-3.5 rounded-full transition-all duration-200 ${
              isShop
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isShop ? (
              // Solid Search/Shop
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Outline Search/Shop
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
              isShop ? "font-bold text-foreground" : "font-medium text-muted-foreground"
            }`}
          >
            Shop
          </span>
        </Link>

        {/* 3. Favorites Tab */}
        <Link
          href="/wishlist"
          onClick={() => triggerHaptic(8)}
          className="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 relative"
        >
          <div
            className={`relative flex items-center justify-center h-8 px-3.5 rounded-full transition-all duration-200 ${
              isFavorites
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFavorites ? (
              // Solid Heart
              <svg
                className="w-5 h-5 text-red-500 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              // Outline Heart
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            )}

            {/* Favorites Badge */}
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold shadow-sm">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
              isFavorites ? "font-bold text-foreground" : "font-medium text-muted-foreground"
            }`}
          >
            Favorites
          </span>
        </Link>

        {/* 4. You Tab */}
        <Link
          href="/account"
          onClick={() => triggerHaptic(8)}
          className="flex flex-col items-center justify-center py-1 transition-transform active:scale-90"
        >
          <div
            className={`flex items-center justify-center h-8 px-3.5 rounded-full transition-all duration-200 ${
              isAccount
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAccount ? (
              // Solid User
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Outline User
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
              isAccount ? "font-bold text-foreground" : "font-medium text-muted-foreground"
            }`}
          >
            You
          </span>
        </Link>

        {/* 5. Cart Tab (Triggers CartDrawer directly) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(12);
            setIsCartOpen(true);
          }}
          aria-label="Open shopping cart"
          className="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 relative"
        >
          <div
            className={`relative flex items-center justify-center h-8 px-3.5 rounded-full transition-all duration-200 ${
              isCart
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {/* Cart Icon */}
            {isCart ? (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h14.5a.75.75 0 000-1.5H5.78a2.25 2.25 0 012.18-1.75h10.05a2.25 2.25 0 002.176-1.685l1.644-6.575a.75.75 0 00-.728-.94H5.197L4.743 3.093A1.875 1.875 0 002.925 1.5H2.25z" />
                <path d="M7.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm12 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            )}

            {/* Cart Badge with Etsy-like vibrant accent */}
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#E05338] text-white text-[9px] font-bold shadow-sm animate-in zoom-in-75 duration-200">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
              isCart ? "font-bold text-foreground" : "font-medium text-muted-foreground"
            }`}
          >
            Cart
          </span>
        </button>
      </div>
    </nav>
  );
}
