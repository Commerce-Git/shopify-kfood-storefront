export interface SendReviewRequestPayload {
  to: string;
  customerName: string;
  reviewToken: string;
  unsubscribeUrl: string;
}

export interface SendCouponConfirmationPayload {
  to: string;
  customerName: string;
  couponCode: string;
  discountLabel: string;
  expiresAt: string;
  reviewToken: string;
}

export interface SendCouponReminderPayload {
  to: string;
  customerName: string;
  couponCode: string;
  discountLabel: string;
  daysRemaining: number;
  expiresAt: string;
  unsubscribeUrl: string;
}

export interface SendOrderCancellationPayload {
  to: string;
  customerName: string;
  orderNumber: string;
  refundAmount?: string;
  unsubscribeUrl: string;
}
