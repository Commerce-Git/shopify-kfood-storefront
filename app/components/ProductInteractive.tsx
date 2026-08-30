"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { formatPrice, getProductImages } from "@/lib/shopify/api";
import { getArtistSlug, getArtistBySlug } from "@/lib/artists";
import ProductGallery from "./ProductGallery";
import AddToCartSection from "./AddToCartSection";
import MobileStickyBottomBar from "./MobileStickyBottomBar";
import ProductViewsBadge from "./ProductViewsBadge";
import ProductTrustAccordions from "./ProductTrustAccordions";

interface ProductInteractiveProps {
  product: ShopifyProduct;
  isPreview?: boolean;
}

const HIGHLIGHTS = [
  {
    icon: "🇰🇷",
    text: "Made in Korea",
  },
  {
    icon: "✈️",
    text: "Direct Seoul Dispatch · Tracked shipping (7–14 days)",
  },
  {
    icon: "🛡️",
    text: "Delivery Protection · Damage & loss covered",
  },
];

export default function ProductInteractive({ product, isPreview = false }: ProductInteractiveProps) {
  const buyBoxRef = useRef<HTMLDivElement>(null);
  const images = getProductImages(product);
  const artistProfile = getArtistBySlug(getArtistSlug(product.vendor || ""));
  const artistDisplayName = artistProfile.nameEn || product.vendor || "Seoul Master";

  // Helper to ignore query parameters when matching URLs
  const stripQuery = (url: string) => url.split('?')[0];

  // Extract variant-specific image URLs to isolate them
  const variantImageUrls = new Set(
    product.variants.edges
      .map((edge) => edge.node.image?.url ? stripQuery(edge.node.image.url) : null)
      .filter((url): url is string => !!url)
  );

  const hasMultipleVariantsWithImages = product.variants.edges.length > 1 && variantImageUrls.size > 0;

  // Gallery images for top gallery:
  // If product HAS multiple variant images: show ONLY unique variant images in top gallery.
  // Deduplicate by stripped URL so identical photos across variants (e.g. Small/Medium) don't duplicate.
  const seenGalleryUrls = new Set<string>();
  const galleryImages = (hasMultipleVariantsWithImages
    ? images.filter((img) => variantImageUrls.has(stripQuery(img.url)))
    : [images[0]]
  ).filter((img) => {
    if (!img?.url) return false;
    const key = stripQuery(img.url);
    if (seenGalleryUrls.has(key)) return false;
    seenGalleryUrls.add(key);
    return true;
  });

  // Detailed images for bottom lookbook stack:
  // Strictly excludes any image that belongs to a variant or is already in the top gallery.
  // If the product only has variant photos (no pure lookbook photos), detailedImages will be empty and auto-hide!
  const detailedImages = images.filter((img) => {
    const key = stripQuery(img.url);
    if (variantImageUrls.has(key)) return false;
    if (galleryImages.some((gImg) => stripQuery(gImg.url) === key)) return false;
    return true;
  });

  // Parse available options from variants
  const optionMap: Record<string, Set<string>> = {};
  product.variants.edges.forEach((edge) => {
    edge.node.selectedOptions.forEach((opt) => {
      if (!optionMap[opt.name]) {
        optionMap[opt.name] = new Set();
      }
      optionMap[opt.name].add(opt.value);
    });
  });

  // Sort option groups: Color/Style first, followed by Size/Dimension
  const allOptions = Object.keys(optionMap)
    .map((name) => ({
      name,
      values: Array.from(optionMap[name]),
    }))
    .filter((opt) => opt.name !== "Title" && opt.values.length > 1)
    .sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      if (aLower.includes("color") || aLower.includes("style") || aLower.includes("pattern")) return -1;
      if (bLower.includes("color") || bLower.includes("style") || bLower.includes("pattern")) return 1;
      return 0;
    });

  // State for selected option values (defaults to the first IN-STOCK variant to optimize CRO!)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaultOptions: Record<string, string> = {};
    const inStockVariant = product.variants.edges.find((e) => e.node.availableForSale)?.node;
    const targetVariant = inStockVariant || product.variants.edges[0]?.node;
    targetVariant?.selectedOptions.forEach((opt) => {
      defaultOptions[opt.name] = opt.value;
    });
    return defaultOptions;
  });

  // Calculate matching variant
  const selectedVariant = product.variants.edges.find((edge) => {
    return edge.node.selectedOptions.every(
      (opt) => selectedOptions[opt.name] === opt.value
    );
  })?.node || product.variants.edges[0]?.node;

  const price = selectedVariant?.price.amount || "0";
  const currency = selectedVariant?.price.currencyCode || "USD";
  const compareAtPrice = selectedVariant?.compareAtPrice?.amount || null;

  const priceNum = parseFloat(price);
  const compareNum = compareAtPrice ? parseFloat(compareAtPrice) : null;
  const discount =
    compareNum && compareNum > priceNum
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : null;

  // Smart gallery selection: changes visual options (Color) while preserving non-visual options (Size)
  const handleImageSelect = (url: string) => {
    const stripped = stripQuery(url);

    // 1. Try to find a variant matching this photo AND the user's currently selected non-visual options (e.g. Size)
    let matchingVariant = product.variants.edges.find((edge) => {
      const hasImg = edge.node.image?.url && stripQuery(edge.node.image.url) === stripped;
      if (!hasImg) return false;
      return edge.node.selectedOptions.some(
        (opt) => !opt.name.toLowerCase().includes("color") && selectedOptions[opt.name] === opt.value
      );
    })?.node;

    // 2. Fallback to any variant with this image
    if (!matchingVariant) {
      matchingVariant = product.variants.edges.find(
        (edge) => edge.node.image?.url && stripQuery(edge.node.image.url) === stripped
      )?.node;
    }

    if (matchingVariant) {
      setSelectedOptions((prev) => {
        const updated = { ...prev };
        matchingVariant.selectedOptions.forEach((opt) => {
          updated[opt.name] = opt.value;
        });
        return updated;
      });
    }
  };

  // 2026 Gold Standard Matrix Availability Logic
  const isOptionValueSoldOut = (optionName: string, value: string) => {
    const isFirstOption = allOptions.length > 0 && allOptions[0].name === optionName;

    // For 1st option (e.g. Color), it is ONLY sold out if ALL variants with this color are out of stock
    if (isFirstOption && allOptions.length > 1) {
      const variantsWithThisValue = product.variants.edges.filter((edge) =>
        edge.node.selectedOptions.some((opt) => opt.name === optionName && opt.value === value)
      );
      if (variantsWithThisValue.length === 0) return true;
      return variantsWithThisValue.every((edge) => !edge.node.availableForSale);
    }

    // For 2nd+ option (e.g. Size), check availability with the currently selected options
    const queryOptions = { ...selectedOptions, [optionName]: value };
    const matchingVariant = product.variants.edges.find((edge) => {
      return edge.node.selectedOptions.every(
        (opt) => queryOptions[opt.name] === opt.value
      );
    })?.node;

    return matchingVariant ? !matchingVariant.availableForSale : true;
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <ProductGallery 
          images={galleryImages} 
          title={product.title} 
          activeImageUrl={selectedVariant?.image?.url} 
          onImageSelect={handleImageSelect}
        />

        {/* Product Info (Sticky Sidebar on Desktop) */}
        <div ref={buyBoxRef} className="flex flex-col gap-5 lg:pt-2 lg:sticky lg:top-28 lg:self-start">
          {/* 1. Product Title */}
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18181B] tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {product.title}
          </h1>

          {/* 3. Price & Origin Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8DFC8]/70">
            <div className="flex items-baseline gap-3">
              <span
                className="text-3xl sm:text-4xl font-extrabold text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {formatPrice(price, currency)}
              </span>
              {compareNum && compareNum > priceNum && (
                <span className="text-base sm:text-lg text-text-muted line-through">
                  {formatPrice(compareAtPrice!, currency)}
                </span>
              )}
              {discount && (
                <span className="text-xs font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF9F3] border border-[#E8DFC8] text-[11px] font-bold text-[#C25E38] shadow-2xs">
              <span className="text-xs">🇰🇷</span>
              <span>Made in Korea · Seoul Origin</span>
            </div>
          </div>

          {/* 4. Options Selectors (Elevated Above the Fold!) */}
          {allOptions.length > 0 && (
            <div className="space-y-4 pt-1">
              {allOptions.map((option) => (
                <div key={option.name} className="space-y-2">
                  <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider block">
                    Select {option.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      const isSoldOut = isOptionValueSoldOut(option.name, value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [option.name]: value,
                            }))
                          }
                          className={`
                            relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 min-h-[40px] select-none
                            ${
                              isSelected
                                ? "bg-[#18181B] text-white shadow-xs"
                                : isSoldOut
                                ? "bg-[#F8F5F0] text-[#A1A1AA] border border-[#E8DFC8]/60 hover:border-[#18181B]/40 cursor-pointer"
                                : "bg-white text-[#18181B] border border-[#E8DFC8] hover:border-[#18181B] shadow-2xs"
                            }
                          `}
                        >
                          <span className={!isSelected && isSoldOut ? "opacity-60" : ""}>{value}</span>
                          {/* Clean 1px Hairline Strike Line (ONLY on unselected sold out items!) */}
                          {!isSelected && isSoldOut && (
                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl pointer-events-none">
                              <div className="w-[140%] h-[1px] bg-[#D4D4D8] rotate-12" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. Add to Cart Section (Immediate Action Zone) */}
          {selectedVariant?.id && (
            <div className="pt-2 space-y-3">
              <AddToCartSection
                variantId={selectedVariant.id}
                price={price}
                currency={currency}
                productTitle={product.title}
                productHandle={product.handle}
                availableForSale={selectedVariant.availableForSale}
                productTags={product.tags}
                variantTitle={selectedVariant.title}
                image={selectedVariant.image || product.images.edges[0]?.node || null}
              />

              {/* 1-Line Compact Micro Trust Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-[#71717A] text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>🔒</span>
                  <span className="font-semibold">Secure Checkout</span>
                </div>
                <div className="flex items-center justify-center gap-1 border-x border-[#E8DFC8]/60">
                  <span>✈️</span>
                  <span className="font-semibold">Tracked Dispatch</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span>🛡️</span>
                  <span className="font-semibold">30-Day Returns</span>
                </div>
              </div>
            </div>
          )}

          {/* Etsy-Standard 2-Tier Product Trust Accordions */}
          <ProductTrustAccordions product={product} />



        </div>
      </div>

      {/* Detailed Images Section (Single-Column Gallery Lookbook Stack) */}
      {detailedImages.length > 0 && (
        <div className="border-t border-border-light pt-16">
          <div className="bg-[#FAF9F6] py-12 sm:py-16 px-4 sm:px-8 rounded-3xl border border-[#E8DFC8]/60 max-w-[880px] mx-auto shadow-2xs">
            {/* Exhibition Catalog Header */}
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] border border-[#E8DFC8] text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C25E38] mb-3 shadow-2xs">
                <span>🇰🇷</span> 100% Made in Korea · Direct from Seoul
              </span>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Craft & Lookbook Details
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] max-w-lg mx-auto mt-2 leading-relaxed">
                Crafted in Korea with uncompromising quality standards and dispatched directly from Seoul. Explore authentic textures, refined stitches, and heritage finishes.
              </p>
              <div className="h-0.5 w-12 bg-[#C25E38]/30 mx-auto mt-4" />
            </div>
            
            {/* Single-Column Vertical Lookbook Stack */}
            <div className="flex flex-col gap-8 sm:gap-12">
              {detailedImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="overflow-hidden rounded-2xl border border-[#E8DFC8]/70 bg-white shadow-2xs transition-all duration-500 ease-out hover:shadow-md"
                >
                  <div className="bg-[#F5F0E6] w-full">
                    <img
                      src={img.url}
                      alt={img.alt || `${product.title} craft detail ${idx + 1}`}
                      className="w-full h-auto block object-cover mx-auto"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meet the Maker / Atelier Profile Box */}
      {product.vendor && (
        <div className="max-w-[1000px] mx-auto bg-[#F4EFE6] rounded-3xl p-6 sm:p-10 border border-[#E8DFC8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-[#E8DFC8] bg-white shadow-xs">
              <img
                src={artistProfile.avatar || "/assets/blank_seoul_symbol.png"}
                alt={artistDisplayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#C25E38]">
                <span>🏛️</span> Verified Independent Atelier
              </span>
              <h3
                className="text-lg sm:text-xl font-bold text-[#18181B] mt-0.5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {artistDisplayName}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 max-w-md line-clamp-2">
                {artistProfile.bio}
              </p>
            </div>
          </div>

          <Link
            href={`/artists/${getArtistSlug(product.vendor)}`}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#C25E38] text-white text-xs font-bold uppercase tracking-wider transition-colors text-center shrink-0 shadow-xs"
          >
            Explore Studio Works →
          </Link>
        </div>
      )}

      {/* 2026 Mobile Sticky Bottom Action Bar + Bottom Drawer Sheet */}
      <MobileStickyBottomBar
        product={product}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        allOptions={allOptions}
        selectedVariant={selectedVariant}
        price={price}
        currency={currency}
        targetRef={buyBoxRef}
        isOptionValueSoldOut={isOptionValueSoldOut}
      />
    </div>
  );
}
