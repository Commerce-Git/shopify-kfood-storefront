"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArtistWithProducts } from "@/lib/artists";

export default function ArtistsDirectoryInteractive({
  artists,
}: {
  artists: ArtistWithProducts[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtists = useMemo(() => {
    return artists.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const prof = item.profile;
      if (!q) return true;
      return (
        prof.name.toLowerCase().includes(q) ||
        prof.nameEn.toLowerCase().includes(q) ||
        prof.location.toLowerCase().includes(q)
      );
    });
  }, [artists, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Clean Artist Search Bar Only */}
      <div className="max-w-xl mx-auto">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artist by studio name..."
            className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white border-2 border-[#18181B] focus:border-[#C25E38] text-sm text-[#18181B] placeholder-[#9CA3AF] focus:outline-none transition-all shadow-2xs font-medium"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#18181B]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9CA3AF] hover:text-[#18181B] p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-[#6B7280] max-w-6xl mx-auto px-2">
        <span>
          Showing <span className="text-[#18181B] font-extrabold">{filteredArtists.length}</span> verified ateliers
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#C25E38] hover:underline font-bold"
          >
            Reset search
          </button>
        )}
      </div>

      {/* Pure Circular Artist Profile Grid (No Card Covers, No Tags) */}
      {filteredArtists.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFC8] max-w-xl mx-auto">
          <span className="text-4xl mb-3 block">🔍</span>
          <h3 className="text-lg font-bold text-[#18181B]">No Ateliers Found</h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Try searching with a different studio name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {filteredArtists.map(({ profile, worksCount }) => (
            <Link
              key={profile.slug}
              href={`/artists/${profile.slug}`}
              className="group flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#E8DFC8]"
            >
              {/* Circular Profile Avatar */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#E8DFC8] group-hover:border-[#C25E38] p-1 bg-white shadow-2xs group-hover:shadow-md transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF8F5]">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Studio Name (English Only) */}
              <div className="mt-3 w-full">
                <h3
                  className="text-sm font-bold text-[#18181B] group-hover:text-[#C25E38] transition-colors truncate"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {profile.nameEn || profile.name}
                </h3>
                {worksCount > 0 && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-[#C25E38] bg-[#FBF9F5] px-2.5 py-0.5 rounded-full border border-[#E8DFC8]">
                    {worksCount} {worksCount === 1 ? "Work" : "Works"}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
