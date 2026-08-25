import Link from "next/link";
import Image from "next/image";

const TRUST_PILLARS = [
  {
    icon: "🏛️",
    title: "100% Verified Ateliers",
    description: "Direct from independent Korean craft masters",
  },
  {
    icon: "✈️",
    title: "Tracked Express Dispatch",
    description: "Sent direct from Seoul Hub with tracking",
  },
  {
    icon: "🔒",
    title: "256-Bit SSL Checkout",
    description: "Secure payments powered by Shopify",
  },
  {
    icon: "🛡️",
    title: "30-Day Safe Delivery",
    description: "Dedicated global customer support",
  },
];

const FOOTER_SHOP = [
  { label: "Bags & Wallets", href: "/collections/bags-wallets" },
  { label: "Charms & Keyrings", href: "/collections/charms-keyrings" },
  { label: "Jewelry & Hair", href: "/collections/jewelry-hair" },
  { label: "Home & Goods", href: "/collections/home-goods" },
  { label: "Shop All Collections", href: "/collections" },
  { label: "Verified Seoul Ateliers", href: "/artists" },
];

const FOOTER_LEGAL = [
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Return & Refund Policy", href: "/policies/returns" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms of Service", href: "/policies/terms" },
];

const FOOTER_SUPPORT = [
  { label: "Track Your Order", href: "/order-lookup" },
  { label: "FAQ & Help Center", href: "/faq" },
  { label: "Contact Support", href: "mailto:support@blankseoul.com" },
  { label: "My Account & Orders", href: "/account" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/blankseoul.official/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@blankseoul.official",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.86a8.24 8.24 0 004.76 1.51V6.69h-1z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#141416] text-white relative overflow-hidden border-t border-white/10" id="site-footer">
      {/* 1. Pre-Footer 4-Pillar Trust Strip */}
      <div className="border-b border-white/10 bg-[#18181B]/60">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {TRUST_PILLARS.map((pillar) => (
              <div key={pillar.title} className="flex items-start gap-3.5">
                <span className="text-2xl shrink-0 p-2 rounded-xl bg-white/5 border border-white/10">
                  {pillar.icon}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Columns */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Identity Column (4 Cols on desktop) */}
          <div className="md:col-span-4 flex flex-col justify-between gap-6">
            <div>
              <Link href="/" className="inline-block mb-3.5">
                <span
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <span className="text-[#C25E38]">BLANK</span>
                  <span className="text-white ml-1.5">SEOUL</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
                Direct from Verified Seoul Ateliers 🇰🇷
                <br />
                Connecting independent master Korean craft studios with collectors and enthusiasts worldwide.
              </p>
            </div>

            {/* Social Media Links */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 block mb-2.5">
                Follow Our Studios
              </span>
              <div className="flex gap-2.5">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C25E38] text-white/80 hover:text-white flex items-center justify-center transition-all duration-200"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link Columns (8 Cols on desktop: 3 clean sub-columns with Customer Care on far right) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Col 1: Shop Collections */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/40 mb-3.5">
                Shop Collections
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_SHOP.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/70 hover:text-[#C25E38] transition-colors duration-150 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 2: Policies & Legal */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/40 mb-3.5">
                Policies & Legal
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LEGAL.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/70 hover:text-[#C25E38] transition-colors duration-150 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Customer Care (Rightmost Terminal Anchor) */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/40 mb-3.5">
                Customer Care
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_SUPPORT.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/70 hover:text-[#C25E38] transition-colors duration-150 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar: Business Registration, Payment Badges & Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6">
          {/* Business Info */}
          <div className="text-[11px] text-white/40 space-y-1 text-center lg:text-left">
            <p className="font-semibold text-white/60 mb-2">
              © {new Date().getFullYear()} Blank Palette LLC. All rights reserved.
            </p>
            <p>
              US: Blank Palette LLC · EIN: 30-1488569 · 30 N Gould St, STE R, Sheridan, WY 82801
            </p>
            <p className="break-keep">
              KR: 마켓토리 · 사업자등록번호: 579-11-02683 · 인천광역시 남동구 남동서로236번길 30, 222-J217호(논현동)
            </p>
          </div>

          {/* Global Payment Badges & Shopify Checkout */}
          <div className="flex flex-col items-center lg:items-end gap-2.5 shrink-0">
            {/* Clean SVG Payment Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {/* Visa */}
              <div className="h-6 px-2 rounded bg-white/90 text-[#1A1F71] flex items-center justify-center font-black text-[10px] tracking-wider shadow-2xs">
                VISA
              </div>
              {/* Mastercard */}
              <div className="h-6 px-2 rounded bg-white/90 text-[#EB001B] flex items-center justify-center font-black text-[10px] tracking-wider shadow-2xs">
                MC
              </div>
              {/* AMEX */}
              <div className="h-6 px-2 rounded bg-white/90 text-[#006FCF] flex items-center justify-center font-black text-[10px] tracking-wider shadow-2xs">
                AMEX
              </div>
              {/* Apple Pay */}
              <div className="h-6 px-2 rounded bg-white/90 text-[#000000] flex items-center justify-center font-bold text-[10px] shadow-2xs">
                 Pay
              </div>
              {/* Google Pay */}
              <div className="h-6 px-2 rounded bg-white/90 text-[#5F6368] flex items-center justify-center font-bold text-[10px] shadow-2xs">
                G Pay
              </div>
              {/* PayPal */}
              <div className="h-6 px-2 rounded bg-white/90 text-[#003087] flex items-center justify-center font-bold text-[10px] shadow-2xs">
                PayPal
              </div>
              {/* Shop Pay */}
              <div className="h-6 px-2 rounded bg-[#5A31F4] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                shop
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-white/50">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>Encrypted 256-Bit Checkout powered by Shopify</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
