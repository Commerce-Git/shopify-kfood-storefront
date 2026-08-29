"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/shopify/api";
import { useCart } from "./CartProvider";

interface MobileStickyBottomBarProps {
  product: ShopifyProduct;
  selectedOptions: Record<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  allOptions: { name: string; values: string[] }[];
  selectedVariant: any;
  price: string;
  currency: string;
  targetRef: React.RefObject<HTMLDivElement | null>;
  isOptionValueSoldOut: (optionName: string, value: string) => boolean;
}

export default function MobileStickyBottomBar({
  product,
  selectedOptions,
  setSelectedOptions,
  allOptions,
  selectedVariant,
  price,
  currency,
  targetRef,
  isOptionValueSoldOut,
}: MobileStickyBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  // 1. IntersectionObserver for high-performance scroll detection
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When main buy box is NOT intersecting and is above the viewport (scrolled past), show sticky bar
        const isPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setIsVisible(isPast);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  // 2. Body Scroll Lock when Bottom Drawer Sheet is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Image for active variant or product thumbnail
  const activeImage = selectedVariant?.image || product.images.edges[0]?.node || null;
  const isSoldOut = !selectedVariant?.availableForSale;

  // Selected options summary (e.g., "RED / Small")
  const selectedOptionsSummary = Object.values(selectedOptions).filter(Boolean).join(" · ");

  const handleDirectAddToCart = () => {
    if (isSoldOut || !selectedVariant?.id) return;
    setIsAdding(true);

    addToCart({
      variantId: selectedVariant.id,
      productHandle: product.handle,
      title: product.title,
      variantTitle: selectedVariant.title || selectedOptionsSummary,
      price: price,
      quantity: quantity,
      image: activeImage as any,
    });

    setTimeout(() => {
      setIsAdding(false);
      setIsDrawerOpen(false);
    }, 400);
  };

  return (
    <>
      {/* 1. Mobile Floating Bottom Bar (Appears when scrolled past buy box) */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md
          border-t border-[#E8DFC8]/90 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
          transition-transform duration-300 ease-out
          ${isVisible ? "translate-y-0" : "translate-y-full pointer-events-none"}
        `}
      >
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Left: Thumbnail + Option summary & price (Tapping opens Drawer) */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-3 text-left min-w-0 flex-1 group"
          >
            {activeImage && (
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#E8DFC8] bg-surface-dim">
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText || product.title}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-dark truncate">
                  {selectedOptionsSummary || product.title}
                </span>
                <span className="text-[10px] text-[#C25E38] font-semibold underline shrink-0">
                  Change
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-extrabold text-dark" style={{ fontFamily: "var(--font-heading)" }}>
                  {formatPrice(price, currency)}
                </span>
                {isSoldOut ? (
                  <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded">
                    Sold Out
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    In Stock
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Right: Add to Cart CTA */}
          <button
            type="button"
            onClick={allOptions.length > 0 && !selectedOptionsSummary ? () => setIsDrawerOpen(true) : handleDirectAddToCart}
            disabled={isSoldOut || isAdding}
            className={`
              px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 shadow-sm
              ${isSoldOut
                ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                : "bg-[#18181B] hover:bg-[#C25E38] active:scale-95 text-white"
              }
            `}
          >
            {isAdding ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            ) : isSoldOut ? (
              "Sold Out"
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>

      {/* 2. Seamless Mobile Bottom Drawer Sheet */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
          {/* Dim Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel (Slides up from bottom) */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#FDFBF7] rounded-t-3xl border-t border-[#E8DFC8] p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E8DFC8]/70">
              <div className="flex items-center gap-3">
                {activeImage && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#E8DFC8] bg-white">
                    <Image
                      src={activeImage.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-[#18181B] line-clamp-1" style={{ fontFamily: "var(--font-heading)" }}>
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-extrabold text-[#18181B]" style={{ fontFamily: "var(--font-heading)" }}>
                      {formatPrice(price, currency)}
                    </span>
                    <span className="text-[10px] text-[#C25E38] font-bold bg-[#F4EFE6] px-2 py-0.5 rounded-full border border-[#E8DFC8]">
                      🇰🇷 Direct from Seoul
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors text-sm font-bold shrink-0"
                aria-label="Close option selector"
              >
                ✕
              </button>
            </div>

            {/* Options Selector List */}
            {allOptions.length > 0 && (
              <div className="space-y-4 py-4 border-b border-[#E8DFC8]/70">
                {allOptions.map((option) => (
                  <div key={option.name} className="space-y-2">
                    <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider block">
                      Select {option.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected = selectedOptions[option.name] === value;
                        const isSoldOutOption = isOptionValueSoldOut(option.name, value);
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
                              relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all duration-200 overflow-hidden
                              ${isSelected
                                ? "border-[#18181B] bg-[#18181B] text-white shadow-xs"
                                : isSoldOutOption
                                  ? "border-stone-200 bg-stone-100/70 text-stone-400 opacity-60"
                                  : "border-[#E8DFC8] bg-white text-[#18181B] hover:border-[#18181B]/40"
                              }
                            `}
                          >
                            <span>{value}</span>
                            {isSoldOutOption && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[140%] h-[1px] bg-stone-400 rotate-12" />
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

            {/* Quantity Selector + Confirm Button */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center border border-[#E8DFC8] rounded-xl bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isSoldOut}
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#18181B] disabled:opacity-30 hover:bg-stone-50 rounded-l-xl transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#18181B]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isSoldOut}
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#18181B] disabled:opacity-30 hover:bg-stone-50 rounded-r-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Final Confirm Add to Cart CTA */}
              <button
                type="button"
                onClick={handleDirectAddToCart}
                disabled={isSoldOut || isAdding}
                className={`
                  w-full py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md text-center
                  ${isSoldOut
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                    : "bg-[#18181B] hover:bg-[#C25E38] active:scale-[0.99] text-white"
                  }
                `}
              >
                {isAdding ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding to Bag...
                  </span>
                ) : isSoldOut ? (
                  "Currently Sold Out"
                ) : (
                  `Add to Cart · ${formatPrice(String(parseFloat(price) * quantity), currency)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
