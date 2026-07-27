import React from "react";
import { getResendClient } from "./client";
import { ReviewRequestEmail } from "./templates/ReviewRequestEmail";
import { CouponConfirmationEmail } from "./templates/CouponConfirmationEmail";
import { CouponReminderEmail } from "./templates/CouponReminderEmail";
import { OrderCancellationEmail } from "./templates/OrderCancellationEmail";
import type {
  SendReviewRequestPayload,
  SendCouponConfirmationPayload,
  SendCouponReminderPayload,
  SendOrderCancellationPayload,
} from "./types";

const FROM_EMAIL = "Blank Seoul <support@blankseoul.com>";

export async function sendReviewRequestEmail(payload: SendReviewRequestPayload) {
  // 💡 [TEMPORARILY DISABLED] 리뷰 요청 이메일 발송 비활성화
  return null;

  /*
  const client = getResendClient();
  if (!client) return null;

  return await client.emails.send({
    from: FROM_EMAIL,
    to: [payload.to],
    subject: `Your Blank Seoul Box arrived! Share your experience — Blank Seoul`,
    headers: {
      "List-Unsubscribe": `<${payload.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    react: React.createElement(ReviewRequestEmail, {
      customerName: payload.customerName,
      reviewToken: payload.reviewToken,
      unsubscribeUrl: payload.unsubscribeUrl,
    }),
  });
  */
}

export async function sendCouponConfirmationEmail(
  payload: SendCouponConfirmationPayload
) {
  // 💡 [TEMPORARILY DISABLED] 쿠폰 발급/복구 이메일 발송 비활성화
  return null;

  /*
  const client = getResendClient();
  if (!client) return null;

  return await client.emails.send({
    from: FROM_EMAIL,
    to: [payload.to],
    subject: `Your ${payload.discountLabel} coupon has been restored! — Blank Seoul`,
    headers: {
      "List-Unsubscribe": `<${payload.unsubscribeUrl || "https://blankseoul.com"}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    react: React.createElement(CouponConfirmationEmail, {
      customerName: payload.customerName,
      couponCode: payload.couponCode,
      discountLabel: payload.discountLabel,
      expiresAt: payload.expiresAt,
      reviewToken: payload.reviewToken,
    }),
  });
  */
}

export async function sendCouponReminderEmail(
  payload: SendCouponReminderPayload
) {
  // 💡 [TEMPORARILY DISABLED] 쿠폰 리마인더 이메일 발송 비활성화
  return null;

  /*
  const client = getResendClient();
  if (!client) return null;

  return await client.emails.send({
    from: FROM_EMAIL,
    to: [payload.to],
    subject: `⏰ Don't miss out! Your ${payload.discountLabel} coupon expires in ${payload.daysRemaining} days — Blank Seoul`,
    headers: {
      "List-Unsubscribe": `<${payload.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    react: React.createElement(CouponReminderEmail, {
      customerName: payload.customerName,
      couponCode: payload.couponCode,
      discountLabel: payload.discountLabel,
      daysRemaining: payload.daysRemaining,
      expiresAt: payload.expiresAt,
      unsubscribeUrl: payload.unsubscribeUrl,
    }),
  });
  */
}

export async function sendOrderCancellationEmail(
  _payload: SendOrderCancellationPayload
) {
  // 💡 [DISABLED] Resend 주문 취소 이메일 발송 비활성화 (쇼피파이 자체 메일로 단독 발송)
  return null;

  /*
  const client = getResendClient();
  if (!client) return null;

  return await client.emails.send({
    from: FROM_EMAIL,
    to: [payload.to],
    subject: `Order Cancellation Confirmed (#${payload.orderNumber}) — Blank Seoul`,
    headers: {
      "List-Unsubscribe": `<${payload.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    react: React.createElement(OrderCancellationEmail, {
      customerName: payload.customerName,
      orderNumber: payload.orderNumber,
      refundAmount: payload.refundAmount,
      unsubscribeUrl: payload.unsubscribeUrl,
    }),
  });
  */
}
