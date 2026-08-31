"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import { getNavLinks, findMatchingShelfId } from "@/lib/config/collections";

const SUB_NAV_LINKS = getNavLinks();

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCart();
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("blank_seoul_wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch {}
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Dynamically find matching shelf DOM ID or navigate to Shop All
    const shelfId = findMatchingShelfId(q);
    const target = shelfId ? document.getElementById(shelfId) : null;

    if (target && pathname === "/") {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/collections`);
    }
  };

  return (
    <>
      <header id="site-header" className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] border-b border-[#E1E3DF] shadow-2xs">
        {/* =========================================================================
            TOP ANNOUNCEMENT STRIP: Simple & Clean Quiet Luxury Free Shipping & Origin Bar
           ========================================================================= */}
        <div className="bg-[#18181B] text-white py-1.5 px-4 text-center border-b border-white/10">
          <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-white/95">
            All products Made in Korea &middot; Free shipping on all orders
          </p>
        </div>

        {/* =========================================================================
            ROW 1: Top Navigation Bar
            - Desktop: [Logo] --- [Wide Search Form] --- [Account | Wishlist | Cart]
            - Mobile:  [Logo] -------------------------- [Account | Wishlist | Cart]
           ========================================================================= */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-2 pb-2 md:py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Brand Logo (2026 Luxury Artisan House Mark) */}
            <Link href="/" className="flex items-center gap-1 shrink-0 group" id="header-logo">
              <span
                className="text-2xl sm:text-[28px] font-black tracking-tight text-[#18181B] group-hover:text-[#C25E38] transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                BLANK SEOUL<span className="text-[#C25E38]">.</span>
              </span>
            </Link>

            {/* Desktop Center: Full-Width Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl relative">
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for Korean artisan goods, hopae wallets, silk knots..."
                  className="w-full pl-5 pr-14 py-2.5 sm:py-3 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] focus:border-[#C25E38] text-xs sm:text-sm text-[#18181B] placeholder-[#6B7280] focus:outline-none transition-all shadow-2xs font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-12 text-xs font-bold text-[#9CA3AF] hover:text-[#18181B] p-1"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 w-9 h-9 rounded-full bg-[#C25E38] text-white hover:bg-[#A74B28] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                  aria-label="Search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right: Actions (Desktop & Mobile Shared Clean Icons) */}
            <div className="flex items-center gap-1 sm:gap-4">
              {/* Sign in / Account Action */}
              {mounted && isLoggedIn ? (
                <Link
                  href="/account"
                  className="relative p-2 rounded-full text-[#18181B] hover:bg-[#F4EFE6] transition-colors flex items-center justify-center group"
                  id="header-account-button"
                  aria-label="My Account"
                  title="My Account"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </Link>
              ) : (
                <>
                  {/* Desktop Text Button */}
                  <Link
                    href="/account/login"
                    className="hidden md:inline-block text-xs sm:text-sm font-bold text-[#18181B] hover:text-[#C25E38] py-1.5 px-3 rounded-full hover:bg-[#F4EFE6] transition-colors whitespace-nowrap"
                    id="header-signin-link"
                  >
                    Sign in
                  </Link>
                  {/* Mobile Clean Icon */}
                  <Link
                    href="/account/login"
                    className="md:hidden p-2 rounded-full text-[#18181B] hover:bg-[#F4EFE6] transition-colors flex items-center justify-center"
                    aria-label="Sign in"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                </>
              )}

              {/* Favorites / Wishlist Heart (Etsy Style) */}
              <Link
                href="/#shelf-bags"
                className="relative p-2 rounded-full text-[#18181B] hover:bg-[#F4EFE6] transition-colors"
                id="header-favorites-button"
                aria-label="Favorites"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#C25E38] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart (Etsy Style with Count Badge) */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full text-[#18181B] hover:bg-[#F4EFE6] transition-colors"
                id="cart-button"
                aria-label="Cart"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#C25E38] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 2 (Mobile ONLY): Etsy-Style Full-Width Search & Hamburger Bar
            - Left: Hamburger Menu Button (☰)
            - Right: Full-width Rounded Search Bar with Circular Orange Submit (🔍)
           ========================================================================= */}
        <div className="md:hidden px-4 pb-3 pt-0.5">
          <div className="flex items-center gap-2">
            {/* Hamburger Menu Button (Etsy Clean Style) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#18181B] hover:bg-[#F4EFE6] rounded-full shrink-0 transition-colors"
              aria-label="Toggle category menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>

            {/* Mobile Full-Width Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full pl-4 pr-11 py-2.5 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] focus:border-[#C25E38] text-xs text-[#18181B] placeholder-[#6B7280] focus:outline-none transition-all shadow-2xs font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-10 text-xs font-bold text-[#9CA3AF] hover:text-[#18181B] p-1"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 w-7 h-7 rounded-full bg-[#C25E38] text-white hover:bg-[#A74B28] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                  aria-label="Search"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* =========================================================================
            ROW 2 (Desktop ONLY): Sub-Nav Category Strip (Quiet Luxury Style)
           ========================================================================= */}
        <div className="border-t border-[#F2ECE1] bg-white hidden md:block">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center gap-8 py-2.5 overflow-x-auto no-scrollbar">
              {SUB_NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-xs tracking-wide transition-colors whitespace-nowrap py-1 group ${
                      isActive
                        ? "text-[#C25E38] font-bold"
                        : "text-[#4B5563] hover:text-[#18181B] font-semibold"
                    }`}
                  >
                    {link.label}
                    {/* Active/Hover Underline Indicator */}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25E38] rounded-full transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Mobile Drawer (Category & Studio Navigation)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-72 bg-white p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D6]">
              <span
                className="text-lg font-black tracking-tight text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                BLANK SEOUL<span className="text-[#C25E38]">.</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#6B7280] font-bold"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 mt-5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9CA3AF] px-3 mb-1">
                Shop Collections
              </span>
              {SUB_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-bold text-[#18181B] rounded-xl hover:bg-[#F4EFE6] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-[#F2ECE1] my-3 pt-3" />

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9CA3AF] px-3 mb-1">
                My Account & Support
              </span>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-bold text-[#18181B] rounded-xl hover:bg-[#F4EFE6] flex items-center gap-2"
              >
                <span>👤</span> {isLoggedIn ? "My Account" : "Sign In / Register"}
              </Link>
              <Link
                href="/order-lookup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-bold text-[#6B7280] rounded-xl hover:bg-[#F4EFE6]"
              >
                📦 Track Order
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-bold text-[#6B7280] rounded-xl hover:bg-[#F4EFE6]"
              >
                💬 FAQ & Help
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
