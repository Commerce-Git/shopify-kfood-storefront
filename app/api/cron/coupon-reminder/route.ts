import { NextResponse } from "next/server";
import { adminGraphQL, isMarketingSubscribed } from "@/lib/shopify/admin";
import { sendCouponReminderEmail, IS_MARKETING_EMAIL_ENABLED } from "@/emails";
import { COUPON_CONFIG } from "@/lib/coupon-config";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Coupon Expiration Reminder Cron Job (cron-job.org / Vercel Cron)
 *
 * 1. 마케팅 메일 비활성화 상태 시 즉시 안전 조기 종료 (Zero-Cost Short-Circuit)
 * 2. 활성화 상태 시: 만료 7일 전 미사용 쿠폰에 대해 리마인더 이메일 발송
 */

async function isDiscountUsed(code: string): Promise<boolean> {
  const query = `
    query CheckDiscountUsage($code: String!) {
      codeDiscountNodeByCode(code: $code) {
        codeDiscount {
          ... on DiscountCodeBasic {
            usageLimit
            asyncUsageCount
          }
        }
      }
    }
  `;

  try {
    const data = await adminGraphQL(query, { code });
    const discount = data?.data?.codeDiscountNodeByCode?.codeDiscount;
    if (!discount) return false;
    return discount.asyncUsageCount > 0;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  // 1. 보안 인증 (cron-job.org 헤더 및 ?key= 쿼리 파라미터 지원)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret && process.env.NODE_ENV === "production") {
    return new Response("Server configuration error: CRON_SECRET is not configured.", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("key");
  const tokenFromHeader = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null;

  const isAuthorized =
    process.env.NODE_ENV !== "production" ||
    tokenFromHeader === cronSecret ||
    queryKey === cronSecret;

  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. [Zero-Cost Short-Circuit] 마케팅 메일 비활성화 시 DB 및 Shopify 쿼리 전 즉시 안전 탈출
  if (!IS_MARKETING_EMAIL_ENABLED) {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: "Marketing email automation is currently suspended. Zero queries consumed.",
    });
  }

  try {
    // 만료 7일 이내 + 리마인더 미발송 쿠폰 조회
    const reminderDays = COUPON_CONFIG.reminderDaysBeforeExpiry;
    const reminderCutoff = new Date();
    reminderCutoff.setDate(reminderCutoff.getDate() + reminderDays);

    const { data: pendingReminders, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .not("coupon_code", "is", null)
      .eq("reminder_sent", false)
      .lte("coupon_expires_at", reminderCutoff.toISOString())
      .gt("coupon_expires_at", new Date().toISOString());

    if (error) {
      console.error("[Coupon Reminder] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      return NextResponse.json({ message: "No reminders to send today." });
    }

    const results = [];

    const discountLabel =
      COUPON_CONFIG.discountType === "percentage"
        ? `${COUPON_CONFIG.discountValue}% OFF`
        : `$${COUPON_CONFIG.discountValue} OFF`;

    for (const review of pendingReminders) {
      try {
        // Shopify 마케팅 동의 확인 (Single Source of Truth)
        if (!(await isMarketingSubscribed(review.customer_email))) {
          // opt-out이지만 reminder_sent는 true로 표시하여 다음 날 다시 조회되지 않도록
          await supabaseAdmin
            .from("reviews")
            .update({ reminder_sent: true })
            .eq("id", review.id);
          results.push({ order: review.order_name, status: "skipped (not subscribed)" });
          continue;
        }

        // Shopify에서 쿠폰 사용 여부 확인
        const used = await isDiscountUsed(review.coupon_code);

        if (used) {
          await supabaseAdmin
            .from("reviews")
            .update({ reminder_sent: true })
            .eq("id", review.id);
          results.push({ order: review.order_name, status: "skipped (used)" });
          continue;
        }

        // 남은 일수 계산
        const daysLeft = Math.ceil(
          (new Date(review.coupon_expires_at).getTime() - Date.now()) / 86400000
        );

        // Unsubscribe URL 생성
        const unsubscribeUrl = generateUnsubscribeUrl(review.customer_email);

        // 리마인더 이메일 발송 (@/emails 단일 모듈 활용)
        await sendCouponReminderEmail({
          to: review.customer_email,
          customerName: review.customer_name.split(" ")[0],
          couponCode: review.coupon_code,
          discountLabel,
          daysRemaining: daysLeft,
          expiresAt: review.coupon_expires_at,
          unsubscribeUrl,
        });

        await supabaseAdmin
          .from("reviews")
          .update({ reminder_sent: true })
          .eq("id", review.id);

        results.push({ order: review.order_name, status: "sent" });
      } catch (err) {
        console.error(`[Coupon Reminder] Failed for ${review.order_name}:`, err);
        results.push({ order: review.order_name, status: "failed" });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results,
    });
  } catch (error) {
    console.error("[Coupon Reminder] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
