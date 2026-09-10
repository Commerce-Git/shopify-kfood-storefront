"use client";

import React from "react";
import Link from "next/link";
import { CANCEL_WINDOW_HOURS } from "@/lib/constants";

interface CartOrderSummaryProps {
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  discountLabel?: string;
  loading: boolean;
  error: string | null;
  onCheckout: () => void;
}

export default function CartOrderSummary({
  subtotal,
  discountAmount,
  finalTotal,
  discountLabel,
  loading,
  error,
  onCheckout,
}: CartOrderSummaryProps) {
  return (
    <>
      <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 space-y-4">
        <div className="bg-white border border-[#E8DFC8]/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2
            className="text-base font-extrabold text-[#18181B] pb-3 border-b border-[#E8DFC8]/50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Order Summary
          </h2>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-[#52525B]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-[#18181B]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span className="font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded text-[11px]">
                FREE
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-[#2E7D32]">
                <span className="font-medium">
                  🎫 {discountLabel || "Special"} Discount
                </span>
                <span className="font-bold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Final Total */}
          <div className="border-t border-[#E8DFC8]/60 pt-3.5 flex justify-between items-baseline">
            <div>
              <span
                className="text-sm font-extrabold text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Total (USD)
              </span>
              <p className="text-[10px] text-[#71717A]">
                Taxes and shipping included
              </p>
            </div>
            <div className="text-right">
              {discountAmount > 0 && (
                <span className="text-xs text-[#71717A] line-through mr-2">
                  ${subtotal.toFixed(2)}
                </span>
              )}
              <span
                className="text-2xl font-black text-[#18181B]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Zero Risk, Guaranteed Gold Card */}
          <div className="p-3.5 rounded-xl bg-[#FDF9F3] border border-[#E8DFC8] flex items-start gap-2.5 text-xs shadow-2xs">
            <span className="text-base shrink-0 mt-0.5">⚡</span>
            <div className="leading-relaxed">
              <p className="font-bold text-[#18181B]">Zero Risk, Guaranteed</p>
              <p className="text-[#71717A] text-[11px] mt-0.5">
                Not 100% sure? Cancel yourself in 1 click within {CANCEL_WINDOW_HOURS} hours directly from your order page.
              </p>
            </div>
          </div>

          {/* Main Checkout CTA Button */}
          <button
            type="button"
            onClick={onCheckout}
            disabled={loading}
            className={`btn-primary w-full text-sm sm:text-base font-bold py-4 shadow-md transition-all cursor-pointer ${
              loading
                ? "opacity-70 cursor-wait"
                : "hover:shadow-lg hover:scale-[1.01]"
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
                Connecting to Checkout...
              </span>
            ) : (
              "Yes! Send Me The Blank Seoul Box! 🚀"
            )}
          </button>

          {error && (
            <p className="text-xs text-red-500 text-center font-medium bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Micro Trust Bar */}
          <div className="pt-2.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-[#71717A] font-medium border-t border-[#E8DFC8]/40">
            <span className="flex items-center gap-1">🔒 256-Bit SSL</span>
            <span>•</span>
            <span className="flex items-center gap-1">✈️ 100% Free Shipping</span>
            <span>•</span>
            <span className="flex items-center gap-1">✨ Pre-Cleared Customs</span>
            <span>•</span>
            <span className="flex items-center gap-1">🛡️ 30-Day Protection</span>
          </div>
        </div>

        {/* Continue Shopping Link */}
        <div className="text-center pt-1">
          <Link
            href="/"
            className="text-xs font-bold text-[#71717A] hover:text-[#C25E38] transition-colors inline-flex items-center gap-1"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Continue Exploring Curations
          </Link>
        </div>
      </div>

      {/* Mobile Fixed Floating Checkout Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8DFC8] px-4 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:p-4 lg:hidden z-40 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
              Total
            </p>
            <p
              className="text-lg font-black text-[#18181B]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ${finalTotal.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={loading}
            className={`btn-primary flex-1 py-3 text-sm font-bold shadow-md cursor-pointer ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {loading ? "Processing..." : "Send My Box 🚀"}
          </button>
        </div>
      </div>
    </>
  );
}
