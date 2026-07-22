"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OrderStatusBar from "@/app/components/OrderStatusBar";
import { getOrderStep } from "@/lib/shopify/order-utils";

interface TrackingInfo {
  number: string;
  carrier: string;
}

interface TrackedLineItem {
  title: string;
  quantity: number;
  imageUrl: string | null;
  altText: string | null;
}

interface TrackedOrder {
  name: string;
  date: string;
  status: "preparing" | "shipped";
  fulfillmentStatus: string;
  wmsStatus: "placed" | "crafting" | "packaging" | "shipped";
  itemCount: number;
  totalPrice?: string;
  lineItems?: TrackedLineItem[];
  tracking: TrackingInfo | null;
}

interface TrackResult {
  maskedEmail: string;
  isSubscribed?: boolean;
  orders: TrackedOrder[];
}

function OrderLookupContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTracking, setExpandedTracking] = useState<string | null>(null);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isLocallySubscribed, setIsLocallySubscribed] = useState(false);

  // Check localStorage for subscription status
  useEffect(() => {
    if (typeof window !== "undefined" && email) {
      const saved = localStorage.getItem(`blank_seoul_subscribed_${email.trim().toLowerCase()}`);
      if (saved === "true") {
        setIsLocallySubscribed(true);
      } else {
        setIsLocallySubscribed(false);
      }
    }
  }, [email]);

  // Sync newsletter email with search email when results are fetched
  useEffect(() => {
    if (result && email) {
      setNewsletterEmail(email);
    }
  }, [result, email]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterStatus("loading");
    setNewsletterMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterMessage(data.message || "Thank you for subscribing! 🎉");
        if (typeof window !== "undefined" && newsletterEmail) {
          localStorage.setItem(`blank_seoul_subscribed_${newsletterEmail.trim().toLowerCase()}`, "true");
          setIsLocallySubscribed(true);
        }
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage("Network error. Please check your connection.");
    }
  };

  // Common tracking fetch executor
  const executeTrack = async (emailVal: string) => {
    if (!emailVal.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);

      if (typeof window !== "undefined" && emailVal) {
        const key = `blank_seoul_subscribed_${emailVal.trim().toLowerCase()}`;
        if (data.isSubscribed) {
          setIsLocallySubscribed(true);
          localStorage.setItem(key, "true");
        } else {
          setIsLocallySubscribed(false);
          localStorage.removeItem(key);
        }
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on email query param change automatically
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      executeTrack(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    executeTrack(email);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setEmail("");
    setExpandedTracking(null);
  };

  const get17TrackUrl = (trackingNumber: string) =>
    `https://t.17track.net/en#nums=${trackingNumber}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📦</div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Track Your Order
          </h1>
          <p className="text-gray-500">
            Enter your email to check delivery status
          </p>
        </div>

        {/* Search Form — always visible */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="track-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="track-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="The email you used at checkout"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                  focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                  outline-none transition-all text-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 
                text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
                transition-all shadow-lg shadow-orange-500/25
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                "Track My Orders →"
              )}
            </button>
          </form>

          {/* Tip */}
          <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
            <span className="mt-0.5">💡</span>
            <span>
              You can also find tracking links in the shipping confirmation
              email we sent you.
            </span>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {result.orders.length === 0 ? (
              /* No orders found */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  No orders found
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  We couldn&apos;t find any orders for this email.
                  <br />
                  Make sure you&apos;re using the same email you entered at
                  checkout.
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  ← Try another email
                </button>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Still need help? Contact us at{" "}
                    <a
                      href="mailto:support@blankseoul.com"
                      className="text-orange-500 hover:underline"
                    >
                      support@blankseoul.com
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Orders header */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-gray-500">
                    Found{" "}
                    <span className="font-semibold text-gray-700">
                      {result.orders.length}
                    </span>{" "}
                    order{result.orders.length !== 1 ? "s" : ""} for{" "}
                    <span className="font-medium">{result.maskedEmail}</span>
                  </p>
                  <button
                    onClick={handleReset}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Change email
                  </button>
                </div>

                {/* Newsletter CTA — Top Position (Hidden if already subscribed) */}
                {!result?.isSubscribed && !isLocallySubscribed && (
                  <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/60 rounded-2xl p-6 text-center border border-orange-100/80 shadow-sm my-4">
                    <p className="font-semibold text-gray-800 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                      Stay Connected with Blank Seoul
                    </p>
                    
                    <div className="text-sm text-gray-600 my-4 space-y-2.5 max-w-sm mx-auto text-left">
                      <div className="flex items-start gap-2">
                        <span className="text-orange-500">✨</span>
                        <p>
                          <strong>First alerts</strong>{" "}on new masterpiece drops by Korea&apos;s master artisans.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-500">📜</span>
                        <p>
                          <strong>Exclusive stories</strong>{" "}straight from their private workshops.
                        </p>
                      </div>
                    </div>

                    {newsletterStatus === "success" ? (
                      <div className="bg-orange-100/50 border border-orange-200/50 rounded-xl p-4 max-w-sm mx-auto animate-fade-in">
                        <span className="text-2xl mb-1 block">🎉</span>
                        <p className="text-orange-800 font-semibold text-sm">{newsletterMessage}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                        <input
                          type="email"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={newsletterStatus === "loading"}
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-base disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={newsletterStatus === "loading"}
                          className="px-5 py-2 rounded-xl font-semibold text-sm transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {newsletterStatus === "loading" ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Get Early Access 🚀"
                          )}
                        </button>
                      </form>
                    )}

                    {newsletterStatus === "error" && (
                      <p className="text-red-600 text-[11px] mt-2 font-medium">{newsletterMessage}</p>
                    )}

                    <p className="text-xs text-gray-400 mt-4 leading-none">
                      * No spam. Unsubscribe at any time. View our{" "}
                      <Link href="/policies/privacy" className="underline hover:text-gray-600 transition-colors">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {/* Order cards */}
                {result.orders.map((order) => {
                  const { step } = getOrderStep(order.fulfillmentStatus, order.wmsStatus);

                  return (
                    <div
                      key={order.name}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                      {/* Order header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3
                              className="font-bold text-lg text-gray-900"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              Order {order.name.startsWith("#") ? order.name : `#${order.name}`}
                            </h3>
                            <p className="text-gray-500 text-sm mt-0.5">
                              {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                              {order.totalPrice ? ` • $${order.totalPrice}` : ""}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {order.date}
                          </span>
                        </div>

                        {/* Product Thumbnails Row */}
                        {order.lineItems && order.lineItems.length > 0 && (
                          <div className="flex items-center gap-2.5 my-4 overflow-x-auto pb-1 scrollbar-none">
                            {order.lineItems.map((item, index) => (
                              <div key={index} className="relative flex-shrink-0 group">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.altText || item.title}
                                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-50 group-hover:border-orange-200 transition-all"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
                                    📦
                                  </div>
                                )}
                                {item.quantity > 1 && (
                                  <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white leading-none">
                                    x{item.quantity}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Live Handcrafting Progress Stepper */}
                        <div className="mt-6 mb-8 pt-4 pb-2 border-t border-gray-50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-1">
                            <span>✨</span> Live Crafting & Delivery Status
                          </p>
                          <OrderStatusBar step={step} />
                        </div>

                        {/* Tracking info */}
                        {order.tracking ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">
                                  {order.tracking.carrier}
                                </p>
                                <p className="text-sm font-mono font-semibold text-gray-800">
                                  {order.tracking.number}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setExpandedTracking(
                                    expandedTracking === order.name
                                      ? null
                                      : order.name
                                  )
                                }
                                className="text-sm font-medium text-orange-600 hover:text-orange-700 
                                  transition-colors flex items-center gap-1"
                              >
                                {expandedTracking === order.name
                                  ? "Hide details"
                                  : "Track"}
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  className={`transition-transform duration-200 ${
                                    expandedTracking === order.name
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </button>
                            </div>

                            {/* 17Track link (always available as fallback) */}
                            <a
                              href={get17TrackUrl(order.tracking.number)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 
                                bg-blue-50 text-blue-700 text-sm font-medium rounded-xl 
                                hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                              </svg>
                              View Live Tracking on 17Track →
                            </a>
                          </div>
                        ) : (
                          <div className="bg-orange-50 rounded-xl px-4 py-4 text-center">
                            <p className="text-sm text-orange-800 font-medium">
                              ✈️ Your box is being prepared in Seoul!
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              You&apos;ll receive a tracking number once it ships.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Expanded 17Track iframe */}
                      {expandedTracking === order.name && order.tracking && (
                        <div className="border-t border-gray-100">
                          <iframe
                            src={`https://t.17track.net/en#nums=${order.tracking.number}`}
                            title={`Tracking details for ${order.tracking.number}`}
                            className="w-full border-0"
                            style={{ height: "500px" }}
                            sandbox="allow-scripts allow-same-origin allow-popups"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Bottom link (only when no results shown) */}
        {!result && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Have an account? View all your orders there.
            </p>
            <Link
              href="/account"
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold underline"
            >
              Sign in to your account →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderLookupContent />
    </Suspense>
  );
}
