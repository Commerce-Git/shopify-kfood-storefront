"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../components/CartProvider";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { CREATE_CART } from "@/lib/shopify/queries";

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

export default function CartPage() {
  const { items, itemCount, subtotal, removeFromCart, updateQuantity } =
    useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const lines = items.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }));

      const data = await storefrontFetch<CartResponse>(CREATE_CART, {
        lines,
      });

      const { cart, userErrors } = data.cartCreate;

      if (userErrors.length > 0) {
        setError(userErrors[0].message);
        return;
      }

      window.location.href = cart.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (itemCount === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="heading-md text-dark mb-3">Your cart is empty</h1>
          <p className="text-text-muted mb-8">
            Looks like you haven&apos;t added any K-Food snacks yet!
          </p>
          <Link href="/" className="btn-primary">
            Explore Snack Boxes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="section">
        <div className="section-inner max-w-3xl">
          <h1 className="heading-lg text-dark mb-2">
            Your <span className="gradient-text">Cart</span>
          </h1>
          <p className="text-text-muted mb-10">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>

          {/* Cart Items */}
          <div className="space-y-4 mb-10">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 p-4 bg-white rounded-xl border border-border-light"
              >
                <div className="w-20 h-20 rounded-lg bg-surface-dim overflow-hidden flex-shrink-0 relative">
                  {item.image ? (
                    <Image
                      src={item.image.url}
                      alt={item.image.altText || item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold text-dark truncate"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.title}
                  </h3>
                  {item.variantTitle !== "Default Title" && (
                    <p className="text-xs text-text-muted">
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-dark mt-1">
                    ${item.price}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors text-sm"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors text-sm"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.variantId)}
                  className="text-text-light hover:text-red-500 transition-colors self-start"
                  aria-label="Remove item"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-surface-dim rounded-2xl p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-semibold text-dark">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Shipping</span>
              <span className="text-text-muted">Calculated at checkout</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span
                className="text-base font-bold text-dark"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Total
              </span>
              <span
                className="text-xl font-extrabold text-dark"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`btn-primary w-full text-base py-4 mt-2 ${
                loading ? "opacity-70 cursor-wait" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Redirecting to checkout...
                </span>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <p className="text-xs text-text-muted text-center flex items-center justify-center gap-1 pt-1">
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
          </div>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
