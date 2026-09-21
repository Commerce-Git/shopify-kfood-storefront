import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/shopify/api";
import { getEnrichedArtistsWithProducts } from "@/lib/artists";
import ArtistsDirectoryInteractive from "./ArtistsDirectoryInteractive";

export const metadata: Metadata = {
  title: "Verified Korean Studios — Master Craft Guild | Blank Seoul",
  description:
    "Explore our directory of verified independent Korean craft studios. Authentic silk embroidery, mother-of-pearl inlay, palace Dancheong art, and Joseon heritage textiles delivered direct from Korea.",
};

export default async function ArtistsDirectoryPage() {
  const products = await getAllProducts(100);
  const artists = await getEnrichedArtistsWithProducts(products);

  return (
    <div className="pt-page-offset min-h-screen bg-[#FBF9F5]">
      {/* 1. Directory Hero Header */}
      <section className="py-12 sm:py-16 border-b border-[#E8DFC8] bg-[#F5F0E6]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#E8DFC8] text-xs font-bold uppercase tracking-widest text-[#C77B4A] mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C77B4A]" /> The Korean Artisan Collective
          </div>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-[#18181B] tracking-tight mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Meet Our Verified Master Studios
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            We partner directly with independent craft studios and master workshops across Korea. Authentically designed and made in Korea, dispatched directly worldwide.
          </p>
        </div>
      </section>

      {/* 2. Interactive Search, Filter & Studio Grid OR Luxury Empty State */}
      <section className="py-12 sm:py-16 max-w-[1360px] mx-auto px-4 sm:px-6">
        {artists.length > 0 ? (
          <ArtistsDirectoryInteractive artists={artists} />
        ) : (
          <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-[#E8DFC8]/60 p-8 max-w-lg mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-4 text-[#C77B4A]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2
              className="text-lg sm:text-xl font-bold text-[#18181B] mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Curating Verified Korean Studios
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-6">
              We are currently onboarding independent Korean master craft studios and verified workshops across Korea. New studio stories will arrive soon.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#C77B4A] text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Explore All Collections ›
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-[#D4D4D8] hover:border-[#18181B] text-[#18181B] text-xs font-semibold transition-colors bg-white shadow-2xs"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 3. Partner Inquiry Callout */}
      <section className="py-16 bg-[#1A2F25] text-white border-t border-[#2D4A3E]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4A373] block mb-2">
            Are You an Independent Korean Maker or Studio?
          </span>
          <h2
            className="text-2xl sm:text-4xl font-serif font-bold text-white mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Share Your Heritage Works with Global Collectors
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed mb-8">
            Blank Seoul provides global logistics, translation, photography, and worldwide distribution for verified Korean craft studios.
          </p>
          <a
            href="mailto:contact@blankseoul.com?subject=Studio%20Partnership%20Inquiry"
            className="inline-block px-8 py-3.5 rounded-full bg-white hover:bg-[#F5F0E6] text-[#18181B] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md"
          >
            Inquire for Studio Partnership →
          </a>
        </div>
      </section>
    </div>
  );
}
