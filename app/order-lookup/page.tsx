"use client";

import { useState } from "react";
import Link from "next/link";

interface TrackingInfo {
  number: string;
  carrier: string;
}

interface TrackedOrder {
  name: string;
  date: string;
  status: "preparing" | "shipped";
  itemCount: number;
  tracking: TrackingInfo | null;
}

interface TrackResult {
  maskedEmail: string;
  orders: TrackedOrder[];
}

export default function OrderLookupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTracking, setExpandedTracking] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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

                {/* Order cards */}
                {result.orders.map((order) => (
                  <div
                    key={order.name}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    {/* Order header */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3
                          className="font-bold text-gray-900"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {order.name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {order.date}
                        </span>
                      </div>

                      {/* Status badge */}
                      {order.status === "shipped" ? (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full border border-green-100">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Shipped
                          </span>
                          <span className="text-xs text-gray-400">
                            {order.itemCount} item
                            {order.itemCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-sm font-medium px-3 py-1 rounded-full border border-orange-100">
                            📋 Preparing
                          </span>
                          <span className="text-xs text-gray-400">
                            {order.itemCount} item
                            {order.itemCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

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
                ))}

                {/* Marketing CTA */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 text-center border border-orange-100">
                  <p className="text-lg font-bold text-gray-900 mb-1">
                    🎉 Love K-Food?
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Order your next Blank Seoul box while you wait!
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 
                      text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
                      transition-all shadow-md shadow-orange-500/25"
                  >
                    Shop Blank Seoul →
                  </Link>
                </div>
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
