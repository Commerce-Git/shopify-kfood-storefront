"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { Coupon } from "@/lib/types/coupon";

interface AccountCouponVaultProps {
  coupons: Coupon[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export default function AccountCouponVault({
  coupons,
  copiedCode,
  onCopyCode,
}: AccountCouponVaultProps) {
  const router = useRouter();

  if (coupons.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3.5">
        <h2
          className="text-lg font-bold text-[#18181B] flex items-center gap-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span>Available Vouchers</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {coupons.filter((c) => c.status === "active").length} Active
          </span>
        </h2>
      </div>

      <div className="space-y-3">
        {coupons.map((coupon) => {
          const isActive = coupon.status === "active";
          const isUsed = coupon.status === "used";
          const expiryDate = new Date(coupon.expiresAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={coupon.code}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                isActive
                  ? "bg-white border-[#C77B4A]/30 text-[#18181B] shadow-xs"
                  : "bg-stone-50 border-stone-200 text-stone-400 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isUsed
                        ? "bg-stone-100 text-stone-500 border border-stone-200"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {isActive ? "Active" : isUsed ? "Used" : "Expired"}
                  </span>
                  <span className="font-bold text-sm text-[#C77B4A]">
                    {coupon.discountLabel}
                  </span>
                </div>
                {coupon.orderName && (
                  <span className="text-xs text-stone-400">
                    From {coupon.orderName}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-stone-100">
                <div>
                  <code className="text-base sm:text-lg font-mono font-bold tracking-wider text-[#18181B]">
                    {coupon.code}
                  </code>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isActive ? `Valid until ${expiryDate}` : isUsed ? "Already redeemed" : `Expired ${expiryDate}`}
                  </p>
                </div>
                {isActive && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCopyCode(coupon.code)}
                      className="text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors border border-stone-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{copiedCode === coupon.code ? "✓ Copied" : "Copy Code"}</span>
                    </button>
                    <button
                      onClick={() => router.push("/cart")}
                      className="text-xs font-bold text-white bg-[#C77B4A] hover:bg-[#b56b3c] px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      Apply →
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
