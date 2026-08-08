"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CURATED_BUNDLES, type CuratedBundle } from "@/lib/master-products";
import { useCart } from "./CartProvider";
import type { CartItem } from "@/lib/shopify/types";

export default function CuratedBundlesSection() {
  const { addBundleToCart } = useCart();
  const [loadingBundleId, setLoadingBundleId] = useState<string | null>(null);
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const handleAddBundle = (bundle: CuratedBundle) => {
    setLoadingBundleId(bundle.id);

    // Map constituent master items to CartItem format
    const bundleCartItems: CartItem[] = bundle.items.map((item) => ({
      variantId: item.id,
      title: item.title,
      price: item.price,
      quantity: 1,
      image: item.image,
      handle: item.handle,
    }));

    // Trigger batch multi-add to cart
    setTimeout(() => {
      addBundleToCart(bundleCartItems, bundle.name, bundle.discountCode);
      setLoadingBundleId(null);
      setAddedBundleId(bundle.id);

      setTimeout(() => setAddedBundleId(null), 2500);
    }, 400);
  };

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#FAFAFA] border-t border-b border-border/50" id="curated-bundles">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
            ✨ Curated Masterpiece Bundles
          </span>
          <h2 className="heading-lg text-dark">
            1-Click Multi-Add <span className="gradient-text">Curated Bundles</span>
          </h2>
          <p className="text-text-muted mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Expertly paired art pieces handcrafted by Korea&apos;s finest independent artisans.
            Add the entire 2~3 piece set directly to your cart in 1-click.
          </p>
        </div>

        {/* 4-Column Grid Layout: Set D ($89) -> Set A ($59) -> Set B ($72) -> Set C ($54) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CURATED_BUNDLES.map((bundle) => {
            const isLoading = loadingBundleId === bundle.id;
            const isAdded = addedBundleId === bundle.id;

            return (
              <div
                key={bundle.id}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-border/70 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Badge Top Overlay */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-block px-3 py-1 text-[11px] font-bold text-white bg-primary/95 backdrop-blur-md rounded-full shadow-md">
                    {bundle.badge}
                  </span>
                </div>

                {/* Bundle Cover Image */}
                <div className="relative aspect-[4/3] bg-surface-dim overflow-hidden">
                  <Image
                    src={bundle.image}
                    alt={bundle.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Savings Tag */}
                  <div className="absolute bottom-3 right-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                    Save ${bundle.savings}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent block mb-1">
                      {bundle.sku}
                    </span>
                    <h3 className="font-bold text-dark text-base line-clamp-2 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
                      {bundle.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {bundle.tagline}
                    </p>

                    {/* Constituent Item Breakdown Chips */}
                    <div className="mt-4 pt-3 border-t border-border-light flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        Set Includes ({bundle.items.length} items):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {bundle.items.map((item) => (
                          <span
                            key={item.sku}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-dim border border-border/50 text-[11px] font-medium text-dark"
                          >
                            <span className="text-primary font-bold">{item.sku}</span>
                            <span className="text-text-muted truncate max-w-[110px]">{item.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Multi-Add CTA Button */}
                  <div className="pt-3 border-t border-border-light flex flex-col gap-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                          ${bundle.price}
                        </span>
                        <span className="text-xs text-text-light line-through font-medium">
                          ${bundle.originalPrice}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded">
                        1-Click Bundle
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddBundle(bundle)}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                        isAdded
                          ? "bg-success text-white scale-[0.98]"
                          : isLoading
                          ? "bg-primary/70 text-white cursor-wait"
                          : "bg-primary hover:bg-primary-hover text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {isAdded ? (
                        <>
                          <span>✓ Set Added to Cart!</span>
                        </>
                      ) : isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Adding Set...</span>
                        </>
                      ) : (
                        <>
                          <span>🛒 Add Bundle to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
