/**
 * Global Coupon Types (SSOT)
 */

export interface Coupon {
  code: string;
  discountLabel: string;
  expiresAt: string;
  status: "active" | "used" | "expired";
  orderName?: string;
}

export interface AvailableCoupon {
  code: string;
  discountLabel: string;
  expiresAt: string;
}
