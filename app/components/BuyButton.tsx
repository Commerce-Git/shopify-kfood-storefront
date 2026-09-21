"use client";

import { useState } from "react";
import { useCart } from "@/app/components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { CANCEL_WINDOW_HOURS, isStoreLive } from "@/lib/constants";

interface BuyButtonProps {
  variantId: string;
  productTitle?: string;
  productHandle?: string;
  price?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showSecureBadge?: boolean;
  quantity?: number;
  disabled?: boolean;
  variantTitle?: string;
  image?: { url: string; altText?: string | null } | null;
  stockLimit?: number | null;
}

export default function BuyButton({
  variantId,
  productTitle = "Blank Seoul",
  productHandle = "artisan-product",
  price = "45.00",
  label = "Add to Cart",
  className = "",
  size = "md",
  showSecureBadge = true,
  quantity = 1,
  disabled = false,
  variantTitle = "",
  image = null,
  stockLimit = null,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const sizeClasses = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg",
  };

  function handleAddToCart() {
    setLoading(true);

    addToCart({
      variantId,
      productHandle,
      title: productTitle,
      variantTitle,
      price,
      quantity,
      image: (image as any),
      stockLimit,
    });

    setLoading(false);
    setIsAdded(true);
    setIsCartOpen(true);

    // Reset button checkmark feedback after 1.8 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleAddToCart}
        disabled={loading || disabled || isAdded}
        className={`
          ${isAdded 
            ? "bg-emerald-600 hover:bg-emerald-600 border-emerald-600 text-white cursor-default" 
            : "btn-primary hover:scale-[1.01]"
          }
          ${sizeClasses[size]}
          ${loading ? "opacity-70 cursor-wait" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 border-gray-400 pointer-events-none" : ""}
          ${className}
          transition-all duration-200
        `}
        id="buy-now-button"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Adding...
          </span>
        ) : isAdded ? (
          <span className="flex items-center justify-center gap-1.5 animate-scale-up">
            <span>✔</span> {!isStoreLive() ? "Added to Launch Bag!" : "Added to Box!"}
          </span>
        ) : (
          label.startsWith("Add to Cart") && !isStoreLive()
            ? label.replace("Add to Cart", "Add to Launch Bag")
            : label
        )}
      </button>



      {showSecureBadge && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1.5 pt-2 text-[11px] text-text-muted select-none w-full border-t border-border-light/50 mt-1">
          {!isStoreLive() ? (
            <div className="flex items-center gap-1.5 font-medium text-amber-800/80">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Official Dispatch Launching Soon &middot; Direct Dispatch from Korea</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 font-medium">
                <span>🔒</span> Secure Checkout
              </div>
              <span className="hidden sm:inline text-gray-300">•</span>
              <div className="flex items-center gap-1 font-medium">
                <span>✈️</span> Free Tracked Shipping
              </div>
              <span className="hidden sm:inline text-gray-300">•</span>
              <div className="flex items-center gap-1 font-medium">
                <span>🛡️</span> {CANCEL_WINDOW_HOURS}-Hour Cancellation
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
