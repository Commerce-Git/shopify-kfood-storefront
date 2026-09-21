"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/lib/shopify/types";

export interface ProductVariantOption {
  id: string;
  title: string;
  price: string;
  availableForSale: boolean;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
}

interface CartItemListProps {
  items: CartItem[];
  productVariantsMap: Record<string, ProductVariantOption[]>;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  onOptionChange: (item: CartItem, newVariantId: string) => void;
}

export default function CartItemList({
  items,
  productVariantsMap,
  updateQuantity,
  removeFromCart,
  onOptionChange,
}: CartItemListProps) {
  return (
    <div className="bg-white border border-[#E8DFC8]/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
      <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[#E8DFC8]/50">
        <h1
          className="text-lg sm:text-xl font-extrabold text-[#18181B]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Your Selected Treasures
        </h1>
        <span className="text-xs font-semibold text-[#71717A]">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items List */}
      <div className="divide-y divide-[#E8DFC8]/40">
        {items.map((item) => {
          const lineTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
          const variants = productVariantsMap[item.productHandle];

          return (
            <div
              key={item.variantId}
              className="py-4.5 first:pt-0 last:pb-0 flex gap-3.5 sm:gap-5 items-start"
            >
              {/* Product Thumbnail */}
              <div className="w-[76px] h-[76px] sm:w-20 sm:h-20 rounded-2xl bg-[#FAF9F6] border border-[#E8DFC8]/70 overflow-hidden shrink-0 relative shadow-2xs">
                {item.image?.url && item.image.url.trim() !== "" ? (
                  <Image
                    src={item.image.url}
                    alt={item.image.altText || item.title}
                    fill
                    unoptimized={item.image.url.includes("cdn.shopify.com")}
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info & Controls (Full remaining width 2-tier layout) */}
              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                {/* Upper Tier: Title, Option, and Top-Right Remove Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 pr-1">
                    <Link
                      href={`/product/${item.productHandle}`}
                      className="text-sm sm:text-base font-bold text-[#18181B] hover:text-[#C25E38] transition-colors line-clamp-2 block leading-snug"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle && item.variantTitle !== "Default Title" && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-[#71717A]">
                        <span className="shrink-0 font-medium text-[11px]">Option:</span>
                        {variants && variants.length > 1 ? (
                          <select
                            value={item.variantId}
                            onChange={(e) => onOptionChange(item, e.target.value)}
                            className="text-xs font-semibold text-[#18181B] bg-[#FAF9F6] border border-[#E8DFC8] rounded-lg px-2 py-0.5 hover:border-[#18181B] focus:border-[#18181B] transition-colors cursor-pointer outline-none shadow-2xs max-w-[200px] truncate"
                            aria-label="Change variant option"
                          >
                            {variants.map((v) => (
                              <option
                                key={v.id}
                                value={v.id}
                                disabled={!v.availableForSale}
                              >
                                {v.title} (${v.price}){" "}
                                {!v.availableForSale ? "— Sold Out" : ""}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-semibold text-[#3F3F46] text-xs">
                            {item.variantTitle}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Top-Right Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-[#A1A1AA] hover:text-red-500 transition-colors p-1.5 -mr-1.5 -mt-1 shrink-0 cursor-pointer rounded-lg hover:bg-red-50 active:scale-95"
                    aria-label="Remove item"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Lower Tier: Price & Quantity Controls */}
                <div className="flex items-end justify-between gap-3 mt-3 pt-1">
                  {/* Price Breakdown */}
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-extrabold text-[#18181B] leading-none">
                      ${lineTotal}
                      {item.quantity > 1 && (
                        <span className="text-xs text-[#71717A] font-normal ml-1.5 whitespace-nowrap">
                          (${item.price} each)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF9F6] border border-[#E8DFC8]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-[#E8DFC8] flex items-center justify-center hover:border-[#18181B] active:scale-95 transition-all text-xs font-bold text-[#18181B] shadow-2xs cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-[#18181B]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        disabled={
                          item.stockLimit !== undefined &&
                          item.stockLimit !== null &&
                          item.quantity >= item.stockLimit
                        }
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-[#E8DFC8] flex items-center justify-center hover:border-[#18181B] active:scale-95 transition-all text-xs font-bold text-[#18181B] shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    {item.stockLimit !== undefined &&
                      item.stockLimit !== null &&
                      item.quantity >= item.stockLimit && (
                        <span className="text-[9px] text-amber-600 font-semibold mt-1 select-none whitespace-nowrap text-right">
                          Max stock ({item.stockLimit} left)
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
