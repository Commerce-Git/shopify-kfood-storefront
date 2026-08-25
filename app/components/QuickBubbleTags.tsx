"use client";

import Link from "next/link";

interface BubbleTag {
  label: string;
  emoji: string;
  href: string;
  highlight?: boolean;
}

const ROW_1_TAGS: BubbleTag[] = [
  { label: "Seoul Box 3-Pack", emoji: "🧧", href: "/#masterpieces", highlight: true },
  { label: "Joseon Hopae Wallets", emoji: "✨", href: "/#masterpieces" },
  { label: "Transform Bags & Pouches", emoji: "🧵", href: "/#masterpieces" },
  { label: "Royal Silk Knot Charms", emoji: "🗝️", href: "/#masterpieces" },
  { label: "100% Mulberry Hanji Wrap", emoji: "🌿", href: "/#unboxing" },
  { label: "Meet All 3 Ateliers", emoji: "🏛️", href: "/#ateliers" },
];

const ROW_2_TAGS: BubbleTag[] = [
  { label: "The 12 Masterpieces", emoji: "👑", href: "/#masterpieces" },
  { label: "Gifts Under $30", emoji: "🎁", href: "/#masterpieces" },
  { label: "Dancheong Temple Pigments", emoji: "🏮", href: "/#masterpieces" },
  { label: "Direct Seoul Dispatch", emoji: "✈️", href: "/policies/shipping" },
  { label: "Handcrafted in Seoul", emoji: "🇰🇷", href: "/#masterpieces" },
  { label: "5.0 Verified Reviews", emoji: "⭐", href: "/#masterpieces" },
];

export default function QuickBubbleTags() {
  return (
    <section className="py-5 bg-[#FBF9F5] border-b border-[#E8E2D6]/60">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-2.5 items-center justify-center">
          {/* Row 1 */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {ROW_1_TAGS.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border shadow-2xs ${
                  tag.highlight
                    ? "bg-[#C25E38] text-white border-[#C25E38] hover:bg-[#A74B28]"
                    : "bg-white text-[#374151] border-[#E8E2D6] hover:bg-[#F4EFE6] hover:text-[#18181B] hover:border-[#D8D0C0]"
                }`}
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </Link>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {ROW_2_TAGS.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#374151] border border-[#E8E2D6] hover:bg-[#F4EFE6] hover:text-[#18181B] hover:border-[#D8D0C0] transition-all duration-200 shadow-2xs"
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
