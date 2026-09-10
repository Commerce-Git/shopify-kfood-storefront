"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import { getMegaNavStructure, findMatchingShelfId, MegaNavGroup } from "@/lib/config/collections";

const emptySubscribe = () => () => {};

function getWishlistSnapshot(): number {
  if (typeof window === "undefined") return 0;
  try {
    const saved = localStorage.getItem("blank_seoul_wishlist");
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch {}
  return 0;
}

function subscribeWishlist(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

const MEGA_NAV_GROUPS: MegaNavGroup[] = getMegaNavStructure();

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>("wear");
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { itemCount } = useCart();
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Modern React 19 hydration-safe mount detection
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Modern React 19 storage subscription for wishlist
  const wishlistCount = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, () => 0);

  // Close menus on route changes during render (React official standard: adjusting state on prop/route change)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }

  // 2026 Mobile UX: Prevent background body scroll when mobile drawer is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleImmediateClose = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleImmediateClose();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2026 Luxury Navigation: Dismiss mega menu when user scrolls > 20px
  useEffect(() => {
    if (!activeDropdown) return;
    const initialY = window.scrollY;
    const handleScroll = () => {
      if (Math.abs(window.scrollY - initialY) > 20) {
        handleImmediateClose();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeDropdown]);

  const handleMouseEnter = (id: string) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

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
      {/* 2026 Quiet Luxury Backdrop Scrim: Dims page background & dismisses dropdown on external click */}
      {activeDropdown && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity duration-200 hidden md:block"
          onClick={handleImmediateClose}
          aria-hidden="true"
        />
      )}

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
        <div
          className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-2 pb-2 md:py-3"
          onMouseEnter={handleImmediateClose}
        >
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
                  placeholder="Search for Made in Korea goods, pouches, accessories..."
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
            ROW 2 (Desktop ONLY): 2-Tier Luxury Mega Navigation Bar (Quiet Luxury)
           ========================================================================= */}
        <div className="border-t border-[#F2ECE1] bg-white hidden md:block relative">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center gap-9 py-2.5" role="navigation" aria-label="Main Navigation">
              {/* 3 Lifestyle Super-Categories with Mega Menu */}
              {MEGA_NAV_GROUPS.map((group) => {
                const isCurrentGroupOpen = activeDropdown === group.id;
                const isCurrentPathActive = pathname === group.href || pathname.startsWith(`/collections/${group.id}`);

                return (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(group.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={group.href}
                      className={`inline-flex items-center gap-1.5 text-xs tracking-wider uppercase transition-colors py-1 group font-bold ${
                        isCurrentGroupOpen || isCurrentPathActive
                          ? "text-[#C25E38]"
                          : "text-[#374151] hover:text-[#18181B]"
                      }`}
                      aria-expanded={isCurrentGroupOpen}
                      aria-haspopup="true"
                      onFocus={() => handleMouseEnter(group.id)}
                    >
                      <span>{group.shortLabel}</span>
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isCurrentGroupOpen ? "rotate-180 text-[#C25E38]" : "text-[#9CA3AF] group-hover:text-[#18181B]"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>

                      {/* Active Underline Indicator */}
                      <span
                        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25E38] rounded-full transition-all duration-300 ${
                          isCurrentGroupOpen || isCurrentPathActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  </div>
                );
              })}

              {/* Direct Link: Ateliers */}
              <Link
                href="/artists"
                className={`relative text-xs tracking-wider uppercase transition-colors py-1 group font-bold ${
                  pathname === "/artists" ? "text-[#C25E38]" : "text-[#374151] hover:text-[#18181B]"
                }`}
                onMouseEnter={handleImmediateClose}
                onFocus={handleImmediateClose}
              >
                Ateliers
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25E38] rounded-full transition-all duration-300 ${
                    pathname === "/artists" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>

              {/* Direct Link: Shop All */}
              <Link
                href="/collections"
                className={`relative text-xs tracking-wider uppercase transition-colors py-1 group font-bold ${
                  pathname === "/collections" ? "text-[#C25E38]" : "text-[#374151] hover:text-[#18181B]"
                }`}
                onMouseEnter={handleImmediateClose}
                onFocus={handleImmediateClose}
              >
                Shop All
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25E38] rounded-full transition-all duration-300 ${
                    pathname === "/collections" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            </nav>
          </div>

          {/* =========================================================================
              Desktop Mega Showroom Dropdown Panel (Hitbox Isolated & Safe-Bridge Protected)
             ========================================================================= */}
          {activeDropdown && (
            <div className="absolute left-0 right-0 top-full pt-1.5 z-40 px-4 pointer-events-none">
              {(() => {
                const currentGroup = MEGA_NAV_GROUPS.find((g) => g.id === activeDropdown);
                if (!currentGroup) return null;

                return (
                  <div
                    className="max-w-[1100px] mx-auto bg-white/98 backdrop-blur-md rounded-2xl border border-[#E8DFC8]/80 shadow-2xl p-5 md:p-6 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto relative before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                    onMouseEnter={() => handleMouseEnter(activeDropdown)}
                    onMouseLeave={handleMouseLeave}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        handleImmediateClose();
                      }
                    }}
                  >
                    {/* Top Group Meta Header */}
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#F2ECE1]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                            {currentGroup.title}
                          </h3>
                          <span className="text-xs text-[#71717A] font-medium hidden sm:inline">
                            &middot; {currentGroup.subtitle}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={currentGroup.href}
                        className="text-xs font-bold text-[#C25E38] hover:text-[#A74B28] flex items-center gap-1 group/hub"
                      >
                        <span>View Entire Collection</span>
                        <span className="group-hover/hub:translate-x-0.5 transition-transform">&rarr;</span>
                      </Link>
                    </div>

                    {/* 4-Column Quiet Luxury Artisan Grid (Symmetric & Slim) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {currentGroup.children.map((child) => {
                        const isInStock = child.handle === "jewelry-charms" || child.handle === "ceramics-dining";

                        return (
                          <Link
                            key={child.handle}
                            href={child.href}
                            className="group/item flex items-start gap-3 p-3.5 rounded-xl border border-[#E8DFC8]/50 hover:border-[#C25E38]/50 hover:bg-[#FAF8F5] transition-all shadow-2xs hover:shadow-xs bg-white focus-visible:ring-2 focus-visible:ring-[#C25E38] focus-visible:outline-none"
                          >
                            <span className="text-xl p-2 rounded-lg bg-[#FAF8F5] group-hover/item:bg-white border border-[#E8DFC8]/60 shrink-0 transition-colors">
                              {child.navEmoji}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-xs font-bold text-[#18181B] group-hover/item:text-[#C25E38] transition-colors truncate">
                                  {child.shortLabel}
                                </span>
                                {isInStock ? (
                                  <span className="text-[9px] font-bold text-[#2E5A44] bg-[#F0F6F2] px-1.5 py-0.5 rounded-full border border-[#D1E5D8] shrink-0">
                                    In Stock
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-medium text-[#8C827A] bg-[#FAF6EE] px-1.5 py-0.5 rounded-full border border-[#E8DFC8]/60 shrink-0">
                                    Next Drop
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed">
                                {child.shelfSubtitle}
                              </p>
                            </div>
                          </Link>
                        );
                      })}

                      {/* Ritual & Mood 4th Slot: Custom Studio Commission Card (Maintains 4-Col Symmetry) */}
                      {currentGroup.children.length === 3 && (
                        <Link
                          href="/collections/ritual-mood"
                          className="group/custom flex items-start gap-3 p-3.5 rounded-xl border border-dashed border-[#C25E38]/30 hover:border-[#C25E38] hover:bg-[#FAF8F5] transition-all bg-[#FAF8F5]/40 focus-visible:ring-2 focus-visible:ring-[#C25E38] focus-visible:outline-none"
                        >
                          <span className="text-xl p-2 rounded-lg bg-white group-hover/custom:bg-[#FAF8F5] border border-[#E8DFC8]/70 shrink-0 transition-colors">
                            🍵
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-[#C25E38] group-hover/custom:text-[#A74B28] transition-colors truncate">
                                Studio Commission
                              </span>
                              <span className="text-[9px] font-bold text-[#C25E38] bg-[#C25E38]/10 px-1.5 py-0.5 rounded-full border border-[#C25E38]/20 shrink-0">
                                Inquire
                              </span>
                            </div>
                            <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed">
                              Custom incense sets, meditation bells & bespoke master artisan requests
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>

                    {/* Ultra-Slim Heritage Trust Strip */}
                    <div className="pt-3 mt-3.5 border-t border-[#F2ECE1] flex items-center justify-between text-[11px] text-[#71717A]">
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[#C25E38] font-bold">🇰🇷</span>
                          <span>Made in Korea</span>
                        </span>
                        <span className="hidden sm:inline-block text-[#E8DFC8]">&middot;</span>
                        <span className="hidden sm:flex items-center gap-1.5">
                          <span className="text-[#C25E38] font-bold">✈️</span>
                          <span>Dispatched direct from Korea (Tracked 7–14 days)</span>
                        </span>
                        <span className="hidden md:inline-block text-[#E8DFC8]">&middot;</span>
                        <span className="hidden md:flex items-center gap-1.5">
                          <span className="text-[#C25E38] font-bold">🛡️</span>
                          <span>Central Dispatch 3-Stage Inspection</span>
                        </span>
                      </div>

                      <Link
                        href="/about"
                        className="text-xs font-bold text-[#C25E38] hover:text-[#A74B28] transition-colors shrink-0 flex items-center gap-1 group/craft"
                      >
                        <span>Our Story & Origin</span>
                        <span className="group-hover/craft:translate-x-0.5 transition-transform">&rsaquo;</span>
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          Mobile Drawer (Category Accordions & Studio Navigation)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-80 bg-white p-5 shadow-2xl overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E2D6]">
              <span
                className="text-xl font-black tracking-tight text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                BLANK SEOUL<span className="text-[#C25E38]">.</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#6B7280] font-bold"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Quick Discovery Tags */}
            <div className="pt-3 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9CA3AF] block mb-2">
                Popular Crafts
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href="/collections/jewelry-charms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#C25E38]"
                >
                  ✨ Norigae
                </Link>
                <Link
                  href="/collections/ceramics-dining"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#18181B]"
                >
                  🍶 Celadon
                </Link>
                <Link
                  href="/collections/bags-pouches"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] text-[#18181B]"
                >
                  👜 Hopae
                </Link>
              </div>
            </div>

            {/* Main Navigation Accordions */}
            <nav className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9CA3AF] px-1 mb-1">
                Shop Collections
              </span>

              {MEGA_NAV_GROUPS.map((group) => {
                const isExpanded = expandedMobileGroup === group.id;

                return (
                  <div key={group.id} className="rounded-xl border border-[#E8DFC8]/60 overflow-hidden bg-[#FAF8F5]/40">
                    <button
                      type="button"
                      onClick={() => setExpandedMobileGroup(isExpanded ? null : group.id)}
                      className="w-full flex items-center justify-between px-3.5 py-3 text-left font-bold text-sm text-[#18181B] hover:bg-[#F4EFE6] transition-colors"
                    >
                      <span>{group.title}</span>
                      <svg
                        className={`w-4 h-4 text-[#71717A] transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-[#C25E38]" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 space-y-1 bg-white border-t border-[#F2ECE1]">
                        {group.children.map((child) => {
                          const isInStock = child.handle === "jewelry-charms" || child.handle === "ceramics-dining";

                          return (
                            <Link
                              key={child.handle}
                              href={child.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-[#374151] hover:text-[#C25E38] hover:bg-[#FAF8F5]"
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span>{child.navEmoji}</span>
                                <span className="truncate">{child.title}</span>
                              </span>
                              {isInStock ? (
                                <span className="text-[9px] font-bold text-[#2E5A44] bg-[#F0F6F2] px-1.5 py-0.5 rounded-full border border-[#D1E5D8] shrink-0">
                                  In Stock
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium text-[#8C827A] bg-[#FAF6EE] px-1.5 py-0.5 rounded-full border border-[#E8DFC8]/60 shrink-0">
                                  Next Drop
                                </span>
                              )}
                            </Link>
                          );
                        })}

                        {/* Ritual & Mood: Studio Commission Action */}
                        {group.id === "ritual" && (
                          <Link
                            href="/collections/ritual-mood"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-[#C25E38] hover:bg-[#FAF8F5] border border-dashed border-[#C25E38]/30 mt-1"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span>🍵</span>
                              <span className="truncate">Studio Commission</span>
                            </span>
                            <span className="text-[9px] font-bold text-[#C25E38] bg-[#C25E38]/10 px-1.5 py-0.5 rounded-full border border-[#C25E38]/20 shrink-0">
                              Inquire
                            </span>
                          </Link>
                        )}

                        <Link
                          href={group.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-center text-xs font-bold text-[#C25E38] p-2 mt-1 rounded-lg bg-[#FAF8F5] border border-[#E8DFC8]/60 hover:bg-[#F4EFE6]"
                        >
                          View Entire {group.title} &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Direct Links */}
              <Link
                href="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-sm font-bold text-[#18181B] rounded-xl hover:bg-[#F4EFE6] transition-colors flex items-center justify-between mt-1"
              >
                <span>Shop All Collections</span>
                <span className="text-xs text-[#71717A]">&rsaquo;</span>
              </Link>
              <Link
                href="/artists"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-sm font-bold text-[#18181B] rounded-xl hover:bg-[#F4EFE6] transition-colors flex items-center justify-between"
              >
                <span>Verified Korean Studios</span>
                <span className="text-xs text-[#71717A]">&rsaquo;</span>
              </Link>

              <div className="border-t border-[#F2ECE1] my-2 pt-2" />

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9CA3AF] px-1 mb-1">
                My Account & Support
              </span>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 text-sm font-bold text-[#18181B] rounded-xl hover:bg-[#F4EFE6] flex items-center gap-2"
              >
                <span>👤</span> {isLoggedIn ? "My Account" : "Sign In / Register"}
              </Link>
              <Link
                href="/order-lookup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 text-sm font-bold text-[#6B7280] rounded-xl hover:bg-[#F4EFE6] flex items-center gap-2"
              >
                <span>📦</span> Track Order
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 text-sm font-bold text-[#6B7280] rounded-xl hover:bg-[#F4EFE6] flex items-center gap-2"
              >
                <span>💬</span> FAQ & Help
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
