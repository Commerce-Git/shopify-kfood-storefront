import type {
  SendReviewRequestPayload,
  SendCouponConfirmationPayload,
  SendCouponReminderPayload,
  SendOrderCancellationPayload,
} from "./types";

/**
 * 💡 마케팅 메일 송신 중단 상태 (2026-07-21~)
 * - 주문 취소 메일: Shopify 자체 시스템에서 단독 발송 처리
 * - 리뷰/쿠폰 마케팅 메일: 추후 재개 시 Git 커밋 5ea10e3 참조하여 복원 가능
 */
export const IS_MARKETING_EMAIL_ENABLED = false;

export async function sendReviewRequestEmail(_payload?: SendReviewRequestPayload) {
  void _payload;
  return null;
}

export async function sendCouponConfirmationEmail(_payload?: SendCouponConfirmationPayload) {
  void _payload;
  return null;
}

export async function sendCouponReminderEmail(_payload?: SendCouponReminderPayload) {
  void _payload;
  return null;
}

export async function sendOrderCancellationEmail(_payload?: SendOrderCancellationPayload) {
  void _payload;
  return null;
}
