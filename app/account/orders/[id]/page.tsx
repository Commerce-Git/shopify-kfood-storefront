"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getOrderStep } from "@/lib/shopify/order-utils";
import type { MappedOrder } from "@/lib/shopify/admin";
import OrderStatusBar from "@/app/components/OrderStatusBar";
import OrderPackageCard, { PartialDeliveryNotice } from "@/app/components/OrderPackageCard";
import CancelButton from "@/app/components/CancelButton";
import { useCart } from "@/app/components/CartProvider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function OrderDetailPage() {
  const { isLoading: authLoading, isLoggedIn } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orderId = decodeURIComponent(params.id as string);

  const [order, setOrder] = useState<MappedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      // 1. Try localStorage cache first (shared with /account page)
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("orders_"));
        for (const key of keys) {
          const cached = JSON.parse(localStorage.getItem(key) || "{}");
          const age = Date.now() - (cached.timestamp || 0);
          if (age < 2 * 60 * 1000 && cached.orders) {
            const found = cached.orders.find((o: MappedOrder) => o.id === orderId);
            if (found) {
              setOrder(found);
              setLoading(false);
              break;
            }
          }
        }
      } catch {
        // Cache miss — continue to API
      }

      // 2. Always fetch fresh data
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        const found = data.orders.find((o: MappedOrder) => o.id === orderId);
        if (found) {
          setOrder(found);
        } else if (!order) {
          setError("Order not found.");
        }
      } catch {
        if (!order) setError("Failed to load order.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && isLoggedIn) {
      fetchOrder();
    }
  }, [authLoading, isLoggedIn, orderId]);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/account/login");
    }
  }, [authLoading, isLoggedIn, router]);

  if (loading || authLoading || !isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-12 text-center">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-gray-600 mb-4">{error || "Order not found"}</p>
        <Link
          href="/account"
          className="text-orange-600 hover:text-orange-700 underline"
        >
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const { step } = getOrderStep(order.fulfillmentStatus, order.wmsStatus);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-28 pb-12">
      {/* Back link */}
      <Link
        href="/account"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        ← Back to My Orders
      </Link>

      {/* Order Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Order {order.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed on{" "}
            {new Date(order.processedAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className="text-xl font-bold">
          ${parseFloat(order.totalPrice.amount).toFixed(2)}
        </span>
      </div>

      {/* Partial Delivery Notice for Multi-Package Orders */}
      {order.packages && (
        <PartialDeliveryNotice packages={order.packages} theme="light" />
      )}

      {/* Cancelled Banner */}
      {order.cancelledAt || ["CANCELLED", "REFUNDED", "VOIDED"].includes(order.financialStatus) ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Order Status
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Cancelled
            </span>
            <span className="text-xs text-gray-400">This order is cancelled and a refund has been issued.</span>
          </div>
        </div>
      ) : order.packages && order.packages.length > 0 ? (
        /* Atelier-Unit Multi-Package Breakdown */
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {order.packages.length > 1
                ? `Dispatched in ${order.packages.length} Separate Packages`
                : "Shipment Details"}
            </h2>
          </div>
          <div className="space-y-4">
            {order.packages.map((pkg, idx) => (
              <OrderPackageCard
                key={pkg.packageId}
                pkg={pkg}
                packageIndex={idx + 1}
                totalPackages={order.packages!.length}
                theme="light"
              />
            ))}
          </div>
        </div>
      ) : (
        /* Legacy Single Timeline Fallback */
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Order Status
            </h2>
            <OrderStatusBar step={step} theme="light" />
          </div>

          {/* Delivered Celebration Banner */}
          {step === 4 && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/80 p-5 mb-6 shadow-sm flex items-start sm:items-center gap-3.5 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-base" style={{ fontFamily: "var(--font-heading)" }}>
                  Package Delivered Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 mt-0.5 leading-relaxed">
                  Your handcrafted Korean treasures have arrived. We hope they bring you joy and a piece of Korea&apos;s timeless beauty!
                </p>
                {order.deliveredAt && (
                  <p className="text-xs font-semibold text-emerald-800 mt-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tracking Info */}
          {order.tracking?.number && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 mb-6">
              <h2 className="text-sm font-semibold text-blue-600 uppercase mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Shipment Tracking
              </h2>
              <div className="space-y-2">
                {order.tracking.company && (
                  <p className="text-sm text-gray-600">
                    <span className="text-gray-400">Carrier:</span>{" "}
                    <span className="font-medium">{order.tracking.company}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="text-gray-400">Tracking #:</span>{" "}
                  <span className="font-mono font-medium">{order.tracking.number}</span>
                </p>
                {order.tracking.number && (
                  <a
                    href={`https://t.17track.net/en#nums=${order.tracking.number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 
                      underline underline-offset-2"
                  >
                    Track My Package →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Estimated delivery note for shipped orders without tracking */}
          {order.fulfillmentStatus === "FULFILLED" && !order.tracking?.number && (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-6 text-center">
              <p className="text-sm text-gray-500">
                Your order has been shipped! Estimated delivery: 7–14 business days.
              </p>
            </div>
          )}

          {/* Line Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Items
            </h2>
            <div className="space-y-4">
              {order.lineItems.edges.map(({ node: item }, i) => (
                <div key={i} className="flex items-center gap-4">
                  {item.variant?.image?.url ? (
                    <img
                      src={item.variant.image.url}
                      alt={item.variant.image.altText || item.title}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  {item.variant?.price && (
                    <span className="font-semibold">
                      ${parseFloat(item.variant.price.amount).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Reorder Button — only for shipped or cancelled orders */}
      {(order.fulfillmentStatus === "FULFILLED" ||
        order.cancelledAt ||
        ["CANCELLED", "REFUNDED", "VOIDED"].includes(order.financialStatus)) && (
        <div className="mb-4">
          <ReorderButton order={order} />
        </div>
      )}

      {/* Cancel Button */}
      <div className="mb-6">
        <CancelButton
          orderId={order.id}
          orderNumber={order.name}
          processedAt={order.processedAt}
          fulfillmentStatus={order.fulfillmentStatus}
          financialStatus={order.financialStatus}
          isCancelled={!!order.cancelledAt}
        />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">
          Issue with your order?
        </p>
        <a
          href="mailto:support@blankseoul.com"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2"
        >
          Contact us and we&apos;ll help you out →
        </a>
        <p className="text-xs text-gray-400 mt-3">
          Free cancellation is available within {CANCEL_WINDOW_HOURS} hour
          {CANCEL_WINDOW_HOURS !== 1 ? "s" : ""} of placing your order.
        </p>
      </div>
    </div>
  );
}

function ReorderButton({ order }: { order: MappedOrder }) {
  const { addToCart } = useCart();
  const router = useRouter();

  function handleReorder() {
    order.lineItems.edges.forEach(({ node }) => {
      if (!node.variantId) return;
      addToCart({
        variantId: node.variantId,
        productHandle: "",
        title: node.title,
        variantTitle: node.variant?.title || "",
        price: node.variant?.price.amount || "0",
        quantity: node.quantity,
        image: (node.variant?.image as any) || null,
      });
    });
    router.push("/cart");
  }

  return (
    <button
      onClick={handleReorder}
      className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold 
        rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
    >
      🔄 Reorder This Box
    </button>
  );
}
