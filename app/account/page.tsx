"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getOrderStep } from "@/lib/shopify/customer";
import type { MappedOrder } from "@/lib/shopify/admin";
import OrderStatusBar from "@/app/components/OrderStatusBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartProvider";

export default function AccountPage() {
  const { user, customer, isLoading, signOut, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<MappedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchOrders() {
      const cacheKey = `orders_${user?.email || "anon"}`;

      // 1. Show cached data instantly (stale-while-revalidate)
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { orders: cachedOrders, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // Use cache if less than 2 minutes old
          if (age < 2 * 60 * 1000 && cachedOrders.length > 0) {
            setOrders(cachedOrders);
            setOrdersLoading(false);
          }
        }
      } catch {
        // localStorage not available or corrupt — ignore
      }

      // 2. Always fetch fresh data in background
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders);

        // Save to localStorage for next visit
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ orders: data.orders, timestamp: Date.now() })
          );
        } catch {
          // Storage full — ignore
        }
      } catch {
        // Only show error if we don't have cached data
        if (orders.length === 0) {
          setOrdersError("Failed to load orders. Please try again.");
        }
      } finally {
        setOrdersLoading(false);
      }
    }

    if (!isLoading && user) {
      fetchOrders();
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/account/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const rawName =
    customer?.first_name || user?.user_metadata?.full_name || user?.email || "";
  // Capitalize first letter of each word
  const displayName = rawName
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600">
              {displayName.charAt(0)}
            </div>
          )}
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Welcome, {displayName}!
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 
            px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Orders */}
      <h2
        className="text-xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        📦 My Orders
      </h2>

      {ordersLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
              <div className="flex items-center justify-between mt-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex flex-col items-center gap-1">
                    <div className="h-4 w-4 bg-gray-200 rounded-full" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : ordersError ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500 mb-4">{ordersError}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 
              text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
              transition-all shadow-lg shadow-orange-500/25"
          >
            Shop Now →
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600 mb-4">No orders yet</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 
              text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 
              transition-all shadow-lg shadow-orange-500/25"
          >
            Shop Now →
          </Link>
        </div>
      ) : (
        <>
        <div className="space-y-4">
          {orders.map((order) => {
            const { step } = getOrderStep(order.fulfillmentStatus);
            const firstItem = order.lineItems.edges[0]?.node;
            const isCancelled = ["CANCELLED", "REFUNDED", "VOIDED"].includes(order.financialStatus);
            const showReorder = isCancelled || order.fulfillmentStatus === "FULFILLED";
            return (
              <Link
                key={order.id}
                href={`/account/orders/${encodeURIComponent(order.id)}`}
                className="block bg-white rounded-2xl border border-gray-100 p-6 
                  hover:shadow-lg hover:border-orange-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-semibold text-orange-600">
                      {order.name}
                    </span>
                    <h3 className="font-semibold text-lg mt-1">
                      {firstItem?.title || "Seoul Snack Box"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      ${parseFloat(order.totalPrice.amount).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(order.processedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  {isCancelled ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                        ❌ Cancelled
                      </span>
                      <span className="text-xs text-gray-400">💳 Refund processed</span>
                    </div>
                  ) : (
                    <OrderStatusBar step={step} />
                  )}
                  {showReorder && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        order.lineItems.edges.forEach(({ node }) => {
                          if (!node.variantId) return;
                          addToCart({
                            variantId: node.variantId,
                            productHandle: "",
                            title: node.title,
                            variantTitle: "",
                            price: node.variant?.price.amount || "0",
                            quantity: node.quantity,
                            image: null,
                          });
                        });
                        router.push("/cart");
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold 
                        bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all 
                        flex-shrink-0 ml-3"
                    >
                      🔄 Reorder
                    </button>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Reorder CTA */}
        <div className="mt-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 text-center border border-orange-100">
          <p className="text-2xl mb-2">🇰🇷</p>
          <p className="font-semibold text-gray-800 mb-1">
            Craving more K-Snacks?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your next Seoul Snack Box is just a click away.
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold 
              px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Order Another Box →
          </Link>
        </div>
        </>
      )}
    </div>
  );
}
