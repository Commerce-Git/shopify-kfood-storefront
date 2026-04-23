"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../components/CartProvider";
import { useAuth } from "../components/AuthProvider";
import { storefrontFetch } from "@/lib/shopify/storefront";
import { CREATE_CART } from "@/lib/shopify/queries";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";

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
  const { user } = useAuth();



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
            Get My Seoul Snack Box →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen pb-24 md:pb-0">
      <div className="section">
        <div className="section-inner max-w-3xl">
          <h1 className="heading-lg text-dark mb-2">
            Your <span className="gradient-text">Cart</span>
          </h1>
          <p className="text-text-muted mb-6">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>



          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => {
              const lineTotal = (
                parseFloat(item.price) * item.quantity
              ).toFixed(2);

              return (
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
                      ${lineTotal}
                      {item.quantity > 1 && (
                        <span className="text-xs text-text-muted font-normal ml-1">
                          (${item.price} each)
                        </span>
                      )}
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
              );
            })}
          </div>

          {/* Upsell Placeholder — activate when more products are added */}
          {/* 
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <span className="text-3xl">🌶️</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">Add Spicy Ramen Pack?</p>
              <p className="text-xs text-gray-600">Only $8.00 — pairs perfectly with your Snack Box!</p>
            </div>
            <button className="text-xs font-semibold text-orange-600 bg-white border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50">
              + Add
            </button>
          </div>
          */}

          {/* Value Propositions / Guarantees */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Your Order Guarantees
            </h3>
            <div className="space-y-5">
              {/* Free Shipping */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free International Shipping</p>
                  <p className="text-xs text-gray-500">Delivery in 7-14 business days via EMS</p>
                </div>
              </div>

              {/* Free Cancellation */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Risk-Free Purchase</p>
                  <p className="text-xs text-gray-500">Free cancellation within {CANCEL_WINDOW_HOURS} hour{CANCEL_WINDOW_HOURS !== 1 ? "s" : ""} of order</p>
                </div>
              </div>

              {/* Authenticity */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Direct From Seoul</p>
                  <p className="text-xs text-gray-500">100% authentic K-Food, packed with care</p>
                </div>
              </div>
            </div>
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
              <span className="font-semibold text-green-600">FREE</span>
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
                "Yes! Complete My Order 🎉"
              )}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span>🔒</span> Secure Shopify Checkout
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span>🔄</span> Free Cancellation before shipment
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span>📦</span> Ships from Seoul via EMS
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span>🇺🇸</span> FDA Compliant
              </div>
            </div>

            {user?.email && (
              <p className="text-xs text-text-muted/70">
                💡 Use <span className="font-medium">{user.email}</span> at checkout to track your order
              </p>
            )}
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

      {/* Mobile Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-text-muted">Total</p>
            <p
              className="text-lg font-extrabold text-dark"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ${subtotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`btn-primary flex-1 py-3.5 text-base ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {loading ? "Processing..." : "Complete Order 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}
