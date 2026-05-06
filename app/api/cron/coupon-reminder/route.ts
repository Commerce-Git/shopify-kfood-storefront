import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminGraphQL, isMarketingSubscribed } from "@/lib/shopify/admin";
import { CouponReminderEmail } from "@/emails/CouponReminderEmail";
import { COUPON_CONFIG } from "@/lib/coupon-config";
import { generateUnsubscribeUrl } from "@/lib/unsubscribe";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Vercel Cron Job #2 — 매일 02:00 UTC 실행
 *
 * 쿠폰 만료 7일 전에 미사용 쿠폰에 대해 리마인더 이메일을 발송합니다.
 * - Shopify API로 쿠폰 사용 여부를 확인
 * - 이미 사용된 쿠폰은 리마인더를 보내지 않음
 */

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
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

        // 리마인더 이메일 발송
        await resend.emails.send({
          from: "Blank Seoul <support@blankseoul.com>",
          to: [review.customer_email],
          subject: `⏰ Your ${discountLabel} coupon expires in ${daysLeft} days!`,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          react: CouponReminderEmail({
            customerName: review.customer_name.split(" ")[0],
            couponCode: review.coupon_code,
            discountLabel,
            expiresAt: review.coupon_expires_at,
            daysLeft,
            unsubscribeUrl,
          }) as React.ReactElement,
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
