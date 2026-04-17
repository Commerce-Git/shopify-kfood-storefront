"use client";

import { useState } from "react";
import Link from "next/link";

export default function OrderLookupPage() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !orderNumber) {
      setError("Please fill in both fields.");
      return;
    }

    // Redirect to Shopify's order status page
    // Format: https://store.myshopify.com/account/orders/{order_id}
    // For now, we'll direct to the Shopify order status URL
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    if (shopifyDomain) {
      window.open(
        `https://${shopifyDomain}/account/orders`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      setError("Store configuration error. Please contact support.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔍</div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your email and order number to check your order status
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="lookup-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="lookup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                  focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                  outline-none transition-all text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="lookup-order"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order Number
              </label>
              <input
                id="lookup-order"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="#1001"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl 
                  focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                  outline-none transition-all text-gray-900"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 
                text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
                transition-all shadow-lg shadow-orange-500/25"
            >
              Track My Order →
            </button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Want to manage all your orders?
          </p>
          <Link
            href="/account/login"
            className="text-sm text-orange-600 hover:text-orange-700 font-semibold underline"
          >
            Sign in to your account →
          </Link>
        </div>
      </div>
    </div>
  );
}
