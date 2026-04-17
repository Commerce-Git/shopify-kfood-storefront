"use client";

import { useState, useEffect } from "react";
import type { ShopifyProduct } from "@/lib/shopify/types";
import {
  getProductPricing,
  getFirstVariantId,
  formatPrice,
} from "@/lib/shopify/api";
import BuyButton from "./BuyButton";

interface StickyBuyBarProps {
  product: ShopifyProduct | null;
}

export default function StickyBuyBar({ product }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  const title = product?.title || "The Ultimate Seoul Box";
  const pricing = product
    ? getProductPricing(product)
    : { price: "45.00", compareAtPrice: null, currency: "USD" };
  const variantId = product ? getFirstVariantId(product) : "";

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40
        bg-white/90 backdrop-blur-xl border-t border-border-light
        transform transition-all duration-300 ease-out
        ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
      `}
      id="sticky-buy-bar"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block w-10 h-10 rounded-lg bg-surface-dim flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-bold text-dark truncate"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-base font-extrabold text-dark"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {formatPrice(pricing.price, pricing.currency)}
              </span>
              {pricing.compareAtPrice && (
                <span className="text-xs text-text-muted line-through">
                  {formatPrice(pricing.compareAtPrice, pricing.currency)}
                </span>
              )}
            </div>
          </div>
        </div>

        {variantId ? (
          <BuyButton
            variantId={variantId}
            label="Claim My Box 🎁"
            size="sm"
            showSecureBadge={false}
          />
        ) : (
          <span className="btn-primary text-sm px-6 py-2.5 opacity-70 cursor-not-allowed">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
}
