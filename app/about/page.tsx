import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story — Curated in Seoul, Made in Korea | Blank Seoul",
  description:
    "Discover how Blank Seoul connects global shoppers with authentic Made in Korea lifestyle goods and design accessories, inspected in Seoul and dispatched direct from South Korea.",
  openGraph: {
    title: "Our Story — Curated in Seoul, Made in Korea",
    description:
      "Everyday design objects and lifestyle essentials, crafted with uncompromising Korean manufacturing standards and dispatched directly from Seoul.",
    images: ["/assets/korean_silk_taegeukgi_luxury_texture.jpg"],
  },
};

const PROTOCOL_STEPS = [
  {
    step: "01",
    title: "Domestic Origin Verification",
    subtitle: "Direct partnership with verified domestic makers",
    description:
      "We partner exclusively with authentic South Korean manufacturers, independent designers, and certified domestic studios committed to superior materials and enduring craftsmanship. Every piece is designed and made in South Korea.",
    tag: "Verified Domestic Origin",
  },
  {
    step: "02",
    title: "Seoul Hub 3-Stage Physical QC",
    subtitle: "Barcode scanning & structural inspection in Seoul",
    description:
      "Every single item arrives at our central Seoul fulfillment facility before international dispatch. Our team conducts barcode verification, physical inspection, stitching, and material finishing checks, ensuring flawless standards before clearing items for global export.",
    tag: "Seoul Quality Hub",
  },
  {
    step: "03",
    title: "Tracked Korea Post Air Express",
    subtitle: "Dispatched direct from Incheon to your doorstep",
    description:
      "Orders are secured in custom protective packaging and dispatched directly from South Korea via Korea Post (K-Packet / EMS) with end-to-end international air tracking straight to your hands.",
    tag: "Direct Air Express",
  },
];

