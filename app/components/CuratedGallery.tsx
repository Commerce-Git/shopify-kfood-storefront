"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { formatPrice, isProductSoldOut } from "@/lib/shopify/api";

interface MasterpieceItem {
  id: string;
  title: string;
  handle: string;
  artist: string;
  category: "wallets" | "bags" | "charms";
  price: string;
  material: string;
  image: string;
  badge?: string;
  description: string;
  reviewCount: number;
  available: boolean;
}

const FALLBACK_12_MASTERPIECES: MasterpieceItem[] = [
  // 1. Wallets & EDC
  {
    id: "m-01",
    title: "Joseon Heritage Hopae Wallet",
    handle: "joseon-heritage-hopae-wallet",
    artist: "까마귀수장고",
    category: "wallets",
    price: "38.00",
    material: "Genuine Cowhide Leather & Brass",
    image: "/assets/hopae_wallet_gift_box.jpg",
    badge: "Master Signature",
    description: "Handcrafted leather wallet inspired by Joseon identification Hopae tablets with a royal silk knot tassel.",
    reviewCount: 48,
    available: true,
  },
  {
    id: "m-02",
    title: "Mini Hopae Heritage Card Case",
    handle: "mini-hopae-heritage-card-case",
    artist: "까마귀수장고",
    category: "wallets",
    price: "36.00",
    material: "Structured Vegetable Leather",
    image: "/assets/hopae_wallet_gift_box.jpg",
    badge: "Daily Essential",
    description: "Compact traditional card holder with snap closure and historical Korean crest detailing.",
    reviewCount: 32,
    available: true,
  },
  {
    id: "m-03",
    title: "Joseon Peony Pattern Card Wallet",
    handle: "joseon-peony-pattern-card-wallet",
    artist: "바늘꽃라라비",
    category: "wallets",
    price: "24.00",
    material: "Embroidered Cotton & Metal Loop",
    image: "/assets/idus-products/02860993e6b34e69a1758066e39b9abd_512.jpg",
    badge: "Heritage Silk",
    description: "Fine blue porcelain peony pattern card wallet with dedicated key loop.",
    reviewCount: 29,
    available: true,
  },
  {
    id: "m-04",
    title: "Traditional Knot Ddaenggi Keyring",
    handle: "traditional-knot-ddaenggi-keyring",
    artist: "까마귀수장고",
    category: "wallets",
    price: "28.00",
    material: "Silk Thread & Brass Hardware",
    image: "/assets/korean_craft_matte_packaging.jpg",
    badge: "Best Seller",
    description: "Chrysanthemum knot ribbon charm woven with authentic Joseon hair ribbon heritage.",
    reviewCount: 54,
    available: true,
  },

  // 2. Bags & Pouches
  {
    id: "m-05",
    title: "Korean Dual Transform Bag",
    handle: "korean-dual-transform-bag",
    artist: "바늘꽃라라비",
    category: "bags",
    price: "34.00",
    material: "Dense Canvas & Traditional Cord",
    image: "/assets/ecobag_belly_band_packaging.jpg",
    badge: "Multiform Utility",
    description: "Versatile handcrafted bag that morphs from an everyday tote into a structured traditional shoulder pouch.",
    reviewCount: 41,
    available: true,
  },
  {
    id: "m-06",
    title: "Hunminjeongeum Reversible Drawstring Bag",
    handle: "hunminjeongeum-reversible-drawstring-bag",
    artist: "바늘꽃라라비",
    category: "bags",
    price: "29.00",
    material: "Reversible Cotton with Hangul Calligraphy",
    image: "/assets/idus-products/cd2619e7f712472d82816db297940c32_512.jpg",
    badge: "Hangul Heritage",
    description: "Two-way drawstring bag featuring King Sejong's original 1446 alphabet script.",
    reviewCount: 36,
    available: true,
  },
  {
    id: "m-07",
    title: "Bokjumeoni 3D Lucky Pouch",
    handle: "bokjumeoni-3d-lucky-pouch",
    artist: "바늘꽃라라비",
    category: "bags",
    price: "22.00",
    material: "Korean Jacquard Fabric",
    image: "/assets/idus-products/f942852c8316492482b7fafc0a949ff6_512.jpg",
    badge: "Good Fortune",
    description: "Traditional fortune pouch sculpted with geometric folds and vibrant contrasting linings.",
    reviewCount: 27,
    available: true,
  },
  {
    id: "m-08",
    title: "Square Heritage Cosmetic Pouch",
    handle: "square-heritage-cosmetic-pouch",
    artist: "바늘꽃라라비",
    category: "bags",
    price: "24.00",
    material: "Padded Traditional Textile",
    image: "/assets/idus-products/cd2619e7f712472d82816db297940c32_512.jpg",
    badge: "Everyday Carry",
    description: "Spacious organizer pouch decorated with timeless Korean lattice and floral embroidery.",
    reviewCount: 19,
    available: true,
  },

  // 3. Charms & Accents
  {
    id: "m-09",
    title: "Dancheong Pony Keyring Strap",
    handle: "dancheong-pony-keyring-strap",
    artist: "미유",
    category: "charms",
    price: "18.00",
    material: "PU Leather & Metal Alloy",
    image: "/assets/idus-products/0520a9fbd8ba4fa0bb34437cae0fe442_512.jpg",
    badge: "Palace Art",
    description: "Charming silhouette pony strap adorned with five-color Dancheong palace temple pigment art.",
    reviewCount: 52,
    available: true,
  },
  {
    id: "m-10",
    title: "Subok Silver Foil Lucky Charm",
    handle: "subok-silver-foil-lucky-charm",
    artist: "까마귀수장고",
    category: "charms",
    price: "18.00",
    material: "Genuine Silver Leaf & Silk Tassel",
    image: "/assets/korean_craft_matte_packaging.jpg",
    badge: "Longevity & Fortune",
    description: "Traditional Korean character charm pressed with lustrous silver foil wishing health and happiness.",
    reviewCount: 38,
    available: true,
  },
  {
    id: "m-11",
    title: "Dancheong Silk Tassel Keyring",
    handle: "dancheong-silk-tassel-keyring",
    artist: "미유",
    category: "charms",
    price: "18.00",
    material: "Hand-dyed Silk & Brass Clasps",
    image: "/assets/idus-products/1c313831722948b594d6f897d458109f_512.jpg",
    badge: "Vibrant Accent",
    description: "Gradient silk tassel charm inspired by royal banquets and palace roof architecture.",
    reviewCount: 45,
    available: true,
  },
  {
    id: "m-12",
    title: "Joseon Lattice Knot Charm — Gold Edition",
    handle: "joseon-lattice-knot-charm",
    artist: "미유",
    category: "charms",
    price: "22.00",
    material: "Gold-Plated Brass & Cotton Canvas",
    image: "/assets/korean_craft_matte_packaging.jpg",
    badge: "Hanok Geometry",
    description: "Graphic art charm harmonizing chrysanthemum knots with Hanok window grid patterns.",
    reviewCount: 31,
    available: true,
  },
];

