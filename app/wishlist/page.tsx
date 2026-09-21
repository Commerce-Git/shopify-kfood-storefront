"use client";

import React, { useState, useEffect, useSyncExternalStore, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getWishlist,
  getServerWishlistSnapshot,
  subscribeWishlist,
  toggleWishlist,
} from "@/lib/wishlist";
import { useArtistFollow } from "@/lib/hooks/useArtistFollow";
import { useCart } from "@/app/components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { getArtistBySlug } from "@/lib/artists";
import ArtistFollowButton from "@/app/components/ArtistFollowButton";
import type { WishlistProductItem } from "@/app/api/wishlist-products/route";

function HeartIcon({
  filled = false,
  className = "w-3.5 h-3.5",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? "0" : "1.75"}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StudioVaseIcon({
  className = "w-3.5 h-3.5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Authentic Joseon Moon Jar (달항아리) Silhouette */}
      <path d="M8 3.5h8" />
      <path d="M8.8 3.5C7 5.5 4 8.5 4 12.5c0 4.5 3.5 7.5 4.8 8h6.4c1.3-.5 4.8-3.5 4.8-8 0-4-3-7-4.8-9" />
      <path d="M8.5 20.5h7" />
    </svg>
  );
}

function WishlistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const { followedSlugs } = useArtistFollow();

  const tabParam = searchParams.get("tab");
  const activeTab: "saved" | "studios" = tabParam === "studios" ? "studios" : "saved";

  const wishlistHandles = useSyncExternalStore(
    subscribeWishlist,
    getWishlist,
    getServerWishlistSnapshot
  );

  const [products, setProducts] = useState<WishlistProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // 1. Fetch live product data whenever wishlist items change
  useEffect(() => {
    if (wishlistHandles.length === 0) {
      setProducts([]);
      return;
    }

    let isCancelled = false;
    const fetchWishlistProducts = async () => {
      setLoadingProducts(true);
      try {
        const queryItems = wishlistHandles.join(",");
        const res = await fetch(`/api/wishlist-products?items=${encodeURIComponent(queryItems)}`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (data.success && !isCancelled) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.warn("[Wishlist Page] Failed to fetch product details:", err);
      } finally {
        if (!isCancelled) {
          setLoadingProducts(false);
        }
      }
    };

    fetchWishlistProducts();
    return () => {
      isCancelled = true;
    };
  }, [wishlistHandles]);

  // 2. Fetch signature works for followed partner studios
  const [studioWorks, setStudioWorks] = useState<Record<string, WishlistProductItem[]>>({});
  const [loadingStudioWorks, setLoadingStudioWorks] = useState(false);

  useEffect(() => {
    if (followedSlugs.length === 0) {
      setStudioWorks({});
      return;
    }

    let isCancelled = false;
    const fetchStudioWorks = async () => {
      setLoadingStudioWorks(true);
      try {
        const querySlugs = followedSlugs.join(",");
        const res = await fetch(
          `/api/wishlist-products?artistSlugs=${encodeURIComponent(querySlugs)}`
        );
        if (!res.ok) throw new Error("Failed to load studio works");
        const data = await res.json();
        if (data.success && !isCancelled) {
          setStudioWorks(data.studioWorks || {});
        }
      } catch (err) {
        console.warn("[Wishlist Page] Failed to fetch studio works:", err);
      } finally {
        if (!isCancelled) {
          setLoadingStudioWorks(false);
        }
      }
    };

    fetchStudioWorks();
    return () => {
      isCancelled = true;
    };
  }, [followedSlugs]);

  const handleTabChange = (tab: "saved" | "studios") => {
    router.replace(`/wishlist?tab=${tab}`, { scroll: false });
  };

  const handleAddToCart = (product: WishlistProductItem) => {
    addToCart({
      variantId: product.variantId,
      productHandle: product.handle,
      title: product.title,
      variantTitle: product.variantTitle,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setIsCartOpen(true);

    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2500);
  };

  const handleMoveAllToCart = () => {
    const inStockProducts = products.filter((p) => p.availableForSale);
    if (inStockProducts.length === 0) return;

    inStockProducts.forEach((product) => {
      addToCart({
        variantId: product.variantId,
        productHandle: product.handle,
        title: product.title,
        variantTitle: product.variantTitle,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    });

    setIsCartOpen(true);
  };

  const handleRemoveItem = (product: WishlistProductItem) => {
    toggleWishlist(product.id, product.handle, user?.id);
  };

  const savedCount = wishlistHandles.length;
  const followedCount = followedSlugs.length;
  const inStockCount = products.filter((p) => p.availableForSale).length;

  return (
    <div className="flex-1 bg-[#FAF8F5] pb-20">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#71717A] mb-4">
          <Link href="/" className="hover:text-[#18181B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#18181B] font-semibold">My Curation</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E8DFC8]/60">
          <div>
            <h1
              className="text-2xl sm:text-4xl font-extrabold text-[#18181B] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              My Curation & Followed Studios
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1.5 max-w-2xl">
              Review your personal collection of saved Korean artisan pieces and manage VIP priority drop alerts for verified craft studios.
            </p>
          </div>

          {/* Segmented Dual Tabs (2026 Quiet Luxury Micro-Pill Design) */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8DFC8] rounded-full shadow-2xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleTabChange("saved")}
              className={`group px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]/20 ${
                activeTab === "saved"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5]"
              }`}
            >
              <HeartIcon
                filled={activeTab === "saved"}
                className={
                  activeTab === "saved"
                    ? "w-3.5 h-3.5 text-[#C25E38]"
                    : "w-3.5 h-3.5 text-[#71717A] group-hover:text-[#18181B] transition-colors"
                }
              />
              <span>Saved Pieces</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight leading-none transition-colors ${
                  activeTab === "saved"
                    ? "bg-white/20 text-white"
                    : "bg-[#F4EFE6] text-[#71717A] group-hover:bg-[#EAE4D9]"
                }`}
              >
                {savedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("studios")}
              className={`group px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]/20 ${
                activeTab === "studios"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5]"
              }`}
            >
              <StudioVaseIcon
                className={
                  activeTab === "studios"
                    ? "w-3.5 h-3.5 text-white"
                    : "w-3.5 h-3.5 text-[#71717A] group-hover:text-[#18181B] transition-colors"
                }
              />
              <span>Followed Studios</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight leading-none transition-colors ${
                  activeTab === "studios"
                    ? "bg-white/20 text-white"
                    : "bg-[#F4EFE6] text-[#71717A] group-hover:bg-[#EAE4D9]"
                }`}
              >
                {followedCount}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SAVED WORKS (좋아요 한 작품)                        */}
        {/* ========================================================= */}
        {activeTab === "saved" && (
          <div className="mt-8">
            {/* Top Batch Bar when items exist */}
            {products.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8DFC8]/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#18181B]">
                    {products.length} {products.length === 1 ? "Curated Piece" : "Curated Pieces"}
                  </span>
                  <span className="text-[#E8DFC8]">|</span>
                  <span className="text-[#71717A]">
                    {inStockCount} available for immediate dispatch
                  </span>
                </div>

                {inStockCount >= 2 && (
                  <button
                    type="button"
                    onClick={handleMoveAllToCart}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5 text-white shrink-0"
                      aria-hidden="true"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span>Move All In-Stock to Cart ({inStockCount})</span>
                  </button>
                )}
              </div>
            )}

            {/* Skeleton Loading State */}
            {loadingProducts && products.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-[#E8DFC8]/60 animate-pulse space-y-3">
                    <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Saved Products Grid */}
            {products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => {
                  const isInCart = addedItemIds[product.id];

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-[#E8DFC8]/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container + Remove Toggle */}
                        <div className="relative w-full aspect-square bg-[#FAF8F5] overflow-hidden">
                          {product.image?.url ? (
                            <Image
                              src={product.image.url}
                              alt={product.image.altText || product.title}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <StudioVaseIcon className="w-10 h-10 text-[#D4C8B8]" />
                            </div>
                          )}

                          {/* Remove from Wishlist Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(product)}
                            aria-label={`Remove ${product.title} from saved pieces`}
                            title="Remove from saved pieces"
                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#C25E38] shadow-xs border border-black/5 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#C25E38" stroke="#C25E38" strokeWidth="2.5">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>

                          {/* Stock Status Pill */}
                          {!product.availableForSale && (
                            <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-900/80 backdrop-blur-xs text-white">
                              Sold Out
                            </span>
                          )}
                        </div>

                        {/* Card Details */}
                        <div className="p-3.5 sm:p-4">
                          <Link
                            href={`/artists/${product.artistSlug}`}
                            className="text-[11px] font-bold text-[#C25E38] hover:underline uppercase tracking-wider block truncate"
                          >
                            {product.artistName}
                          </Link>
                          <Link
                            href={`/product/${product.handle}`}
                            className="text-xs sm:text-sm font-bold text-[#18181B] hover:text-[#C25E38] transition-colors mt-1 block line-clamp-2 leading-snug"
                          >
                            {product.title}
                          </Link>
                          <p className="text-xs sm:text-sm font-extrabold text-[#18181B] mt-2">
                            {product.price}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: 1-Click Add to Cart */}
                      <div className="p-3.5 sm:p-4 pt-0">
                        {product.availableForSale ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-[#C25E38] text-white transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <span>{isInCart ? "✓ Added to Cart" : "+ Add to Cart"}</span>
                          </button>
                        ) : (
                          <Link
                            href={`/product/${product.handle}`}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors text-center block"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active Discovery Empty State */}
            {!loadingProducts && products.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#E8DFC8]/80 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-4 text-[#C25E38] shadow-2xs">
                  <HeartIcon className="w-7 h-7 text-[#C25E38]" />
                </div>
                <h2
                  className="text-xl sm:text-2xl font-bold text-[#18181B]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Your Curated Collection is Waiting
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] mt-2 leading-relaxed">
                  You haven&apos;t saved any artisan pieces yet. Browse our curated Korean master craft collections and tap the heart icon on any work you&apos;d like to save.
                </p>
                <div className="mt-6 flex items-center justify-center">
                  <Link
                    href="/collections"
                    className="btn-primary px-8 py-3.5 rounded-full text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Explore Curated Collections →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FOLLOWED STUDIOS (팔로우한 작가 공방)               */}
        {/* ========================================================= */}
        {activeTab === "studios" && (
          <div className="mt-8">
            {followedSlugs.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {/* 1. Personalized Collection Header (idus benchmark) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8DFC8]/60">
                  <div>
                    <h2
                      className="text-base sm:text-lg font-bold text-[#18181B]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      You are following {followedSlugs.length} partner studio{followedSlugs.length === 1 ? "" : "s"}
                    </h2>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      Private drop alerts and new curation releases are active for these studios.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#A1A1AA] self-start sm:self-auto">
                    {followedSlugs.length} Studio{followedSlugs.length === 1 ? "" : "s"} in Collection
                  </span>
                </div>

                {/* 2. Horizontal Atelier Showcase Cards */}
                <div className="space-y-4 sm:space-y-6">
                  {followedSlugs.map((slug) => {
                    const profile = getArtistBySlug(slug);
                    const isBlankSeoul = slug === "blank-seoul";
                    const works = studioWorks[slug] || [];

                    return (
                      <div
                        key={slug}
                        className="bg-white rounded-3xl border border-[#E8DFC8]/80 p-4 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center gap-3.5 sm:gap-7"
                      >
                        {/* Left Column: Mobile = 1 Single Sleek Header Row, Desktop = 28% Column with Right Border */}
                        <div className="md:w-[28%] shrink-0 flex flex-row items-center justify-between md:flex-col md:items-start md:justify-between md:border-r border-[#E8DFC8]/60 pb-3 md:pb-0 md:pr-6 border-b md:border-b-0 border-[#E8DFC8]/40 gap-3">
                          {/* Unified Creator Profile Hit Area (Avatar + Studio Name) */}
                          <Link
                            href={`/artists/${slug}`}
                            className="group/studio flex items-center gap-3 transition-all cursor-pointer select-none min-w-0 active:scale-[0.98]"
                            aria-label={`Visit ${profile.name} atelier page`}
                          >
                            {/* Studio Avatar / Symbol */}
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl sm:rounded-2xl bg-[#FAF8F5] border border-[#E8DFC8] overflow-hidden shrink-0 flex items-center justify-center shadow-2xs group-hover/studio:border-[#18181B]/40 group-hover/studio:scale-[1.02] transition-all">
                              {isBlankSeoul ? (
                                <Image
                                  src="/assets/blank_seoul_symbol.png"
                                  alt={profile.name}
                                  fill
                                  sizes="52px"
                                  className="object-contain p-1.5"
                                />
                              ) : profile.avatar ? (
                                <Image
                                  src={profile.avatar}
                                  alt={profile.name}
                                  fill
                                  sizes="52px"
                                  className="object-cover"
                                />
                              ) : (
                                <StudioVaseIcon className="w-5 h-5 md:w-6 md:h-6 text-[#A1A1AA]" />
                              )}
                            </div>

                            {/* Studio Name */}
                            <div className="min-w-0">
                              <h3
                                className="text-sm sm:text-base md:text-lg font-bold text-[#18181B] group-hover/studio:text-[#C25E38] transition-colors truncate"
                                style={{ fontFamily: "var(--font-heading)" }}
                              >
                                {profile.name}
                              </h3>
                            </div>
                          </Link>

                          {/* Follow Button: Sits on the right in mobile 1-row, drops below on desktop */}
                          <div className="shrink-0 md:mt-4 md:pt-3 md:border-t md:border-[#E8DFC8]/40 flex items-center">
                            <ArtistFollowButton
                              artistSlug={slug}
                              artistName={profile.name}
                              variant="compact"
                            />
                          </div>
                        </div>

                        {/* Right Column: Clean Gallery 3 Signature Works Showcase (72% on desktop, maximized photo size) */}
                        <div className="md:w-[72%] flex-1">
                          {works.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                              {works.map((work) => (
                                <Link
                                  key={work.id}
                                  href={`/product/${work.handle}`}
                                  className="group flex flex-col cursor-pointer active:scale-[0.97] transition-transform select-none"
                                >
                                  {/* Clean Edge-to-Edge Image Container (Expanded surface area) */}
                                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#E8DFC8]/70 shadow-2xs mb-2 group-hover:border-[#18181B]/40 group-hover:shadow-xs transition-all">
                                    {work.image?.url ? (
                                      <Image
                                        src={work.image.url}
                                        alt={work.image.altText || work.title}
                                        fill
                                        sizes="(max-width: 768px) 33vw, 25vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[#D4D4D8]">
                                        <StudioVaseIcon className="w-6 h-6" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 px-0.5">
                                    <h4 className="text-[11px] sm:text-xs font-semibold text-[#18181B] truncate group-hover:text-[#C25E38] transition-colors">
                                      {work.title}
                                    </h4>
                                    <p className="text-[11px] sm:text-xs font-bold text-[#18181B] mt-0.5">
                                      {work.price}
                                    </p>
                                  </div>
                                </Link>
                              ))}

                              {/* If fewer than 3 works, clean subtle placeholder */}
                              {Array.from({ length: Math.max(0, 3 - works.length) }).map((_, idx) => (
                                <div
                                  key={`placeholder-${idx}`}
                                  className="bg-[#FAF8F5]/60 rounded-2xl border border-dashed border-[#E8DFC8]/80 flex flex-col items-center justify-center text-center aspect-square p-2 shadow-2xs"
                                >
                                  <StudioVaseIcon className="w-5 h-5 text-[#C25E38]/40 mb-1" />
                                  <span className="text-[10px] font-medium text-[#71717A]">Upcoming Drop</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-[#FAF8F5]/80 rounded-2xl border border-[#E8DFC8]/70 p-6 text-center">
                              <p className="text-xs text-[#71717A]">Curated studio works arriving soon.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Quiet Luxury Minimalist Empty State for Studios */
              <div className="bg-white rounded-3xl border border-[#E8DFC8]/80 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-4 text-[#C25E38] shadow-2xs">
                  <StudioVaseIcon className="w-7 h-7 text-[#C25E38]" />
                </div>
                <h2
                  className="text-xl sm:text-2xl font-bold text-[#18181B]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  No Studio Drops Followed Yet
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] mt-2 leading-relaxed">
                  Follow verified Korean master craft studios to receive exclusive first-look priority alerts on small-batch studio releases before public availability.
                </p>
                <div className="mt-6 flex items-center justify-center">
                  <Link
                    href="/artists"
                    className="btn-primary px-8 py-3.5 rounded-full text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Explore Verified Studios →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 bg-[#FAF8F5] flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      }
    >
      <WishlistContent />
    </Suspense>
  );
}
