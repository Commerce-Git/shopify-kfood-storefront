"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";

interface BuyButtonProps {
  variantId: string;
  productTitle?: string;
  productHandle?: string;
  price?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showSecureBadge?: boolean;
}

export default function BuyButton({
  variantId,
  productTitle = "Seoul Snack Box",
  productHandle = "seoul-snack-box",
  price = "45.00",
  label = "Add to Cart 🛒",
  className = "",
  size = "md",
  showSecureBadge = true,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
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

    addToCart({
      variantId,
      productHandle,
      title: productTitle,
      variantTitle: "",
      price,
      quantity: 1,
      image: null,
    });

    // Navigate to cart page
    router.push("/cart");
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleAddToCart}
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
            Adding...
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

      {user?.email && (
        <p className="text-xs text-text-muted/70 mt-1">
          💡 Use <span className="font-medium">{user.email}</span> at checkout to track your order
        </p>
      )}
    </div>
  );
}
