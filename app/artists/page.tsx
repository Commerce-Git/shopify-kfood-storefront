import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/shopify/api";
import { getEnrichedArtistsWithProducts } from "@/lib/artists";
import ArtistsDirectoryInteractive from "./ArtistsDirectoryInteractive";

export const metadata: Metadata = {
  title: "Verified Seoul Ateliers — Korean Master Craft Studios | Blank Seoul",
  description:
    "Explore our directory of verified independent Korean craft studios. Handcrafted silk embroidery, mother-of-pearl inlay, palace Dancheong art, and Joseon heritage textiles delivered direct from Seoul.",
};

export default async function ArtistsDirectoryPage() {
  const products = await getAllProducts(100);
  const artists = await getEnrichedArtistsWithProducts(products);

  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-[#FBF9F5]">
      {/* 1. Directory Hero Header */}
      <section className="py-12 sm:py-16 border-b border-[#E8DFC8] bg-[#F5F0E6]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E8DFC8] text-xs font-extrabold uppercase tracking-widest text-[#C25E38] mb-4 shadow-2xs">
            <span>🏛️</span> The Seoul Artisan Collective
          </div>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-[#18181B] tracking-tight mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Meet Our Verified Ateliers
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            We partner directly with independent master craft studios across Seoul and Bukchon Hanok Village. Handcrafted in Korea, dispatched directly worldwide.
          </p>
        </div>
      </section>

      {/* 2. Interactive Search, Filter & Studio Grid */}
      <section className="py-12 sm:py-16 max-w-[1360px] mx-auto px-4 sm:px-6">
        <ArtistsDirectoryInteractive artists={artists} />
      </section>

      {/* 3. Partner Inquiry Callout */}
      <section className="py-16 bg-[#1A2F25] text-white border-t border-[#2D4A3E]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4A373] block mb-2">
            Are You a Korean Craft Master?
          </span>
          <h2
            className="text-2xl sm:text-4xl font-serif font-bold text-white mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Share Your Heritage Works with Global Collectors
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed mb-8">
            Blank Seoul provides global logistics, translation, photography, and worldwide distribution for independent Korean craft ateliers.
          </p>
          <a
            href="mailto:contact@blankseoul.com?subject=Atelier%20Partnership%20Inquiry"
            className="inline-block px-8 py-3.5 rounded-full bg-white hover:bg-[#F5F0E6] text-[#18181B] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md"
          >
            Inquire for Studio Partnership →
          </a>
        </div>
      </section>
    </div>
  );
}
