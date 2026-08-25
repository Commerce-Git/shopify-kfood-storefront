"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";

const SUB_NAV_LINKS = [
  { href: "/collections/bags-wallets", label: "👜 Bags & Wallets" },
  { href: "/collections/charms-keyrings", label: "✨ Charms & Keyrings" },
  { href: "/collections/jewelry-hair", label: "🎀 Jewelry & Hair" },
  { href: "/collections/home-goods", label: "🍵 Home & Goods" },
  { href: "/collections", label: "👑 Shop All" },
];

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
    const target = document.getElementById("shelf-edc") || document.getElementById("masterpieces");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header id="site-header" className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] border-b border-[#E1E3DF] shadow-2xs">
        {/* Main Search & Brand Bar (Etsy Style) */}
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Brand Logo (Etsy-inspired bold serif craft aesthetic) */}
            <Link href="/" className="flex items-center gap-1 shrink-0 group" id="header-logo">
              <span
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="text-[#C25E38]">BLANK</span>
                <span className="text-[#18181B] ml-1">SEOUL</span>
              </span>
            </Link>

            {/* Center: Full-Width Etsy Search Bar with Orange Circular Search Button */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for handcrafted Korean items, hopae wallets, silk knots..."
                  className="w-full pl-5 pr-12 py-2.5 sm:py-3 rounded-full bg-[#FFFFFF] border-2 border-[#18181B] focus:border-[#C25E38] text-xs sm:text-sm text-[#18181B] placeholder-[#6B7280] focus:outline-none transition-all shadow-2xs font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 p-2 rounded-full bg-[#C25E38] text-white hover:bg-[#A74B28] transition-colors flex items-center justify-center"
                  aria-label="Search"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right: Utility Actions (Sign in/Account, Heart, Cart) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Sign in / Account Action (Global E-Commerce Standard) */}
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
                  {/* Active Session Indicator Dot */}
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </Link>
              ) : (
                <Link
                  href="/account/login"
                  className="text-xs sm:text-sm font-bold text-[#18181B] hover:text-[#C25E38] py-1.5 px-3 rounded-full hover:bg-[#F4EFE6] transition-colors whitespace-nowrap"
                  id="header-signin-link"
                >
                  Sign in
                </Link>
              )}

              {/* Favorites / Wishlist Heart (Etsy Style) */}
              <Link
                href="/#shelf-edc"
                className="relative p-2 rounded-full text-[#18181B] hover:bg-[#F4EFE6] transition-colors"
                id="header-favorites-button"
                aria-label="Favorites"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 bg-[#C25E38] text-white text-[9px] font-black rounded-full flex items-center justify-center">
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-[#18181B] hover:bg-[#F4EFE6]"
                aria-label="Toggle menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            </div>
          </div>
        </div>

        {/* Sub-Nav Category Strip (Etsy Style) */}
        <div className="border-t border-[#F2ECE1] bg-white hidden sm:block">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center gap-8 py-2 overflow-x-auto no-scrollbar">
              {SUB_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-bold text-[#4B5563] hover:text-[#C25E38] transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-72 bg-white p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D6]">
              <span className="text-lg font-black text-[#18181B]">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#6B7280]">✕</button>
            </div>
            <nav className="flex flex-col gap-2 mt-4">
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
              <div className="border-t border-[#F2ECE1] my-2 pt-2" />
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
                Track Order
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
