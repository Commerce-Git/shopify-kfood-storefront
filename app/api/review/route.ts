/**
 * Review API
 *
 * POST /api/review — 리뷰 제출 + Shopify 쿠폰 자동 생성 + 확인 이메일 발송
 * GET  /api/review — 승인된 공개 리뷰 조회 (상품 페이지용)
 * GET  /api/review?token=xxx — 토큰 상태 조회 (리뷰 페이지 재방문용)
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminGraphQL } from "@/lib/shopify/admin";
import { COUPON_CONFIG, generateCouponCode } from "@/lib/coupon-config";
import { CouponConfirmationEmail } from "@/emails/CouponConfirmationEmail";
import { getReviewStatus } from "@/lib/review-filter";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

// ---- Shopify 쿠폰 생성 ----

async function createShopifyDiscount(
  couponCode: string,
  expiresAt: Date
) {
  const startsAt = new Date().toISOString();
  const endsAt = expiresAt.toISOString();

  // Build discount value input based on config
  const customerGetsValue =
    COUPON_CONFIG.discountType === "percentage"
      ? { percentage: COUPON_CONFIG.discountValue / 100 }
      : { discountAmount: { amount: String(COUPON_CONFIG.discountValue), appliesOnEachItem: false } };

  // Build variables object — all dynamic values passed safely via GraphQL variables
  const variables: Record<string, unknown> = {
    title: `Review Reward - ${couponCode}`,
    code: couponCode,
    startsAt,
    endsAt,
    usageLimit: COUPON_CONFIG.usageLimit,
    customerGetsValue,
  };

  // Add minimum requirement if configured
  const minimumRequirementFragment = COUPON_CONFIG.minimumOrderAmount != null
    ? `minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: $minimumSubtotal } }`
    : "";

  if (COUPON_CONFIG.minimumOrderAmount != null) {
    variables.minimumSubtotal = String(COUPON_CONFIG.minimumOrderAmount);
  }

  const minimumSubtotalParam = COUPON_CONFIG.minimumOrderAmount != null
    ? "$minimumSubtotal: Decimal!"
    : "";

  const mutation = `
    mutation CreateDiscount(
      $title: String!
      $code: String!
      $startsAt: DateTime!
      $endsAt: DateTime!
      $usageLimit: Int!
      $customerGetsValue: DiscountCustomerGetsValueInput!
      ${minimumSubtotalParam}
    ) {
      discountCodeBasicCreate(basicCodeDiscount: {
        title: $title
        code: $code
        startsAt: $startsAt
        endsAt: $endsAt
        usageLimit: $usageLimit
        customerGets: {
          value: $customerGetsValue
          items: { all: true }
        }
        customerSelection: { all: true }
        ${minimumRequirementFragment}
      }) {
        codeDiscountNode {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await adminGraphQL(mutation, variables);
  const errors = result.data?.discountCodeBasicCreate?.userErrors;
  if (errors?.length > 0) {
    throw new Error(`Shopify discount error: ${JSON.stringify(errors)}`);
  }
  return result;
}

// ---- POST: 리뷰 제출 ----

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token." }, { status: 400 });
    }

    // 1. 토큰 검증
    const { data: review, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("token", token)
      .single();

    if (fetchError || !review) {
      return NextResponse.json({ error: "Review link not found." }, { status: 404 });
    }

    if (review.rating !== null) {
      return NextResponse.json(
        { error: "You have already submitted a review.", couponCode: review.coupon_code },
        { status: 409 }
      );
    }

    if (new Date(review.token_expires_at) < new Date()) {
      return NextResponse.json({ error: "This review link has expired." }, { status: 410 });
    }

    // 2. 리뷰 데이터 검증
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const reviewBody = typeof body.body === "string" ? body.body.trim().slice(0, 2000) : "";
    if (!reviewBody) {
      return NextResponse.json({ error: "Review text is required." }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : null;
    const photoUrls = Array.isArray(body.photoUrls)
      ? body.photoUrls.filter((u: unknown) => typeof u === "string").slice(0, 3)
      : [];

    // 비공개 피드백 필드 — 폼에서 더 이상 수집하지 않음 (DB 컬럼 유지, 값만 비움)
    const favoriteProducts: string[] = [];
    const leastFavoriteProducts: string[] = [];
    const wantNext: string[] = [];
    const privateComment = null;

    // 3. 금지어 필터
    const status = getReviewStatus(title, reviewBody);

    // 4. Shopify 쿠폰 생성
    const couponCode = generateCouponCode();
    const couponExpiresAt = new Date();
    couponExpiresAt.setDate(couponExpiresAt.getDate() + COUPON_CONFIG.validityDays);

    await createShopifyDiscount(couponCode, couponExpiresAt);

    // 5. Supabase 업데이트
    const { error: updateError } = await supabaseAdmin
      .from("reviews")
      .update({
        rating,
        title,
        body: reviewBody,
        photo_urls: photoUrls,
        favorite_snacks: favoriteProducts, // Keep legacy column name for DB
        least_favorite_snacks: leastFavoriteProducts, // Keep legacy column name for DB
        want_next: wantNext,
        private_comment: privateComment,
        status,
        coupon_code: couponCode,
        coupon_expires_at: couponExpiresAt.toISOString(),
        submitted_at: new Date().toISOString(),
      })
      .eq("token", token);

    if (updateError) {
      console.error("[Review API] Update error:", updateError);
      return NextResponse.json({ error: "Failed to save review." }, { status: 500 });
    }

    const discountLabel =
      COUPON_CONFIG.discountType === "percentage"
        ? `${COUPON_CONFIG.discountValue}% OFF`
        : `$${COUPON_CONFIG.discountValue} OFF`;

    // 6. 쿠폰 확인 이메일 발송 (fire-and-forget, opt-out 체크 안 함 — 거래 이메일)
    const unsubscribeUrl = generateUnsubscribeUrl(review.customer_email);

    resend.emails
      .send({
        from: "Blank Seoul <support@blankseoul.com>",
        to: [review.customer_email],
        subject: `🎉 Your ${discountLabel} coupon is ready! — Blank Seoul`,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        react: CouponConfirmationEmail({
          customerName: review.customer_name.split(" ")[0],
          couponCode,
          discountLabel,
          expiresAt: couponExpiresAt.toISOString(),
          reviewToken: token,
          unsubscribeUrl,
        }) as React.ReactElement,
      })
      .catch((err) => console.error("[Review API] Confirmation email error:", err));

    return NextResponse.json({
      success: true,
      couponCode,
      couponExpiresAt: couponExpiresAt.toISOString(),
      discountLabel,
    });
  } catch (err) {
    console.error("[Review API] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// ---- GET: 승인된 리뷰 조회 / 토큰 상태 확인 ----

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // 토큰이 있으면 → 토큰 상태 조회 (리뷰 페이지 재방문용)
    if (token) {
      const { data: review, error: fetchError } = await supabaseAdmin
        .from("reviews")
        .select("rating, coupon_code, coupon_expires_at")
        .eq("token", token)
        .single();

      if (fetchError || !review) {
        return NextResponse.json({ status: "not_found" }, { status: 404 });
      }

      if (review.rating !== null && review.coupon_code) {
        return NextResponse.json({
          status: "submitted",
          couponCode: review.coupon_code,
          couponExpiresAt: review.coupon_expires_at,
          discountLabel:
            COUPON_CONFIG.discountType === "percentage"
              ? `${COUPON_CONFIG.discountValue}% OFF`
              : `$${COUPON_CONFIG.discountValue} OFF`,
        });
      }

      return NextResponse.json({ status: "pending" });
    }

    // 토큰 없으면 → 공개 리뷰 목록 조회
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select(
        "id, customer_name, rating, title, body, photo_urls, submitted_at"
      )
      .not("rating", "is", null)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[Review API] Fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
    }

    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalCount: reviews.length,
    });
  } catch (err) {
    console.error("[Review API] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