interface CuratedGalleryProps {
  products?: ShopifyProduct[];
}

export default function CuratedGallery({ products = [] }: CuratedGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "wallets" | "bags" | "charms">("all");
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blank_seoul_wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = wishlist.includes(id)
      ? wishlist.filter((item) => item !== id)
      : [...wishlist, id];
    setWishlist(updated);
    try {
      localStorage.setItem("blank_seoul_wishlist", JSON.stringify(updated));
    } catch {}
  };

  // Merge live Shopify products if present
  const displayItems = useMemo(() => {
    if (!products || products.length === 0) {
      return FALLBACK_12_MASTERPIECES;
    }

    return products.map((sp, idx) => {
      const fallback = FALLBACK_12_MASTERPIECES[idx % FALLBACK_12_MASTERPIECES.length];
      const imageUrl = sp.images?.edges?.[0]?.node?.url || fallback.image;
      const priceStr = sp.variants?.edges?.[0]?.node?.price?.amount
        ? formatPrice(sp.variants.edges[0].node.price.amount)
        : fallback.price;

      let cat: "wallets" | "bags" | "charms" = "charms";
      const tagsStr = (sp.tags || []).join(" ").toLowerCase();
      const titleLower = sp.title.toLowerCase();
      if (tagsStr.includes("wallet") || titleLower.includes("wallet") || titleLower.includes("hopae")) {
        cat = "wallets";
      } else if (tagsStr.includes("bag") || titleLower.includes("bag") || titleLower.includes("pouch")) {
        cat = "bags";
      }

      return {
        id: sp.id || fallback.id,
        title: sp.title || fallback.title,
        handle: sp.handle || fallback.handle,
        artist: sp.vendor || fallback.artist,
        category: cat,
        price: priceStr,
        material: fallback.material,
        image: imageUrl,
        badge: fallback.badge,
        description: sp.description || fallback.description,
        reviewCount: fallback.reviewCount,
        available: !isProductSoldOut(sp),
      };
    });
  }, [products]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return displayItems;
    return displayItems.filter((item) => item.category === selectedCategory);
  }, [displayItems, selectedCategory]);

  return (
    <section className="py-12 sm:py-16 bg-[#FBF9F5]" id="masterpieces">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Idus-Style Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-[#E8E2D6] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#18181B] tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Curated for You: Seoul Ateliers
              </h2>
              <span className="text-[10px] font-bold text-[#C25E38] bg-[#F4EFE6] px-2 py-0.5 rounded-md border border-[#E8E2D6]">
                100% Handcrafted
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              Personal creations directly from independent Bukchon and Seoul master craft studios.
            </p>
          </div>

          {/* Interactive Category Filter Pills (Idus style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { key: "all", label: `All (${displayItems.length})` },
              { key: "wallets", label: "Wallets & EDC" },
              { key: "bags", label: "Bags & Pouches" },
              { key: "charms", label: "Charms" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.key
                    ? "bg-[#18181B] text-white"
                    : "bg-white text-[#6B7280] border border-[#E8E2D6] hover:text-[#18181B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Idus Signature 4 to 5 Column Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const isSaved = wishlist.includes(item.id);
            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8E2D6] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image with Heart Wishlist Icon */}
                  <Link href={`/product/${item.handle}`} className="relative block aspect-square overflow-hidden bg-[#F4EFE6]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-106"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors" />

                    {/* Top Left Badge */}
                    {item.badge && (
                      <div className="absolute top-2.5 left-2.5 bg-[#18181B]/85 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                        {item.badge}
                      </div>
                    )}

                    {/* Top Right Heart Wishlist Icon (Idus Style) */}
                    <button
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#18181B] hover:text-[#C25E38] shadow-xs transition-transform active:scale-90"
                      aria-label="Wishlist"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isSaved ? "#C25E38" : "none"}
                        stroke={isSaved ? "#C25E38" : "currentColor"}
                        strokeWidth="2.5"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {!item.available && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[11px] font-bold uppercase px-2.5 py-1 rounded-md">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Idus Card Content: [공방명 >] -> [작품명] -> [가격 & 평점] */}
                  <div className="p-3.5 sm:p-4">
                    {/* Line 1: Atelier Name with Chevron (Idus Style) */}
                    <Link
                      href="/#ateliers"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6B7280] hover:text-[#C25E38] transition-colors mb-1"
                    >
                      <span>{item.artist}</span>
                      <span className="text-[10px] text-[#9CA3AF]">›</span>
                    </Link>

                    {/* Line 2: Product Title */}
                    <h3
                      className="text-xs sm:text-sm font-bold text-[#18181B] leading-snug line-clamp-2 group-hover:text-[#C25E38] transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <Link href={`/product/${item.handle}`}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Line 3: Price & Rating */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F2ECE1]">
                      <span className="text-sm sm:text-base font-black text-[#18181B]">
                        ${item.price}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#15803D]">
                        <span>★ 5.0</span>
                        <span className="text-[#9CA3AF] text-[10px]">({item.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Quick View Button */}
                <div className="px-3.5 pb-3.5 pt-0">
                  <Link
                    href={`/product/${item.handle}`}
                    className="w-full py-2 rounded-xl bg-[#F4EFE6] group-hover:bg-[#18181B] text-[#18181B] group-hover:text-white font-bold text-[11px] tracking-wider uppercase transition-colors block text-center border border-[#E8E2D6]"
                  >
                    View Piece →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Idus Bundle Promotion Banner */}
        <div id="bundle-offer" className="mt-14 bg-gradient-to-br from-[#1A2F25] to-[#112019] rounded-3xl p-6 sm:p-8 text-white border border-[#2D4A3E] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C25E38]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#C25E38] text-white text-[10px] font-black uppercase tracking-widest mb-2">
                Seoul Curation Box Event
              </span>
              <h3
                className="text-xl sm:text-2xl lg:text-3xl font-black text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Pick Any 3 Works & Receive Free Hanji Gift Wrap
              </h3>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                Mix and match any 3 handcrafted pieces across our verified ateliers. We consolidate them into a luxury Mulberry Hanji gift box with free tracked international express.
              </p>
            </div>

            <Link
              href="/#masterpieces"
              className="px-6 py-3 rounded-xl bg-[#C25E38] hover:bg-[#A74B28] text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-lg whitespace-nowrap"
            >
              Mix & Match 3 Works →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
