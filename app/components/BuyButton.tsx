"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";

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
  const [showToast, setShowToast] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const sizeClasses = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg",
  };

  function handleAddToCart() {
    setLoading(true);
    setIsAdded(false);
    setShowToast(false);

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

    // Provide a short micro-interaction loading animation
    setTimeout(() => {
      setLoading(false);
      setIsAdded(true);
      setShowToast(true);

      // Reset success state after 2 seconds
      const addedTimer = setTimeout(() => {
        setIsAdded(false);
      }, 2000);

      // Hide toast after 4 seconds
      const toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 4000);

      return () => {
        clearTimeout(addedTimer);
        clearTimeout(toastTimer);
      };
    }, 600);
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
            <span>✔</span> Added to Box!
          </span>
        ) : (
          label
        )}
      </button>

      {/* Viewport Floating Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl z-50 flex items-center gap-3 border border-gray-800 max-w-sm w-[90vw] animate-scale-up">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 relative">
            {image?.url ? (
              <Image
                src={image.url}
                alt={image.altText || productTitle}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg bg-orange-500/10 text-orange-500 font-bold">
                📦
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Added to Box</p>
            <p className="text-sm font-bold truncate mt-0.5" style={{ fontFamily: "var(--font-heading)" }}>{productTitle}</p>
            {variantTitle && variantTitle !== "Default Title" && (
              <p className="text-[10px] text-gray-400 truncate">{variantTitle}</p>
            )}
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl flex-shrink-0"
          >
            View Cart →
          </Link>
        </div>
      )}

      {showSecureBadge && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1.5 pt-2 text-[11px] text-text-muted select-none w-full border-t border-border-light/50 mt-1">
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
        </div>
      )}

      {user?.email && (
        <p className="text-xs text-text-muted/70 mt-1">
          💡 Use <span className="font-medium">{user.email}</span> at checkout to track your order
        </p>
      )}
    </div>
  );
}
