"use client";

import React from "react";
import type { AvailableCoupon } from "@/lib/types/coupon";

interface CartCouponDrawerProps {
  availableCoupon: AvailableCoupon | null;
  appliedCoupon: string | null;
  couponLoading: boolean;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

export default function CartCouponDrawer({
  availableCoupon,
  appliedCoupon,
  couponLoading,
  onApplyCoupon,
  onRemoveCoupon,
}: CartCouponDrawerProps) {
  if (couponLoading) return null;

  if (availableCoupon && !appliedCoupon) {
    return (
      <div className="bg-[#FDF9F3] border border-[#E8DFC8] rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎫</span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#18181B]">
                You have a {availableCoupon.discountLabel} discount coupon!
              </p>
              <p className="text-[11px] text-[#71717A]">
                Code:{" "}
                <code className="font-bold text-[#C25E38]">
                  {availableCoupon.code}
                </code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onApplyCoupon(availableCoupon.code)}
            className="text-xs font-bold text-white bg-[#C25E38] hover:bg-[#A74B28] px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Apply Coupon
          </button>
        </div>
      </div>
    );
  }

  if (appliedCoupon) {
    return (
      <div className="bg-[#E8F5E9]/80 border border-[#C8E6C9] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">✅</span>
          <div>
            <span className="text-xs font-bold text-[#1B5E20]">
              {availableCoupon?.discountLabel || "Special"} coupon applied!
            </span>
            <span className="text-[10px] font-bold text-[#2E7D32] bg-white px-2 py-0.5 rounded border border-[#C8E6C9] ml-2">
              {appliedCoupon}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemoveCoupon}
          className="text-xs text-[#71717A] hover:text-red-500 font-bold transition-colors cursor-pointer"
        >
          Remove
        </button>
      </div>
    );
  }

  return null;
}
