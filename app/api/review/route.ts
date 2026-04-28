/**
 * Review API
 *
 * POST /api/review — 리뷰 제출 + Shopify 쿠폰 자동 생성
 * GET  /api/review — 승인된 공개 리뷰 조회 (상품 페이지용)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { COUPON_CONFIG, generateCouponCode } from "@/lib/coupon-config";
import { getReviewStatus } from "@/lib/review-filter";
import {
  VALID_SNACK_IDS,
  VALID_CATEGORY_IDS,
} from "@/lib/feedback-options";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

// ---- Shopify 헬퍼 ----

async function getShopifyAccessToken(): Promise<string> {
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    }
  );
  if (!res.ok) throw new Error(`Shopify token failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function createShopifyDiscount(
  shopifyToken: string,
  couponCode: string,
  expiresAt: Date
) {
  const startsAt = new Date().toISOString();
  const endsAt = expiresAt.toISOString();

  const discountValue =
    COUPON_CONFIG.discountType === "percentage"
      ? `{ percentage: ${COUPON_CONFIG.discountValue / 100} }`
      : `{ amount: { amount: "${COUPON_CONFIG.discountValue}", currencyCode: USD } }`;

  const minimumRequirement =
    COUPON_CONFIG.minimumOrderAmount != null
      ? `minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: "${COUPON_CONFIG.minimumOrderAmount}" } }`
      : "";

  const mutation = `
    mutation {
      discountCodeBasicCreate(basicCodeDiscount: {
        title: "Review Reward - ${couponCode}"
        code: "${couponCode}"
        startsAt: "${startsAt}"
        endsAt: "${endsAt}"
        usageLimit: ${COUPON_CONFIG.usageLimit}
        customerGets: {
          value: ${discountValue}
          items: { all: true }
        }
        customerSelection: { all: true }
        ${minimumRequirement}
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

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyToken,
      },
      body: JSON.stringify({ query: mutation }),
    }
  );

  if (!res.ok) throw new Error(`Shopify discount creation failed: ${res.status}`);
  const result = await res.json();
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
    const { data: review, error: fetchError } = await supabase
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

    // 비공개 피드백 데이터 (선택)
    const favoriteSnacks = Array.isArray(body.favoriteSnacks)
      ? body.favoriteSnacks.filter((s: string) => VALID_SNACK_IDS.includes(s))
      : [];
    const leastFavoriteSnacks = Array.isArray(body.leastFavoriteSnacks)
      ? body.leastFavoriteSnacks.filter((s: string) => VALID_SNACK_IDS.includes(s))
      : [];
    const wantNext = Array.isArray(body.wantNext)
      ? body.wantNext.filter((s: string) => VALID_CATEGORY_IDS.includes(s))
      : [];
    const privateComment = typeof body.privateComment === "string"
      ? body.privateComment.trim().slice(0, 1000)
      : null;

    // 3. 금지어 필터
    const status = getReviewStatus(title, reviewBody);

    // 4. Shopify 쿠폰 생성
    const couponCode = generateCouponCode();
    const couponExpiresAt = new Date();
    couponExpiresAt.setDate(couponExpiresAt.getDate() + COUPON_CONFIG.validityDays);

    const shopifyToken = await getShopifyAccessToken();
    await createShopifyDiscount(shopifyToken, couponCode, couponExpiresAt);

    // 5. Supabase 업데이트
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        rating,
        title,
        body: reviewBody,
        photo_urls: photoUrls,
        favorite_snacks: favoriteSnacks,
        least_favorite_snacks: leastFavoriteSnacks,
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

    return NextResponse.json({
      success: true,
      couponCode,
      couponExpiresAt: couponExpiresAt.toISOString(),
      discountLabel:
        COUPON_CONFIG.discountType === "percentage"
          ? `${COUPON_CONFIG.discountValue}% OFF`
          : `$${COUPON_CONFIG.discountValue} OFF`,
    });
  } catch (err) {
    console.error("[Review API] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// ---- GET: 승인된 리뷰 조회 ----

export async function GET() {
  try {
    const { data: reviews, error } = await supabase
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

    // 평균 별점 계산
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
