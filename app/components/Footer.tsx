import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Collections", href: "/collections" },
    { label: "Wear Tradition", href: "/collections/wear-tradition-jewelry-hair" },
    { label: "Carry Art", href: "/collections/carry-art-bags-wallets" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about" },
    { label: "Partnerships", href: "mailto:jun@blankseoul.com" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "mailto:support@blankseoul.com" },
    { label: "Track Order", href: "/order-lookup" },
    { label: "Feedback", href: "/feedback" },
  ],
  Legal: [
    { label: "Shipping Policy", href: "/policies/shipping" },
    { label: "Return Policy", href: "/policies/returns" },
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Terms of Service", href: "/policies/terms" },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/blankseoul.official/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.86a8.24 8.24 0 004.76 1.51V6.69h-1z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white relative overflow-hidden" id="site-footer">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none z-0">
        <Image
          src="/assets/blank_seoul_symbol.png"
          alt=""
          width={800}
          height={800}
          className="object-contain opacity-50"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span
                className="text-xl font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="gradient-text">Blank</span> Seoul
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Gift a Piece of Korea 🇰🇷
              <br />
              Korea&apos;s trendiest culture — curated and delivered from Seoul.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-4">
          <div className="text-xs text-white/40 space-y-1.5 text-center lg:text-left">
            <p className="mb-3">
              © {new Date().getFullYear()} Blank Palette LLC. All rights reserved.
            </p>
            <p className="opacity-75">
              US: Blank Palette LLC | EIN: 30-1488569 | 30 N Gould St, STE R, Sheridan, WY 82801
            </p>
            <p className="opacity-75 break-keep">
              KR: 마켓토리 | 사업자등록번호: 579-11-02683 | 인천광역시 남동구 남동서로236번길 30, 222-J217호(논현동)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Secure checkout powered by Shopify
          </div>
        </div>
      </div>
    </footer>
  );
}
