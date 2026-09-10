"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/components/CartProvider";
import { getOrderStep } from "@/lib/shopify/order-utils";
import type { MappedOrder } from "@/lib/shopify/admin";
import OrderStatusBar from "@/app/components/OrderStatusBar";
import OrderPackageCard, { PartialDeliveryNotice } from "@/app/components/OrderPackageCard";

interface AccountOrdersSectionProps {
  orders: MappedOrder[];
  ordersLoading: boolean;
  ordersError: string | null;
}

export default function AccountOrdersSection({
  orders,
  ordersLoading,
  ordersError,
}: AccountOrdersSectionProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleReorder = (order: MappedOrder) => {
    order.lineItems.edges.forEach(({ node }) => {
      if (!node.variantId) return;
      addToCart({
        variantId: node.variantId,
        productHandle: "",
        title: node.title,
        variantTitle: node.variant?.title || "",
        price: node.variant?.price.amount || "0",
        quantity: node.quantity,
        image: node.variant?.image
          ? {
              url: node.variant.image.url,
              altText: node.variant.image.altText ?? null,
              width: 500,
              height: 500,
            }
          : null,
      });
    });
    router.push("/cart");
  };

  return (
    <>
      {/* Order History Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl font-bold text-[#18181B]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          My Orders
        </h2>
        <span className="text-xs font-medium text-stone-400">
          {orders.length} {orders.length === 1 ? "order" : "orders"} on record
        </span>
      </div>

      {ordersLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-stone-200/80 p-6 animate-pulse shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-stone-100 rounded" />
                  <div className="h-5 w-48 bg-stone-100 rounded" />
                  <div className="h-4 w-24 bg-stone-100 rounded" />
                </div>
                <div className="h-4 w-24 bg-stone-100 rounded" />
              </div>
              <div className="flex items-center justify-between mt-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex flex-col items-center gap-1.5">
                    <div className="h-5 w-5 bg-stone-100 rounded-full" />
                    <div className="h-2.5 w-14 bg-stone-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : ordersError ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-stone-600 mb-5 text-sm">{ordersError}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-[#C77B4A] hover:bg-[#b56b3c] text-white font-bold rounded-xl transition-all shadow-xs text-sm"
          >
            Explore Collection →
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#C77B4A]">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#18181B] mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            No orders yet
          </h3>
          <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
            Your collection is waiting. Explore authentic Made in Korea goods curated directly from Seoul.
          </p>
          <Link
            href="/collections"
            className="inline-block px-7 py-3 bg-[#C77B4A] hover:bg-[#b56b3c] text-white font-bold rounded-xl transition-all shadow-xs text-sm"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Explore Made in Korea →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const { step } = getOrderStep(order.fulfillmentStatus, order.wmsStatus);
            const itemCount = order.lineItems.edges.reduce((acc, { node }) => acc + node.quantity, 0);
            const isCancelled = !!order.cancelledAt || ["CANCELLED", "REFUNDED", "VOIDED"].includes(order.financialStatus);
            const showReorder = isCancelled || order.fulfillmentStatus === "FULFILLED";
            const pkgs = order.packages || [];
            const hasMultiplePackages = pkgs.length > 1;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/80 p-6 hover:border-stone-300 transition-all text-[#18181B] shadow-xs"
              >
                {/* Order Summary Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/account/orders/${encodeURIComponent(order.id)}`}
                        className="font-bold text-lg text-[#18181B] hover:text-[#C77B4A] transition-colors flex items-center gap-1.5"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        <span>Order {order.name}</span>
                        <span className="text-sm font-normal text-stone-400 hover:text-stone-700">→</span>
                      </Link>

                      {hasMultiplePackages && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span>{pkgs.length} Separate Packages</span>
                        </span>
                      )}
                    </div>
                    <p className="text-stone-500 text-sm mt-1">
                      {itemCount} item{itemCount > 1 ? "s" : ""} • ${parseFloat(order.totalPrice.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-stone-400 block">
                      {new Date(order.processedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/account/orders/${encodeURIComponent(order.id)}`}
                      className="text-xs text-[#C77B4A] hover:underline font-semibold mt-1 inline-block"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {/* Partial Delivery Notice for Multi-Package Orders */}
                {hasMultiplePackages && (
                  <PartialDeliveryNotice packages={pkgs} theme="light" />
                )}

                {/* Main Content: Cancelled State or Packages */}
                {isCancelled ? (
                  <div className="flex items-center gap-2 text-sm text-stone-600 mt-4 p-4 rounded-2xl bg-red-50 border border-red-200/80">
                    <span className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Cancelled
                    </span>
                    <span className="text-xs text-stone-500">This order was cancelled and a refund has been processed.</span>
                  </div>
                ) : pkgs.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {pkgs.map((pkg, idx) => (
                      <OrderPackageCard
                        key={pkg.packageId}
                        pkg={pkg}
                        packageIndex={idx + 1}
                        totalPackages={pkgs.length}
                        theme="light"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Fallback for orders without package breakdown */}
                    <div className="flex items-center gap-2.5 my-4 overflow-x-auto pb-1 scrollbar-none">
                      {order.lineItems.edges.map(({ node: item }, index) => {
                        const imageUrl = item.variant?.image?.url;
                        const altText = item.variant?.image?.altText || item.title;
                        return (
                          <div key={index} className="relative flex-shrink-0 group">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={altText}
                                className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-50 group-hover:border-[#C77B4A] transition-all"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                            {item.quantity > 1 && (
                              <span className="absolute -top-1.5 -right-1.5 bg-[#18181B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white leading-none">
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4">
                      <OrderStatusBar step={step} theme="light" />
                    </div>
                  </>
                )}

                {/* Reorder Action */}
                {showReorder && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-stone-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleReorder(order);
                      }}
                      className="text-xs text-stone-700 font-semibold bg-stone-100 hover:bg-stone-200 border border-stone-200 px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reorder Items
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
