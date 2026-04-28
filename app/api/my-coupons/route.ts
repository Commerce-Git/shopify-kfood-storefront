/**
 * My Coupons API
 *
 * GET /api/my-coupons — 로그인한 사용자의 쿠폰 목록 조회
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminGraphQL } from "@/lib/shopify/admin";
import { COUPON_CONFIG } from "@/lib/coupon-config";

interface CouponItem {
  code: string;
  discountLabel: string;
  expiresAt: string;
  status: "active" | "used" | "expired";
  orderName: string;
}

async function isDiscountUsed(code: string): Promise<boolean> {
  try {
    const data = await adminGraphQL(`
      {
        codeDiscountNodeByCode(code: "${code}") {
          codeDiscount {
            ... on DiscountCodeBasic {
              asyncUsageCount
            }
          }
        }
      }
    `);
    const discount = data?.data?.codeDiscountNodeByCode?.codeDiscount;
    if (!discount) return false;
    return discount.asyncUsageCount > 0;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Supabase에서 해당 이메일의 쿠폰 조회
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("coupon_code, coupon_expires_at, order_name")
      .eq("customer_email", user.email)
      .not("coupon_code", "is", null)
      .order("coupon_expires_at", { ascending: true });

    if (error) {
      console.error("[My Coupons] DB error:", error);
      return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ coupons: [] });
    }

    const discountLabel =
      COUPON_CONFIG.discountType === "percentage"
        ? `${COUPON_CONFIG.discountValue}% OFF`
        : `$${COUPON_CONFIG.discountValue} OFF`;

    const now = new Date();
    const coupons: CouponItem[] = [];

    for (const review of reviews) {
      const expired = new Date(review.coupon_expires_at) < now;

      let status: CouponItem["status"];
      if (expired) {
        status = "expired";
      } else {
        const used = await isDiscountUsed(review.coupon_code);
        status = used ? "used" : "active";
      }

      coupons.push({
        code: review.coupon_code,
        discountLabel,
        expiresAt: review.coupon_expires_at,
        status,
        orderName: review.order_name,
      });
    }

    // active → used → expired 순, active 내에서는 만료 임박 순 (이미 ascending)
    coupons.sort((a, b) => {
      const order = { active: 0, used: 1, expired: 2 };
      return order[a.status] - order[b.status];
    });

    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("[My Coupons] Error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
