"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import QuantitySelector from "./QuantitySelector";
import BuyButton from "./BuyButton";
import { isWishlisted, toggleWishlist, subscribeWishlist } from "@/lib/wishlist";

interface AddToCartSectionProps {
  productId?: string;
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
  productId,
  variantId,
  price,
  currency,
  productTitle,
  productHandle,
  availableForSale,
  variantTitle = "",
  image = null,
}: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [currentlyNotInStock, setCurrentlyNotInStock] = useState(!availableForSale);
  const [loading, setLoading] = useState(true);

  // Modern React 19 storage subscription for wishlist
  const isSaved = useSyncExternalStore(
    subscribeWishlist,
    () => isWishlisted(productId, productHandle),
    () => false
  );

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId, productHandle);
  };

  return (
    <div className="mt-2 space-y-4">
      {/* Real-time Stock Badge */}
      <div className="min-h-7 flex items-center">{stockBadge}</div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <QuantitySelector
          quantity={quantity}
          onChange={setQuantity}
          min={1}
          max={stockCount !== null ? stockCount : 99}
        />
        <div className="flex-1 min-w-0">
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

        {/* Quiet Luxury Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center border transition-all duration-200 shrink-0 shadow-2xs active:scale-95 cursor-pointer ${
            isSaved
              ? "bg-[#FBF6F0] border-[#C25E38] text-[#C25E38]"
              : "bg-white border-[#E8DFC8] text-[#18181B]/70 hover:text-[#C25E38] hover:border-[#C25E38]/60"
          }`}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isSaved ? "#C25E38" : "none"}
            stroke={isSaved ? "#C25E38" : "currentColor"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isSaved ? "scale-110" : ""}`}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
