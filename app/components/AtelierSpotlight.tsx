"use client";

import Image from "next/image";
import Link from "next/link";

interface Atelier {
  slug: string;
  name: string;
  nameEn: string;
  discipline: string;
  avatar: string;
}

interface AtelierSpotlightProps {
  artists?: Array<{
    slug: string;
    name: string;
    nameEn: string;
    avatar: string;
  }>;
}

export default function AtelierSpotlight({ artists }: AtelierSpotlightProps) {
  if (!artists || artists.length === 0) {
    return null;
  }

  const displayAteliers = artists;
  return (
    <section className="py-10 sm:py-14 bg-[#F5F0E6] border-y border-[#E8DFC8]" id="ateliers">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-[#C25E38] mb-1">
              <span>🏛️</span> Verified Independent Ateliers
            </span>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Meet the Seoul Masters
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Tap any atelier to explore their dedicated authentic Korean studio collection.
            </p>
          </div>

          <Link
            href="/artists"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-[#18181B] text-xs font-bold text-[#18181B] hover:bg-[#18181B] hover:text-white transition-all shadow-2xs self-start sm:self-end shrink-0"
          >
            <span>Explore All Ateliers</span>
            <span>→</span>
          </Link>
        </div>

        {/* Circular Avatars Row (Instagram Story / Etsy Style) */}
        <div className="flex items-center justify-start sm:justify-center gap-6 sm:gap-10 lg:gap-14 overflow-x-auto no-scrollbar py-2">
          {displayAteliers.map((atelier) => (
            <Link
              key={atelier.slug}
              href={`/artists/${atelier.slug}`}
              className="group flex flex-col items-center shrink-0 text-center"
            >
              {/* Circular Avatar Container */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 border-[#E8DFC8] group-hover:border-[#C25E38] p-1 bg-white shadow-2xs group-hover:shadow-lg transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF8F5]">
                  <Image
                    src={atelier.avatar}
                    alt={atelier.name}
                    fill
                    sizes="(max-width: 640px) 80px, 112px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Atelier Name (English Only) */}
              <div className="mt-2.5 max-w-[110px] sm:max-w-[130px]">
                <h3
                  className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#C25E38] transition-colors truncate"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {atelier.nameEn || atelier.name}
                </h3>
              </div>
            </Link>
          ))}

          {/* + View All Ateliers Circle */}
          <Link
            href="/artists"
            className="group flex flex-col items-center shrink-0 text-center"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 border-dashed border-[#C25E38]/60 group-hover:border-[#C25E38] p-1 bg-white/70 group-hover:bg-white shadow-2xs group-hover:shadow-lg transition-all duration-300 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#F5F0E6] group-hover:bg-[#C25E38] flex flex-col items-center justify-center transition-colors">
                <span className="text-lg sm:text-xl text-[#C25E38] group-hover:text-white transition-colors">🏛️</span>
                <span className="text-[10px] font-bold text-[#18181B] group-hover:text-white transition-colors mt-0.5">
                  View All
                </span>
              </div>
            </div>

            <div className="mt-2.5 max-w-[110px] sm:max-w-[130px]">
              <h3 className="text-xs sm:text-sm font-bold text-[#18181B] group-hover:text-[#C25E38] transition-colors truncate">
                All Studios
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
