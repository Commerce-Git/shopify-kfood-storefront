"use client";

import { useState, useEffect } from "react";
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
  const { items, itemCount, subtotal, removeFromCart, updateQuantity, backupToStorageOnly, restoreFromBackup, dismissBackup, getCheckoutBackup } =
    useCart();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [backup, setBackup] = useState<any>(null);

  // Initialize backup safely on client mount to prevent hydration mismatch
  useEffect(() => {
    if (itemCount === 0) {
      setBackup(getCheckoutBackup());
    }
  }, [itemCount, getCheckoutBackup]);

  const handleDismissBackup = () => {
    dismissBackup();
    setBackup(null);
  };

  // Coupon state
  interface AvailableCoupon {
    code: string;
    discountLabel: string;
    expiresAt: string;
  }
  const [availableCoupon, setAvailableCoupon] = useState<AvailableCoupon | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);


  // Fetch available coupons for logged-in users
  useEffect(() => {
    if (!user?.email) return;
    setCouponLoading(true);
    fetch("/api/my-coupons")
      .then((res) => res.json())
      .then((data) => {
        const active = data.coupons?.find(
          (c: AvailableCoupon & { status: string }) => c.status === "active"
        );
        if (active) setAvailableCoupon(active);
      })
      .catch(() => {})
      .finally(() => setCouponLoading(false));
  }, [user?.email]);

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
        discountCodes: appliedCoupon ? [appliedCoupon] : undefined,
      });

      const { cart, userErrors } = data.cartCreate;

      if (userErrors.length > 0) {
        setError(userErrors[0].message);
        return;
      }

      // Show redirect overlay BEFORE touching storage
      setIsRedirecting(true);

      // Backup to localStorage only (no React re-render = no flash)
      backupToStorageOnly(items.map((i) => i.variantId));

      window.location.href = cart.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsRedirecting(false);
    } finally {
      setLoading(false);
    }
  }

  // Full-screen redirect overlay
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Redirecting to Secure Checkout
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please wait while we connect you to our payment partner...
          </p>
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="heading-md text-dark mb-3">Your Blank Seoul Box is Waiting!</h1>
          <p className="text-text-muted mb-8">
            Looks like you haven&apos;t added any K-Culture items yet!
          </p>

          {/* Checkout restore banner */}
          {backup && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 max-w-sm mx-auto">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                Didn&apos;t complete your purchase?
              </p>
              <p className="text-xs text-amber-700 mb-4">
                Your previous cart ({backup.items.length} {backup.items.length === 1 ? "item" : "items"}) is saved.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={restoreFromBackup}
                  className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500
                    text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  Restore My Cart
                </button>
                <button
                  onClick={handleDismissBackup}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl
                    border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  No Thanks
                </button>
              </div>
            </div>
          )}

          <Link href="/" className="btn-primary">
            Yes, Build My Blank Seoul Box! →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#faf9f6]">
      {/* Walled Garden Layout CSS override */}
      <style dangerouslySetInnerHTML={{ __html: `
        header, footer {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          background-color: #faf9f6 !important;
        }
      `}} />

      {/* Simplified Secure Checkout Header */}
      <div className="bg-white border-b border-gray-200/60 py-4.5 mb-8 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-3 items-center">
          {/* Col 1: Left-aligned Back Link */}
          <div className="justify-self-start">
            <Link
              href="/"
              className="text-xs font-semibold text-text-light hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to Shop
            </Link>
          </div>

          {/* Col 2: Centered Brand Logo matching main Header */}
          <div className="justify-self-center">
            <Link href="/" className="flex items-center gap-1">
              <span
                className="text-xl sm:text-2xl font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="gradient-text">Blank</span>
                <span className="text-dark"> Seoul</span>
              </span>
            </Link>
          </div>

          {/* Col 3: Right-aligned Secure Checkout Badge */}
          <div className="justify-self-end">
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50/80 px-3 py-1 rounded-full border border-green-200/50">
              <span>🔒</span> Secure Checkout
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Stepper */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-text-muted select-none">
          <div className="flex items-center gap-1.5 sm:gap-2 text-primary font-bold">
            <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Review Cart</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200/60 mx-2 sm:mx-4" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px]">2</span>
            <span className="hidden sm:inline">Shipping Info</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200/60 mx-2 sm:mx-4" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px]">3</span>
            <span className="hidden sm:inline">Secure Payment</span>
          </div>
        </div>
      </div>

      <div className="section pt-0">
        <div className="section-inner max-w-3xl">
          <h1 className="heading-lg text-dark mb-2">
            Your Cart
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
                    {item.image?.url && item.image.url.trim() !== "" ? (
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

                  <div className="flex flex-col items-center">
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
                        disabled={item.stockLimit !== undefined && item.stockLimit !== null && item.quantity >= item.stockLimit}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary transition-colors text-sm disabled:opacity-30 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    {item.stockLimit !== undefined && item.stockLimit !== null && item.quantity >= item.stockLimit && (
                      <span className="text-[9px] text-amber-600 font-semibold mt-1 select-none whitespace-nowrap animate-pulse">
                        Max stock reached ({item.stockLimit} left)
                      </span>
                    )}
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
              <p className="text-xs text-gray-600">Only $8.00 — pairs perfectly with your Blank Seoul Box!</p>
            </div>
            <button className="text-xs font-semibold text-orange-600 bg-white border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50">
              + Add
            </button>
          </div>
          */}

          {/* Coupon Banner */}
          {!couponLoading && availableCoupon && !appliedCoupon && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎫</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      You have a {availableCoupon.discountLabel} coupon!
                    </p>
                    <p className="text-xs text-gray-500">
                      Code: <code className="font-semibold">{availableCoupon.code}</code>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAppliedCoupon(availableCoupon.code)}
                  className="text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 
                    hover:from-orange-600 hover:to-red-600 px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  Yes, Apply My Coupon! 🎉
                </button>
              </div>
            </div>
          )}

          {/* Applied Coupon */}
          {appliedCoupon && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-sm font-semibold text-green-800">
                    {availableCoupon?.discountLabel} coupon applied!
                  </span>
                  <code className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    {appliedCoupon}
                  </code>
                </div>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
              <p className="text-xs text-green-600 mt-1 ml-7">
                Discount will be applied at checkout
              </p>
            </div>
          )}



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
                  <p className="text-sm font-semibold text-gray-900">We Cover Your Shipping</p>
                  <p className="text-xs text-gray-500">Your order ships for free — tracked all the way to your door.</p>
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
                  <p className="text-sm font-semibold text-gray-900">Zero Risk, Guaranteed</p>
                  <p className="text-xs text-gray-500">Not 100% sure? No problem — cancel it yourself in one click within {CANCEL_WINDOW_HOURS} hours.</p>
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
                  <p className="text-sm font-semibold text-gray-900">You Can&#39;t Get This Anywhere Else</p>
                  <p className="text-xs text-gray-500">Every piece is handmade by Korean artisans — shipped only from Seoul.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Objection FAQ */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <details className="group [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between text-sm font-semibold text-gray-900 group-open:text-primary transition-colors">
                  <span>When will my order ship and arrive?</span>
                  <span className="transition-transform group-open:-rotate-180 text-xs text-text-light">▼</span>
                </summary>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  All orders are securely packaged and shipped directly from Seoul within 1-2 business days. Delivery via Tracked Air Mail takes 7-14 business days globally, with full live tracking.
                </p>
              </details>

              <details className="group [&_summary::-webkit-details-marker]:hidden cursor-pointer border-t border-gray-100 pt-4">
                <summary className="flex items-center justify-between text-sm font-semibold text-gray-900 group-open:text-primary transition-colors">
                  <span>How do I cancel my order?</span>
                  <span className="transition-transform group-open:-rotate-180 text-xs text-text-light">▼</span>
                </summary>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  You have a {CANCEL_WINDOW_HOURS}-hour grace period to cancel your order directly from your confirmation page in a single click — no customer support emails needed.
                </p>
              </details>

              <details className="group [&_summary::-webkit-details-marker]:hidden cursor-pointer border-t border-gray-100 pt-4">
                <summary className="flex items-center justify-between text-sm font-semibold text-gray-900 group-open:text-primary transition-colors">
                  <span>Are these authentic artisan goods?</span>
                  <span className="transition-transform group-open:-rotate-180 text-xs text-text-light">▼</span>
                </summary>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Yes. We source directly from independent Korean designers and artisans in Seoul. Every piece represents genuine Korean heritage and craftsmanship.
                </p>
              </details>
            </div>
          </div>

          {/* Summary */}
          {(() => {
            // Calculate discount when coupon is applied
            let discountAmount = 0;
            if (appliedCoupon && availableCoupon) {
              const match = availableCoupon.discountLabel.match(/(\d+)%/);
              if (match) {
                discountAmount = subtotal * (parseInt(match[1]) / 100);
              }
            }
            const total = subtotal - discountAmount;

            return (
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      🎫 {availableCoupon?.discountLabel} Discount
                    </span>
                    <span className="font-semibold text-green-600">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-4 flex justify-between">
                  <span
                    className="text-base font-bold text-dark"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Total
                  </span>
                  <div className="text-right">
                    {discountAmount > 0 && (
                      <span className="text-sm text-text-muted line-through mr-2">
                        ${subtotal.toFixed(2)}
                      </span>
                    )}
                    <span
                      className={`text-xl font-extrabold ${discountAmount > 0 ? "text-green-600" : "text-dark"}`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className={`btn-primary w-full text-base py-4 mt-2 ${loading ? "opacity-70 cursor-wait" : ""
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
                    "Yes! Send Me The Blank Seoul Box! 🚀"
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
                    <span>📦</span> Free Tracked Air Shipping
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span>🇰🇷</span> Handcrafted in Korea
                  </div>
                </div>

                {user?.email && (
                  <p className="text-xs text-text-muted/70">
                    💡 Use <span className="font-medium">{user.email}</span> at checkout to track your order
                  </p>
                )}
              </div>
            );
          })()}

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
            {(() => {
              let discount = 0;
              if (appliedCoupon && availableCoupon) {
                const m = availableCoupon.discountLabel.match(/(\d+)%/);
                if (m) discount = subtotal * (parseInt(m[1]) / 100);
              }
              return (
                <p
                  className={`text-lg font-extrabold ${discount > 0 ? "text-green-600" : "text-dark"}`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  ${(subtotal - discount).toFixed(2)}
                </p>
              );
            })()}
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`btn-primary flex-1 py-3.5 text-base ${loading ? "opacity-70 cursor-wait" : ""
              }`}
          >
            {loading ? "Processing..." : "Send My Blank Seoul Box 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
