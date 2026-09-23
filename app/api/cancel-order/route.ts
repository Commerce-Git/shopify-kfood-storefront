import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CANCEL_WINDOW_HOURS, isCancelable } from "@/lib/constants";
import { cancelOrder, adminGraphQL } from "@/lib/shopify/admin";
import { COUPON_CONFIG, generateCouponCode } from "@/lib/coupon-config";
import {
  sendCouponConfirmationEmail,
  sendOrderCancellationEmail,
} from "@/emails";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ---- 쿠폰 재발급 헬퍼 ----

/**
 * 취소된 주문에서 사용된 리뷰 쿠폰을 감지하고, 새 쿠폰을 자동 발급합니다.
 * 비동기로 실행되며 (fire-and-forget), 실패해도 취소 결과에 영향을 주지 않습니다.
 */
async function handleCouponReplacement(shopifyOrderGid: string) {
  try {
    // 1. 취소된 주문의 할인 코드 조회
    const { data } = await adminGraphQL(
      `query GetOrderDiscounts($id: ID!) {
        order(id: $id) {
          discountCodes
          customer {
            email
          }
        }
      }`,
      { id: shopifyOrderGid }
    );

    const discountCodes: string[] = data?.order?.discountCodes || [];
    const customerEmail: string | undefined = data?.order?.customer?.email;

    // 2. REVIEW- 접두어 쿠폰이 있는지 확인
    const usedReviewCoupon = discountCodes.find((code: string) =>
      code.startsWith(COUPON_CONFIG.codePrefix + "-")
    );

    if (!usedReviewCoupon) return; // 리뷰 쿠폰이 아닌 경우 무시

    // 3. Supabase에서 해당 쿠폰의 리뷰 레코드 조회
    const { data: review, error } = await supabaseAdmin
      .from("reviews")
      .select("id, token, customer_name, customer_email, coupon_expires_at")
      .eq("coupon_code", usedReviewCoupon)
      .single();

    if (error || !review) {
      console.log("[Coupon Replace] No matching review found for:", usedReviewCoupon);
      return;
    }

    // 4. 새 쿠폰 생성 (기존 만료일 유지)
    const newCouponCode = generateCouponCode();
    const couponExpiresAt = new Date(review.coupon_expires_at);

    // 만료일이 이미 지났으면 30일 연장
    if (couponExpiresAt < new Date()) {
      couponExpiresAt.setDate(new Date().getDate() + COUPON_CONFIG.validityDays);
    }

    const customerGetsValue =
      COUPON_CONFIG.discountType === "percentage"
        ? { percentage: COUPON_CONFIG.discountValue / 100 }
        : { discountAmount: { amount: String(COUPON_CONFIG.discountValue), appliesOnEachItem: false } };

    await adminGraphQL(
      `mutation CreateReplacementDiscount(
        $title: String!
        $code: String!
        $startsAt: DateTime!
        $endsAt: DateTime!
        $usageLimit: Int!
        $customerGetsValue: DiscountCustomerGetsValueInput!
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
        }) {
          codeDiscountNode { id }
          userErrors { field message }
        }
      }`,
      {
        title: `Review Reward (Replacement) - ${newCouponCode}`,
        code: newCouponCode,
        startsAt: new Date().toISOString(),
        endsAt: couponExpiresAt.toISOString(),
        usageLimit: COUPON_CONFIG.usageLimit,
        customerGetsValue,
      }
    );

    // 5. Supabase 업데이트 (새 쿠폰 코드로 교체)
    await supabaseAdmin
      .from("reviews")
      .update({
        coupon_code: newCouponCode,
        coupon_expires_at: couponExpiresAt.toISOString(),
        reminder_sent: false, // 리마인더 리셋
      })
      .eq("id", review.id);

    // 6. 새 쿠폰 이메일 발송 (@/emails 통합 모듈 사용)
    const discountLabel =
      COUPON_CONFIG.discountType === "percentage"
        ? `${COUPON_CONFIG.discountValue}% OFF`
        : `$${COUPON_CONFIG.discountValue} OFF`;

    const emailTo = customerEmail || review.customer_email;

    await sendCouponConfirmationEmail({
      to: emailTo,
      customerName: review.customer_name.split(" ")[0],
      couponCode: newCouponCode,
      discountLabel,
      expiresAt: couponExpiresAt.toISOString(),
      reviewToken: review.token,
    });

    console.log(`[Coupon Replace] ${usedReviewCoupon} → ${newCouponCode} for ${emailTo}`);
  } catch (err) {
    // fire-and-forget: 실패해도 취소 결과에 영향 없음
    console.error("[Coupon Replace] Error:", err);
  }
}

