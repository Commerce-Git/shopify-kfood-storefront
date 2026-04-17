"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getCustomerOrders, getOrderStep } from "@/lib/shopify/customer";
import type { ShopifyOrder } from "@/lib/shopify/customer";
import OrderStatusBar from "@/app/components/OrderStatusBar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, customer, isLoading, signOut, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      if (!customer?.shopify_access_token) {
        setOrdersLoading(false);
        setOrdersError(
          "No Shopify account linked yet. Orders will appear here after your first purchase."
        );
        return;
      }

      try {
        const data = await getCustomerOrders(customer.shopify_access_token);
        setOrders(data);
      } catch {
        setOrdersError("Failed to load orders. Please try again.");
      } finally {
        setOrdersLoading(false);
      }
    }

    if (!isLoading && user) {
      fetchOrders();
    }
  }, [isLoading, user, customer]);

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

  const displayName =
    customer?.first_name || user?.user_metadata?.full_name || user?.email;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            👤 Welcome, {displayName}!
          </h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>
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
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Loading orders...</p>
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
        <div className="space-y-4">
          {orders.map((order) => {
            const { step, label } = getOrderStep(order.fulfillmentStatus);
            const firstItem = order.lineItems.edges[0]?.node;
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
                <OrderStatusBar step={step} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