const VALUE_PILLARS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C25E38]">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 12h10" />
        <path d="M12 7v10" />
      </svg>
    ),
    title: "Made in Korea",
    description:
      "Every product is authentically designed and manufactured in South Korea. We provide an uncompromising domestic origin guarantee, celebrating the tactile precision and durability of authentic Korean production.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C25E38]">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "Curated in Seoul",
    description:
      "Directly selected from Seoul's vibrant design scene. Clean aesthetics, modern functionality, and everyday objects crafted for contemporary life.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C25E38]">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    title: "Direct Air Express Dispatch",
    description:
      "All packages fly directly from South Korea with legitimate international tracking. Real-time visibility from our Seoul hub straight to your doorstep.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C25E38]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "30-Day Safe Delivery Guarantee",
    description:
      "Shop cross-border with complete peace of mind. If your package arrives damaged or encounters transit issues, we replace or refund it immediately with zero return hassle.",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-24 sm:pt-32 bg-[#FAF8F5] min-h-screen text-[#18181B] overflow-x-hidden">
      {/* Schema.org JSON-LD Structured Data for AboutPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Our Story — Blank Seoul",
            description:
              "Discover how Blank Seoul connects global shoppers with authentic Made in Korea lifestyle goods and design accessories, inspected in Seoul and dispatched direct from South Korea.",
            url: "https://blankseoul.com/about",
            publisher: {
              "@type": "Organization",
              name: "Blank Seoul",
              url: "https://blankseoul.com",
              logo: "https://blankseoul.com/icon.png",
              description:
                "Curated in Seoul · Made in Korea. Direct cross-border lifestyle and design objects.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "KR",
                addressLocality: "Seoul",
              },
            },
          }),
        }}
      />

      {/* =========================================================================
          SECTION 1: HIGH-IMPACT HERO BANNER
          - Dark Charcoal Backdrop (#141416) with Warm Glow
          - Confident & Dignified Brand Tone
         ========================================================================= */}
      <section className="relative bg-[#141416] text-white py-14 sm:py-24 px-4 sm:px-6 overflow-hidden border-b border-[#E8DFC8]/20">
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,94,56,0.18),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,163,115,0.1),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 max-w-[1100px] mx-auto text-center">
          {/* Overline Badge (Mobile-Safe Wrap) */}
          <div className="inline-flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider sm:tracking-widest text-[#E8DFC8] mb-5 sm:mb-6 max-w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C25E38] animate-pulse shrink-0" />
            <span>🇰🇷 Made in Korea</span>
            <span className="text-white/40">&middot;</span>
            <span>Dispatched Direct from Seoul</span>
          </div>

          {/* Main Headline with text-balance for mobile perfection */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.18] text-white mb-5 sm:mb-6 text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Curated in Seoul, <br className="hidden sm:inline" />
            <span className="text-[#C25E38]">Made in Korea.</span>
          </h1>

          {/* Mission Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed font-normal mb-8 sm:mb-10 text-pretty">
            Everyday design objects and lifestyle essentials, crafted with uncompromising Korean manufacturing standards and dispatched directly from our Seoul hub to your door.
          </p>

          {/* 3 Quick Proof Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-8 pt-6 border-t border-white/10 text-xs sm:text-sm text-[#E8DFC8] font-semibold">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[#C25E38]">🇰🇷</span> South Korean Manufacturing Origin
            </span>
            <span className="hidden sm:inline text-white/20">&middot;</span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[#C25E38]">✈️</span> Tracked Korea Post Air Express
            </span>
            <span className="hidden sm:inline text-white/20">&middot;</span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[#C25E38]">🛡️</span> Seoul Central 3-Stage QC
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE ORIGIN STORY (POSITIVE & DIGNIFIED FRAMING)
          - Celebrating Korean Design Spirit, Meticulous Finishing, and Everyday Beauty
         ========================================================================= */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: The Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#C25E38]">
              <span>Our Origin Story</span>
              <span>&mdash;</span>
              <span>Bridging Seoul to the World</span>
            </div>

            <h2
              className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight leading-tight text-balance"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The Enduring Standard of Genuine Korean Craftsmanship.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#4B5563] leading-relaxed">
              <p>
                Korean culture and contemporary design have resonated deeply across the globe. From minimalist interior objects to everyday accessories, admirers worldwide have fallen in love with the refined simplicity, calm balance, and thoughtful aesthetics of modern Korean living.
              </p>
              <p>
                In Seoul, good design is never superficial. It is rooted in an uncompromising standard of manufacturing &mdash; durable domestic textiles, meticulous stitching, clean functional lines, and objects built to be lived with and cherished every single day.
              </p>
              <blockquote className="p-4 sm:p-5 rounded-2xl bg-white border-l-4 border-[#C25E38] shadow-2xs italic text-[#18181B] font-medium text-sm sm:text-base">
                &ldquo;We founded Blank Seoul with a singular vision: to bring the authentic, tactile excellence of South Korean manufacturing directly from our Seoul hub to design enthusiasts worldwide.&rdquo;
              </blockquote>
              <p>
                <strong>Blank Seoul</strong> serves as that direct bridge. We curate exceptional domestic designers, verified makers, and certified manufacturers across Korea, barcode-verify and inspect every single piece in Seoul, and dispatch them directly via Korea Post Air Express straight to your hands.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Proof (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-[#E8DFC8]">
              <Image
                src="/assets/korean_silk_taegeukgi_luxury_texture.jpg"
                alt="Made in Korea - Natural Korean Silk Woven Taegeukgi"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

              {/* Floating Quote Card (Mobile Sized) */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-5 sm:left-5 sm:right-5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-[#E8DFC8] shadow-lg">
                <p className="text-xs text-[#18181B] font-bold leading-snug mb-1">
                  &ldquo;True Korean quality is felt in the hands &mdash; durable, thoughtful, and built to last.&rdquo;
                </p>
                <span className="text-[11px] text-[#C25E38] font-bold block">
                  &mdash; Blank Seoul Curation &amp; Dispatch Hub &middot; Seoul
                </span>
              </div>
            </div>

            {/* Subtle decorative background accent */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#C25E38]/10 rounded-full blur-2xl -z-10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE 3-STAGE AUTHENTICITY & DIRECT DISPATCH PROTOCOL
          - Dignified Proof: How we guarantee domestic origin and safe arrival
         ========================================================================= */}
      <section className="py-14 sm:py-24 bg-[#FFFFFF] border-y border-[#E8DFC8]/60">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#C25E38] block mb-2">
              Uncompromising Quality &middot; Direct Dispatch
            </span>
            <h2
              className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight mb-3 sm:mb-4 text-balance"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The 3-Stage Authenticity &amp; Dispatch Protocol
            </h2>
            <p className="text-sm sm:text-base text-[#71717A] leading-relaxed">
              From verified domestic production to your hands &mdash; how we guarantee every item is authentic Made in Korea and delivered safely across oceans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {PROTOCOL_STEPS.map((step) => (
              <article
                key={step.step}
                className="flex flex-col justify-between p-5 sm:p-8 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8]/80 shadow-2xs hover:shadow-md transition-shadow duration-300 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <span
                      className="text-2xl sm:text-3xl font-black text-[#C25E38]/30 group-hover:text-[#C25E38] transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {step.step}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E5A44] bg-[#F0F6F2] border border-[#D1E5D8] px-2.5 py-0.5 rounded-full">
                      {step.tag}
                    </span>
                  </div>

                  <h3
                    className="text-base sm:text-xl font-bold text-[#18181B] mb-1.5"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.title}
                  </h3>
                  <span className="text-xs font-semibold text-[#C25E38] block mb-2.5 sm:mb-3">
                    {step.subtitle}
                  </span>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#E8DFC8]/50 flex items-center gap-2 text-xs font-bold text-[#18181B]">
                  <span className="w-2 h-2 rounded-full bg-[#C25E38]" />
                  <span>Guaranteed by Blank Seoul Hub</span>
                </div>
              </article>
            ))}
          </div>

          {/* Seoul Dispatch Packaging Proof Callout */}
          <div className="mt-10 sm:mt-14 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-4 relative aspect-[16/11] rounded-xl sm:rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/assets/hanji_paper_luxury_wrapping.jpg"
                alt="Carefully packaged goods prepared for international air dispatch in Seoul"
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="lg:col-span-8 space-y-2.5 sm:space-y-3">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#2E5A44] bg-[#F0F6F2] border border-[#D1E5D8] px-2.5 py-0.5 rounded-full inline-block">
                Careful Hub Packaging
              </span>
              <h3
                className="text-lg sm:text-2xl font-bold text-[#18181B] text-balance"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Every Order is Individually Inspected &amp; Packed in Korea.
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                We take packaging as seriously as product selection. Every order is barcode-scanned at our central Korea facility, secured in high-grade shock-absorbent cushioning, and dispatched with official documentation confirming verified South Korean origin. Your items arrive safely and pristine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FOUR CORE BRAND PILLARS
          - Mobile: 1-column to 2-column fluid grid
         ========================================================================= */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 max-w-[1240px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#C25E38] block mb-2">
            Our Commitments
          </span>
          <h2
            className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight mb-3 sm:mb-4 text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            What Sets Blank Seoul Apart
          </h2>
          <p className="text-sm sm:text-base text-[#71717A] leading-relaxed">
            A dedicated cross-border gateway connecting authentic South Korean domestic manufacturing and contemporary design directly with the world.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {VALUE_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8DFC8]/70 shadow-2xs hover:border-[#C25E38]/50 hover:shadow-xs transition-all"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-center mb-3.5 sm:mb-4 shadow-2xs">
                {pillar.icon}
              </div>
              <h3
                className="text-base font-bold text-[#18181B] mb-1.5 sm:mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: HIGH-CONVERTING DUAL ACTION CTA (SALES FUNNEL)
          - Action-Oriented 1st-Person CTAs (Russell Brunson Framework)
          - Mobile: Full width thumb buttons + active tactile states
         ========================================================================= */}
      <section className="py-14 sm:py-22 px-4 sm:px-6 bg-[#141416] text-white text-center border-t border-[#E8DFC8]/20">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-bold text-[#E8DFC8] border border-white/15">
            <span>✨ Authentic Korean Quality</span>
          </div>

          <h2
            className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Bring Authentic Korean Living <br className="hidden sm:inline" />
            Into Your Everyday Space.
          </h2>

          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            Curated in Seoul and Made in Korea, inspected in our Korea hub, and delivered safely to your door with tracked international express.
          </p>

          {/* Action-Oriented 1st-Person Dual Buttons (Mobile Thumb Ergonomics) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-2 sm:pt-4">
            <Link
              href="/collections"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-[#C25E38] text-white font-bold text-sm sm:text-base hover:bg-[#A74B28] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 select-none"
            >
              <span>Explore Made in Korea</span>
              <span>&rarr;</span>
            </Link>

            <Link
              href="/artists"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-white/10 text-white font-bold text-sm sm:text-base hover:bg-white/20 active:scale-[0.98] border border-white/20 transition-all flex items-center justify-center gap-2 select-none"
            >
              <span>Meet Verified Korean Studios</span>
              <span>&rsaquo;</span>
            </Link>
          </div>

          {/* Guarantee / Safe Shopping Bar */}
          <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-white/60 font-medium">
            <span>✓ South Korean Origin Guaranteed</span>
            <span>✓ Tracked Korea Post Air Express</span>
            <span>✓ 30-Day Safe Delivery Guarantee</span>
          </div>
        </div>
      </section>
    </main>
  );
}
