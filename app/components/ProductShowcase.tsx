"use client";

import Image from "next/image";
import BuyButton from "./BuyButton";
import type { ShopifyProduct } from "@/lib/shopify/types";
import {
  getProductImage,
  getProductImageAlt,
  getProductPricing,
  getFirstVariantId,
  formatPrice,
} from "@/lib/shopify/api";

// Fallback mock data when no product is available from API
const FALLBACK = {
  title: "Blank Seoul",
  price: "39.99",
  compareAtPrice: "54.99",
  currency: "USD",
  description:
    "10+ viral Korean snacks shipped directly from Seoul's trendiest convenience stores. The exact treats you see in K-Dramas — sweet, savory, and spicy all in one curated box.",
  highlights: [
    "10+ unique Korean snacks",
    "Mix of sweet, savory & spicy flavors",
    "Includes viral K-Drama snacks",
    "English flavor guide included",
    "Ships from Seoul via EMS (5-10 days)",
    "100% satisfaction guarantee",
  ],
  variantId: "",
  image: "/images/seoul-snack-box.jpg",
};

interface ProductShowcaseProps {
  product: ShopifyProduct | null;
}

export default function ProductShowcase({ product }: ProductShowcaseProps) {
  // Use real data if available, otherwise fallback
  const title = product?.title || FALLBACK.title;
  const description = product?.description || FALLBACK.description;
  const imageSrc = product ? getProductImage(product) : FALLBACK.image;
  const imageAlt = product ? getProductImageAlt(product) : FALLBACK.title;
  const variantId = product ? getFirstVariantId(product) : FALLBACK.variantId;

  const pricing = product
    ? getProductPricing(product)
    : {
        price: FALLBACK.price,
        compareAtPrice: FALLBACK.compareAtPrice,
        currency: FALLBACK.currency,
      };

  const priceNum = parseFloat(pricing.price);
  const compareNum = pricing.compareAtPrice
    ? parseFloat(pricing.compareAtPrice)
    : null;
  const discount =
    compareNum && compareNum > priceNum
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : null;

  return (
    <section className="section bg-white" id="product-showcase">
      <div className="section-inner">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Product Image */}
          <div className="relative group">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-dim">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Sale Badge */}
              {discount && compareNum && (
                <div className="absolute top-4 left-4 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  SAVE {formatPrice(String(compareNum - priceNum), pricing.currency)}
                </div>
              )}
            </div>
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Limited Edition
            </div>

            <h2 className="heading-lg text-dark">{title}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-extrabold text-dark"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {formatPrice(pricing.price, pricing.currency)}
              </span>
              {compareNum && compareNum > priceNum && (
                <span className="text-lg text-text-muted line-through">
                  {formatPrice(pricing.compareAtPrice!, pricing.currency)}
                </span>
              )}
              {discount && (
                <span className="text-sm font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>

            <p className="text-text-muted leading-relaxed text-base">
              {description}
            </p>

            {/* Highlights */}
            <ul className="space-y-2.5">
              {FALLBACK.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-text"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-success flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                    <path
                      d="M8 12l2.5 2.5L16 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {/* Buy Button */}
            {variantId && (
              <div className="mt-2">
                <BuyButton
                  variantId={variantId}
                  label={`Yes! Claim My Box — ${formatPrice(pricing.price, pricing.currency)}`}
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
