"use client";

import { useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { formatPrice, getProductImages } from "@/lib/shopify/api";
import ProductGallery from "./ProductGallery";
import AddToCartSection from "./AddToCartSection";

interface ProductInteractiveProps {
  product: ShopifyProduct;
  isPreview?: boolean;
}

const HIGHLIGHTS = [
  "Authentic Korean craftsmanship & design",
  "Ships direct from Seoul with tracked shipping (7-14 days)",
  "Tracking number provided for every order",
];

export default function ProductInteractive({ product, isPreview = false }: ProductInteractiveProps) {
  const images = getProductImages(product);

  // Helper to ignore query parameters when matching URLs
  const stripQuery = (url: string) => url.split('?')[0];

  // Extract variant-specific image URLs to isolate them
  const variantImageUrls = new Set(
    product.variants.edges
      .map((edge) => edge.node.image?.url ? stripQuery(edge.node.image.url) : null)
      .filter((url): url is string => !!url)
  );

  // Gallery images: first image (representative) + variant images
  const galleryImages = images.filter((img, idx) => {
    if (idx === 0) return true;
    return variantImageUrls.has(stripQuery(img.url));
  });

  // Detailed images: remaining images shown below in a large lookbook stack
  const detailedImages = images.filter((img) => !galleryImages.includes(img));

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

  const allOptions = Object.keys(optionMap)
    .map((name) => ({
      name,
      values: Array.from(optionMap[name]),
    }))
    .filter((opt) => opt.name !== "Title" && opt.values.length > 1);

  // State for selected option values
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaultOptions: Record<string, string> = {};
    const firstVariant = product.variants.edges[0]?.node;
    firstVariant?.selectedOptions.forEach((opt) => {
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

  const handleImageSelect = (url: string) => {
    const matchingVariant = product.variants.edges.find(
      (edge) => edge.node.image?.url === url
    )?.node;

    if (matchingVariant) {
      const newOptions: Record<string, string> = {};
      matchingVariant.selectedOptions.forEach((opt) => {
        newOptions[opt.name] = opt.value;
      });
      setSelectedOptions(newOptions);
    }
  };

  const isOptionValueSoldOut = (optionName: string, value: string) => {
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

        {/* Product Info */}
        <div className="flex flex-col gap-6 lg:pt-4">
          {selectedVariant?.availableForSale && (
            <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 bg-slate-500 rounded-full" />
              {product.tags.includes("limited") ? "Low Stock" : "Made to Order"}
            </div>
          )}

          <h1 className="heading-lg text-dark">{product.title}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-4xl font-extrabold text-dark"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatPrice(price, currency)}
            </span>
            {compareNum && compareNum > priceNum && (
              <span className="text-lg text-text-muted line-through">
                {formatPrice(compareAtPrice!, currency)}
              </span>
            )}
            {discount && (
              <span className="text-sm font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>

          <div
            className="text-text-muted leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {/* Features */}
          <div className="space-y-2.5">
            {HIGHLIGHTS.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-sm text-text"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-success flex-shrink-0"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="currentColor"
                    opacity="0.15"
                  />
                  <path
                    d="M8 12l2.5 2.5L16 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {feature}
              </div>
            ))}
          </div>

          {/* Options Selectors */}
          {allOptions.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border-light">
              {allOptions.map((option) => (
                <div key={option.name} className="space-y-2">
                  <span className="text-xs font-bold text-dark uppercase tracking-wider block">
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
                            relative px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 overflow-hidden
                            ${isSelected
                              ? "border-primary bg-primary text-white shadow-sm"
                              : isSoldOut
                                ? "border-border-light bg-surface-dim/40 text-text-muted opacity-55 cursor-pointer"
                                : "border-border-light bg-white text-dark hover:border-dark/30"
                            }
                          `}
                        >
                          <span>{value}</span>
                          {isSoldOut && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-[140%] h-[1px] bg-text-muted/40 rotate-12" />
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

          {/* Add to Cart Section */}
          {selectedVariant?.id && (
            <div className="pt-6 border-t border-border-light">
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
            </div>
          )}



        </div>
      </div>

      {/* Detailed Images Section */}
      {detailedImages.length > 0 && (
        <div className="border-t border-border-light pt-16">
          <div className="bg-[#FAF9F6] py-16 px-4 md:px-8 rounded-3xl border border-stone-100 max-w-[1000px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                Detail View
              </h2>
              <div className="h-0.5 w-8 bg-primary/20 mx-auto mt-3" />
            </div>
            
            {/* 2026 Bento Grid Layout preserving original ratios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
              {detailedImages.map((img, idx) => {
                // Rhythm: first image of every 3 occupies full width, others occupy half width on desktop
                // Auto-promote last orphan image to full width so there's never an empty gap
                const isLastImage = idx === detailedImages.length - 1;
                const wouldBeOrphan = isLastImage && idx % 3 === 1;
                const isFullWidth = idx % 3 === 0 || wouldBeOrphan;
                return (
                  <div 
                    key={idx} 
                    className={`
                      overflow-hidden rounded-2xl border border-stone-200/50 bg-white shadow-sm
                      transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-md
                      ${isFullWidth ? "md:col-span-2" : "md:col-span-1"}
                    `}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${product.title} detail ${idx + 1}`}
                      className="w-full h-auto block object-contain"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
