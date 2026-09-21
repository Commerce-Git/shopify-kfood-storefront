"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CANCEL_WINDOW_HOURS, isStoreLive } from "@/lib/constants";
import { useLaunchWaitlist } from "@/lib/hooks/useLaunchWaitlist";
import PrelaunchWaitlistCard from "@/app/components/PrelaunchWaitlistCard";

interface CartOrderSummaryProps {
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  discountLabel?: string;
  loading: boolean;
  error: string | null;
  items?: { title: string; variantTitle?: string; price: string }[];
  onCheckout: () => void;
}

export default function CartOrderSummary({
  subtotal,
  discountAmount,
  finalTotal,
  discountLabel,
  loading,
  error,
  items,
  onCheckout,
}: CartOrderSummaryProps) {
  const router = useRouter();
  const { isRegistered: waitlistRegistered, isSuccess: waitlistSuccess } =
    useLaunchWaitlist();
  const isSubscribedState = waitlistRegistered || waitlistSuccess;

  const handleMobileWaitlistClick = () => {
    if (isSubscribedState) {
      router.push("/collections");
      return;
    }
    const el = document.getElementById("summary-waitlist-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = document.getElementById(
        "summary-waitlist-email-input"
      ) as HTMLInputElement | null;
      if (input) input.focus();
    }
  };

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
                <span className="font-medium inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v2M13 17v2M13 11v2" />
                  </svg>
                  {discountLabel || "Special"} Discount
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

          {/* Pre-launch Inline Email Capture (Collector Circle Style) OR Live Checkout */}
          {!isStoreLive() ? (
            <PrelaunchWaitlistCard items={items} layout="summary" idPrefix="summary-waitlist" />
          ) : (
            <>
              {/* Zero Risk, Guaranteed Gold Card */}
              <div className="p-3.5 rounded-xl bg-[#FDF9F3] border border-[#E8DFC8] flex items-start gap-2.5 text-xs shadow-2xs">
                <span className="w-4 h-4 text-[#C25E38] shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <div className="leading-relaxed">
                  <p className="font-bold text-[#18181B]">Zero Risk, Guaranteed</p>
                  <p className="text-[#71717A] text-[11px] mt-0.5">
                    Changed your mind? Cancel yourself in 1 click within {CANCEL_WINDOW_HOURS} hours directly from your order page.
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
                    : "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
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
                  "Yes! Send Me The Blank Seoul Box →"
                )}
              </button>
            </>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center font-medium bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Micro Trust Bar */}
          <div className="pt-2.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[11px] text-[#71717A] font-medium border-t border-[#E8DFC8]/40">
            {!isStoreLive() ? (
              <span className="flex items-center gap-1.5 text-center">
                <span className="w-2 h-2 rounded-full bg-[#C25E38]" />
                <span>100% Made in Korea &middot; Direct Dispatch</span>
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#71717A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  256-Bit SSL
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#71717A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M13 2l9 10-9 10" /></svg>
                  Free Tracked Shipping
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#71717A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  Pre-Cleared Customs
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#71717A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  30-Day Protection
                </span>
              </>
            )}
          </div>
        </div>

        {/* Continue Shopping Link (only show if not already subscribed, since card has primary explore button) */}
        {!isSubscribedState && (
          <div className="text-center pt-1">
            <Link
              href="/collections"
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
        )}
      </div>

      {/* Mobile Fixed Floating Checkout Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8DFC8] px-4 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:p-4 lg:hidden z-40 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="shrink-0 pl-1">
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
          {!isStoreLive() ? (
            <button
              type="button"
              onClick={handleMobileWaitlistClick}
              className="btn-primary flex-1 py-3 px-4 text-sm font-bold shadow-md cursor-pointer text-center active:scale-[0.98] transition-all"
            >
              {isSubscribedState ? "Explore Curations →" : "Notify Me at Launch →"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onCheckout}
              disabled={loading}
              className={`btn-primary flex-1 py-3 px-4 text-sm font-bold shadow-md cursor-pointer active:scale-[0.98] transition-all ${
                loading ? "opacity-70 cursor-wait" : ""
              }`}
            >
              {loading ? "Processing..." : "Complete Order →"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
