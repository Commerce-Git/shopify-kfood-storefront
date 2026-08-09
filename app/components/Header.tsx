"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";

const NAV_LINKS = [
  { href: "/#featured-products", label: "The Collection" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isNavFolded, setIsNavFolded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCart();
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();

  const isSolidHeader = scrolled || pathname !== "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY <= 20) {
        // At the very top: always unfold!
        setIsNavFolded(false);
      } else {
        if (currentScrollY > lastScrollY + 2) {
          // Scrolling DOWN: fold menu!
          setIsNavFolded(true);
        } else if (currentScrollY < lastScrollY - 2) {
          // Scrolling UP: unfold menu!
          setIsNavFolded(false);
        }
      }

      lastScrollY = Math.max(0, currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
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

  return (
    <>
      <header
        id="site-header"
        className={`
          fixed top-0 left-0 right-0 z-50 transition-colors duration-300
          ${
            isSolidHeader
              ? "bg-[#0A140F]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
              : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
          }
        `}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Row 1 — CHANEL Style Top Tier: Centered Royal Brand Mark & Action Icons */}
          <div className="grid grid-cols-3 items-center h-16 sm:h-20">
            {/* Left Balance Spacer */}
            <div className="flex items-center justify-start" />

            {/* Center — CHANEL-Style Royal Centered Logo */}
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="flex items-center gap-1 group"
                id="header-logo"
              >
                <span
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-widest uppercase transition-transform group-hover:scale-105 text-center"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <span className="bg-gradient-to-r from-[#F5D0A9] via-[#E8AA70] to-[#C77B4A] bg-clip-text text-transparent">
                    BLANK
                  </span>
                  <span className="text-white ml-2">SEOUL</span>
                </span>
              </Link>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center justify-end gap-2 sm:gap-4">
              {/* User Account Link */}
              <Link
                href={mounted && isLoggedIn ? "/account" : "/account/login"}
                className="hidden md:flex p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                id="header-user-profile-link"
                aria-label="Account"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                id="cart-button"
                aria-label="Open cart"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#C77B4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-full text-white hover:bg-white/10 transition-colors"
                id="mobile-menu-button"
                aria-label="Toggle menu"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
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

          {/* Row 2 — CHANEL Style Bottom Tier: Desktop Smooth Collapsible Centered Navigation Bar */}
          <div
            style={{
              height: isNavFolded ? "0px" : "44px",
              opacity: isNavFolded ? 0 : 1,
              overflow: "hidden",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              borderTop: isNavFolded ? "1px solid transparent" : "1px solid rgba(255, 255, 255, 0.1)",
              pointerEvents: isNavFolded ? "none" : "auto",
            }}
            className="hidden md:flex items-center justify-center"
          >
            <nav className="flex items-center justify-center gap-10 h-full" id="desktop-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-bold tracking-widest uppercase text-white/80 hover:text-[#F5D0A9] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-full w-72 bg-[#0F1A15] border-l border-white/10 text-white shadow-2xl
          transform transition-transform duration-300 ease-out md:hidden
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
        id="mobile-menu-drawer"
      >
        <div className="pt-24 px-6">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-bold tracking-wider uppercase text-white/90 rounded-xl hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-base font-bold tracking-wider uppercase text-white/90 rounded-xl hover:bg-white/10 transition-colors border-t border-white/10 mt-2 pt-4 flex items-center gap-2"
            >
              <span>👤</span> {isLoggedIn ? "My Account" : "Sign In / Register"}
            </Link>
          </nav>
          <div className="mt-8 pt-8 border-t border-white/10">
            <Link
              href="/#featured-products"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full text-center block"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
