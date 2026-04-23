"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getOrderStep } from "@/lib/shopify/customer";
import type { MappedOrder } from "@/lib/shopify/admin";
import OrderStatusBar from "@/app/components/OrderStatusBar";
import CancelButton from "@/app/components/CancelButton";
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
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        const found = data.orders.find((o: MappedOrder) => o.id === orderId);
        if (found) {
          setOrder(found);
        } else {
          setError("Order not found.");
        }
      } catch {
        setError("Failed to load order.");
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

  const { step } = getOrderStep(order.fulfillmentStatus);

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

      {/* Status Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
          Order Status
        </h2>
        <OrderStatusBar step={step} />
      </div>

      {/* Tracking Info */}
      {order.tracking?.number && (
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-blue-600 uppercase mb-3">
            📦 Shipment Tracking
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
            {order.tracking.url && (
              <a
                href={order.tracking.url}
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
            ✈️ Your order has been shipped! Estimated delivery: 7–14 business days.
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
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                  📦
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

      {/* Cancel Button */}
      <div className="mb-6">
        <CancelButton
          orderId={order.id}
          orderNumber={order.name}
          processedAt={order.processedAt}
          fulfillmentStatus={order.fulfillmentStatus}
          financialStatus={order.financialStatus}
        />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">
          Issue with your order?
        </p>
        <a
          href="mailto:support@seoulsnackbox.com"
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
