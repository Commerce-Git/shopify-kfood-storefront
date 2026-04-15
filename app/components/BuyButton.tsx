"use client";

import { useState } from "react";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { CREATE_CART } from "@/lib/shopify/queries";

interface BuyButtonProps {
  variantId: string;
  quantity?: number;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showSecureBadge?: boolean;
}

interface CartResponse {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

export default function BuyButton({
  variantId,
  quantity = 1,
  label = "Buy Now",
  className = "",
  size = "md",
  showSecureBadge = true,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg",
  };

  async function handleBuyNow() {
    setLoading(true);
    setError(null);

    try {
      const data = await storefrontFetch<CartResponse>(CREATE_CART, {
        lines: [{ merchandiseId: variantId, quantity }],
      });

      const { cart, userErrors } = data.cartCreate;

      if (userErrors.length > 0) {
        setError(userErrors[0].message);
        return;
      }

      // Redirect to Shopify checkout
      window.location.href = cart.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className={`
          btn-primary ${sizeClasses[size]}
          ${loading ? "opacity-70 cursor-wait" : ""}
          ${className}
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
            Processing...
          </span>
        ) : (
          label
        )}
      </button>

      {showSecureBadge && (
        <p className="text-xs text-text-muted flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secure checkout powered by Shopify
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
