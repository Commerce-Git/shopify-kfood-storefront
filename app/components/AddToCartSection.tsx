"use client";

import { useState, useEffect } from "react";
import QuantitySelector from "./QuantitySelector";
import BuyButton from "./BuyButton";

interface AddToCartSectionProps {
  variantId: string;
  price: string;
  currency: string;
  productTitle: string;
  productHandle: string;
  availableForSale: boolean;
  productTags?: string[];
  variantTitle?: string;
  image?: { url: string; altText?: string | null } | null;
}

export default function AddToCartSection({
  variantId,
  price,
  currency,
  productTitle,
  productHandle,
  availableForSale,
  productTags = [],
  variantTitle = "",
  image = null,
}: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [currentlyNotInStock, setCurrentlyNotInStock] = useState(!availableForSale);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    fetch(`/api/stock?variantId=${encodeURIComponent(variantId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          if (data.success) {
            setStockCount(data.quantityAvailable);
            setCurrentlyNotInStock(data.currentlyNotInStock);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[AddToCartSection] Failed to fetch stock:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [variantId]);

  // Helper to format price with currency
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(parseFloat(price));

  const isSoldOut = currentlyNotInStock || (stockCount !== null && stockCount <= 0);
  const isLimited = productTags.includes("limited");

  // Determine stock badge display
  let stockBadge = null;
  if (loading) {
    // CLS (Layout Shift) prevention shimmer skeleton loader
    stockBadge = (
      <div className="h-6 w-36 bg-slate-200/80 animate-pulse rounded-full" />
    );
  } else if (isSoldOut) {
    stockBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
        🔴 Sold Out (Join the waitlist for the next slots)
      </span>
    );
  } else if (stockCount === null) {
    // If inventory tracking is disabled (null), fall back safely
    stockBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
        ✨ Made to Order (Slots available)
      </span>
    );
  } else if (stockCount <= 5) {
    // Low stock warning (Urgency mapped to Crafting Slots)
    stockBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold animate-bounce-slow">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
        ⚡ Only {stockCount} crafting slot{stockCount !== 1 ? "s" : ""} left to secure right now!
      </span>
    );
  } else {
    // Normal stock (mapped to Crafting Slots)
    stockBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        🟢 In Stock (Crafting slots available right now)
      </span>
    );
  }

  return (
    <div className="mt-2 space-y-4">
      {/* Real-time Stock Badge */}
      <div className="min-h-7 flex items-center">{stockBadge}</div>

      <div className="flex items-center gap-4">
        <QuantitySelector quantity={quantity} onChange={setQuantity} min={1} max={stockCount !== null ? stockCount : 99} />
        <div className="flex-1">
          <BuyButton
            variantId={variantId}
            productTitle={productTitle}
            productHandle={productHandle}
            price={price}
            quantity={quantity}
            label={isSoldOut ? "Sold Out" : `Add to Cart — ${formattedPrice}`}
            size="lg"
            className="w-full"
            disabled={isSoldOut}
            variantTitle={variantTitle}
            image={image}
            stockLimit={stockCount}
            showSecureBadge={false}
          />
        </div>
      </div>
    </div>
  );
}
