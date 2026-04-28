/**
 * 쿠폰 설정 — 할인율, 유효기간 등을 이 파일에서 한 번에 관리합니다.
 * 수정 후 git push 하면 즉시 반영됩니다.
 */

export const COUPON_CONFIG = {
  /** 할인 유형: 'percentage' (퍼센트 할인) 또는 'fixed_amount' (고정 금액 할인) */
  discountType: 'percentage' as const,

  /** 할인 값: discountType이 'percentage'이면 15 = 15% OFF, 'fixed_amount'이면 5 = $5 OFF */
  discountValue: 15,

  /** 쿠폰 유효기간: 리뷰 작성일로부터 며칠간 유효한지 */
  validityDays: 30,

  /** 리뷰 토큰 유효기간: 이메일 발송일로부터 며칠간 리뷰를 작성할 수 있는지 */
  tokenExpiryDays: 60,

  /** 만료 리마인더: 쿠폰 만료 며칠 전에 알림 이메일을 보낼지 */
  reminderDaysBeforeExpiry: 7,

  /** 쿠폰 총 사용 횟수: 2 = 주문 취소 후 재사용 1회 허용 */
  usageLimit: 2,

  /** 최소 주문 금액: null = 제한 없음, 숫자 = 해당 금액 이상 구매 시 적용 */
  minimumOrderAmount: null as number | null,

  /** 쿠폰 코드 접두어: 'REVIEW' → REVIEW-K7M2P9 형태로 생성됨 */
  codePrefix: 'REVIEW',
};

/** 랜덤 쿠폰 코드 생성 (예: REVIEW-K7M2P9) */
export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동 문자 제외 (0/O, 1/I/L)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${COUPON_CONFIG.codePrefix}-${code}`;
}