// ---- 주문 취소 API ----

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email || !user.email_confirmed_at) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { shopify_order_id, order_number, reason } = body;

    if (typeof shopify_order_id !== "string" || !/^gid:\/\/shopify\/Order\/\d+$/.test(shopify_order_id)) {
      return NextResponse.json(
        { error: "Missing order information" },
        { status: 400 }
      );
    }

    // Backend validation: Fetch processedAt from Shopify (don't trust client-provided value)
    const { data: orderData } = await adminGraphQL(
      `query GetOrderProcessedAt($id: ID!) {
        order(id: $id) {
          processedAt
          email
          name
          cancelledAt
        }
      }`,
      { id: shopify_order_id }
    );

    const ownedOrder = orderData?.order;
    if (!ownedOrder || typeof ownedOrder.email !== 'string' || ownedOrder.email.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (ownedOrder.cancelledAt) return NextResponse.json({ error: 'Order is already cancelled.' }, { status: 409 });
    const processedAt = ownedOrder.processedAt;
    if (!processedAt || !Number.isFinite(Date.parse(processedAt))) return NextResponse.json({ error: 'Order eligibility could not be verified.' }, { status: 503 });
    if (processedAt) {
      if (!isCancelable(processedAt)) {
        return NextResponse.json(
          { error: `The ${CANCEL_WINDOW_HOURS}-hour free cancellation window has passed.` },
          { status: 403 }
        );
      }
    }

    // Check for duplicate request
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("storefront_cancel_requests")
      .select("id, status")
      .eq("shopify_order_id", shopify_order_id)
      .eq("customer_id", user.id)
      .in("status", ["pending", "approved", "review_required", "refund_completed_cancel_pending"])
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) {
      const msg =
        existing.status === "approved"
          ? "This order has already been cancelled. Your refund is being processed."
          : "Cancellation is already in progress. Please wait.";
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    // 1. Record cancel request in Supabase (pending)
    const { data: cancelRecord, error: dbError } = await supabaseAdmin
      .from("storefront_cancel_requests")
      .insert({
        customer_id: user.id,
        customer_email: user.email!,
        shopify_order_id,
        order_number: ownedOrder.name,
        reason: reason || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError?.code === '23505') return NextResponse.json({ error: 'Cancellation is already in progress.' }, { status: 409 });
    if (dbError) {
      console.error("[cancel-order] DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to submit cancellation request" },
        { status: 500 }
      );
    }

    // 2. Cancel + full refund in Shopify Admin API
    const result = await cancelOrder(shopify_order_id, "customer");

    if (result.status === 'review_required' || result.status === 'refund_completed_cancel_pending') {
      const { error: statusError } = await supabaseAdmin.from('storefront_cancel_requests')
        .update({ status: result.status, reason: result.error }).eq('id', cancelRecord.id);
      if (statusError) console.error('[cancel-order] Pending reconciliation status could not be saved:', statusError);
      return NextResponse.json({ success: false, status: result.status, error: 'Your cancellation needs confirmation. Please contact support; do not submit another refund request.' }, { status: 202 });
    }
    if (result.success) {
      // Update status to approved
      await supabaseAdmin
        .from("storefront_cancel_requests")
        .update({ status: "approved" })
        .eq("id", cancelRecord.id);

      // 3. 쿠폰 재발급 (fire-and-forget — 취소 응답을 지연시키지 않음)
      await handleCouponReplacement(shopify_order_id);

      // 4. 취소 확인 이메일 발송 (fire-and-forget)
      const emailTo = user.email;
      if (emailTo) {
        await sendOrderCancellationEmail({
          to: emailTo,
          customerName: emailTo.split("@")[0],
          orderNumber: order_number,
          refundAmount: result.refundAmount,
          unsubscribeUrl: generateUnsubscribeUrl(emailTo),
        }).catch((err) =>
          console.error("[cancel-order] Error sending cancellation email:", err)
        );
      }

      return NextResponse.json({
        success: true,
        message: `Order ${order_number} has been cancelled. Your refund of $${result.refundAmount || "0"} is being processed.`,
        refundAmount: result.refundAmount,
      });
    } else {
      // Shopify cancel failed
      console.error("[cancel-order] Shopify cancel failed:", result.error);

      // Update with failure reason so admin can review
      await supabaseAdmin
        .from("storefront_cancel_requests")
        .update({
          status: "failed",
          reason: `${reason || ""} [AUTO-CANCEL FAILED: ${result.error}]`.trim(),
        })
        .eq("id", cancelRecord.id);

      return NextResponse.json(
        {
          error: `Cancellation failed: ${result.error}`,
          debug: { shopify_order_id, result },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[cancel-order] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
