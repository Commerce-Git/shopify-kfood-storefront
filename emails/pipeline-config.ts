import { IS_MARKETING_EMAIL_ENABLED } from "./senders";

export type DispatchEngine = "RESEND" | "SHOPIFY_NATIVE" | "CRISP";
export type ChannelMedia = "EMAIL" | "EMAIL_AND_SMS" | "CHAT_AND_EMAIL";
export type LegalClassification = "TRANSACTIONAL" | "MARKETING" | "SUPPORT";
export type JourneyStage =
  | "ONBOARDING"
  | "PURCHASE"
  | "FULFILLMENT"
  | "RETENTION"
  | "EXCEPTIONS"
  | "SUPPORT";

export type EmailPipelineId =
  | "customer_welcome_reset"
  | "order_confirmation"
  | "shipping_confirmation"
  | "shipping_update"
  | "order_cancellation"
  | "order_refund"
  | "review_request"
  | "coupon_confirmation"
  | "coupon_reminder"
  | "customer_support_chat";

export interface EmailPipelineMetadata {
  id: EmailPipelineId;
  name: string;
  journeyStage: JourneyStage;
  journeyStageLabel: string;
  engine: DispatchEngine;
  engineLabel: string;
  channelMedia: ChannelMedia;
  channelMediaLabel: string;
  legalClassification: LegalClassification;
  legalLabel: string;
  trigger: string;
  endpointOrTrigger: string;
  status: "ACTIVE" | "PAUSED" | "SHOPIFY_MANAGED";
  statusBadge: {
    label: string;
    color: string;
    bg: string;
    border: string;
  };
  editLocation: {
    type: "CODE" | "SHOPIFY_ADMIN" | "CRISP_ADMIN";
    label: string;
    pathOrUrl: string;
  };
  notes: string;
  canSpamCompliance: {
    unsubscribeHmac: boolean;
    physicalAddress: boolean;
    consentRequired: boolean;
  };
}

export const SHOPIFY_ADMIN_NOTIFICATIONS_URL =
  "https://admin.shopify.com/store/tv7r0x-zn/settings/notifications";
export const CRISP_ADMIN_URL = "https://app.crisp.chat/";

export const EMAIL_PIPELINE_REGISTRY: Record<EmailPipelineId, EmailPipelineMetadata> = {
  // ─── 1. ONBOARDING & ACCOUNT (Shopify Native) ───
  customer_welcome_reset: {
    id: "customer_welcome_reset",
    name: "Customer Account Welcome & Reset",
    journeyStage: "ONBOARDING",
    journeyStageLabel: "1. 가입/계정 인증",
    engine: "SHOPIFY_NATIVE",
    engineLabel: "Shopify Native",
    channelMedia: "EMAIL",
    channelMediaLabel: "EMAIL",
    legalClassification: "TRANSACTIONAL",
    legalLabel: "Transactional (동의 불요)",
    trigger: "Customer Sign-up / Password Reset Request",
    endpointOrTrigger: "Shopify Customer Auth Lifecycle",
    status: "SHOPIFY_MANAGED",
    statusBadge: {
      label: "SHOPIFY MANAGED (Active)",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    editLocation: {
      type: "SHOPIFY_ADMIN",
      label: "Shopify Admin > Notifications > Customer account",
      pathOrUrl: SHOPIFY_ADMIN_NOTIFICATIONS_URL,
    },
    notes: "Managed 100% natively by Shopify. Dispatches account creation welcome & password reset tokens.",
    canSpamCompliance: {
      unsubscribeHmac: false,
      physicalAddress: true,
      consentRequired: false,
    },
  },

  // ─── 2. PURCHASE & ORDER CONFIRMATION (Shopify Native) ───
  order_confirmation: {
    id: "order_confirmation",
    name: "Order Confirmation (Receipt)",
    journeyStage: "PURCHASE",
    journeyStageLabel: "2. 주문 & 결제 완료",
    engine: "SHOPIFY_NATIVE",
    engineLabel: "Shopify Native",
    channelMedia: "EMAIL_AND_SMS",
    channelMediaLabel: "EMAIL + SMS",
    legalClassification: "TRANSACTIONAL",
    legalLabel: "Transactional (동의 불요)",
    trigger: "Checkout Completed ➔ Order Created",
    endpointOrTrigger: "Shopify Checkout Engine",
    status: "SHOPIFY_MANAGED",
    statusBadge: {
      label: "SHOPIFY MANAGED (Active)",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    editLocation: {
      type: "SHOPIFY_ADMIN",
      label: "Shopify Admin > Notifications > Order confirmation",
      pathOrUrl: SHOPIFY_ADMIN_NOTIFICATIONS_URL,
    },
    notes: "Immediate tax invoice and receipt. Dispatches SMS automatically if customer provided phone number.",
    canSpamCompliance: {
      unsubscribeHmac: false,
      physicalAddress: true,
      consentRequired: false,
    },
  },

  // ─── 3. FULFILLMENT & TRACKING (Shopify Native) ───
  shipping_confirmation: {
    id: "shipping_confirmation",
    name: "Shipping Confirmation (Tracking Link)",
    journeyStage: "FULFILLMENT",
    journeyStageLabel: "3. 배송 & 출고 시작",
    engine: "SHOPIFY_NATIVE",
    engineLabel: "Shopify Native",
    channelMedia: "EMAIL_AND_SMS",
    channelMediaLabel: "EMAIL + SMS",
    legalClassification: "TRANSACTIONAL",
    legalLabel: "Transactional (동의 불요)",
    trigger: "Tracking Number Added ➔ Order Fulfilled",
    endpointOrTrigger: "Shopify Fulfillment API",
    status: "SHOPIFY_MANAGED",
    statusBadge: {
      label: "SHOPIFY MANAGED (Active)",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    editLocation: {
      type: "SHOPIFY_ADMIN",
      label: "Shopify Admin > Notifications > Shipping confirmation",
      pathOrUrl: SHOPIFY_ADMIN_NOTIFICATIONS_URL,
    },
    notes: "Carrier tracking link (USPS/CJ/FedEx) auto-generated. Dispatches SMS if phone number exists.",
    canSpamCompliance: {
      unsubscribeHmac: false,
      physicalAddress: true,
      consentRequired: false,
    },
  },

  shipping_update: {
    id: "shipping_update",
    name: "Shipping Status Update",
    journeyStage: "FULFILLMENT",
    journeyStageLabel: "3. 배송 현황 업데이트",
    engine: "SHOPIFY_NATIVE",
    engineLabel: "Shopify Native",
    channelMedia: "EMAIL_AND_SMS",
    channelMediaLabel: "EMAIL + SMS",
    legalClassification: "TRANSACTIONAL",
    legalLabel: "Transactional (동의 불요)",
    trigger: "Carrier Transit Event / Tracking Number Changed",
    endpointOrTrigger: "Shopify Shipping Service",
    status: "SHOPIFY_MANAGED",
    statusBadge: {
      label: "SHOPIFY MANAGED (Active)",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    editLocation: {
      type: "SHOPIFY_ADMIN",
      label: "Shopify Admin > Notifications > Shipping update",
      pathOrUrl: SHOPIFY_ADMIN_NOTIFICATIONS_URL,
    },
    notes: "Sent when carrier tracking number is modified or significant transit status changes occur.",
    canSpamCompliance: {
      unsubscribeHmac: false,
      physicalAddress: true,
      consentRequired: false,
    },
  },

  // ─── 4. RETENTION & MARKETING (Storefront Resend) ───
  review_request: {
    id: "review_request",
    name: "Review Request Email (Seoul Box)",
    journeyStage: "RETENTION",
    journeyStageLabel: "4. 배송 14일 후 사후 리뷰",
    engine: "RESEND",
    engineLabel: "Next.js + Resend",
    channelMedia: "EMAIL",
    channelMediaLabel: "EMAIL",
    legalClassification: "MARKETING",
    legalLabel: "Marketing (수신동의 필수)",
    trigger: "cron-job.org ➔ /api/cron/send-review-request (Daily)",
    endpointOrTrigger: "/api/cron/send-review-request",
    status: IS_MARKETING_EMAIL_ENABLED ? "ACTIVE" : "PAUSED",
    statusBadge: IS_MARKETING_EMAIL_ENABLED
      ? {
          label: "ACTIVE (Resend)",
          color: "#16a34a",
          bg: "#f0fdf4",
          border: "#bbf7d0",
        }
      : {
          label: "PAUSED (Zero-Cost Guard)",
          color: "#d97706",
          bg: "#fffbeb",
          border: "#fde68a",
        },
    editLocation: {
      type: "CODE",
      label: "emails/templates/ReviewRequestEmail.tsx",
      pathOrUrl: "emails/templates/ReviewRequestEmail.tsx",
    },
    notes: "Marketing campaigns paused (2026-07-21~). Route short-circuits in ~15ms with 0 Shopify queries.",
    canSpamCompliance: {
      unsubscribeHmac: true,
      physicalAddress: true,
      consentRequired: true,
    },
  },

  coupon_confirmation: {
    id: "coupon_confirmation",
    name: "Coupon Confirmation Email",
    journeyStage: "RETENTION",
    journeyStageLabel: "4. 리뷰 작성 보상 쿠폰",
    engine: "RESEND",
    engineLabel: "Next.js + Resend",
    channelMedia: "EMAIL",
    channelMediaLabel: "EMAIL",
    legalClassification: "TRANSACTIONAL",
    legalLabel: "Transactional (보상 전달)",
    trigger: "Customer Action ➔ /api/review (Review Submission)",
    endpointOrTrigger: "/api/review",
    status: IS_MARKETING_EMAIL_ENABLED ? "ACTIVE" : "PAUSED",
    statusBadge: IS_MARKETING_EMAIL_ENABLED
      ? {
          label: "ACTIVE (Resend)",
          color: "#16a34a",
          bg: "#f0fdf4",
          border: "#bbf7d0",
        }
      : {
          label: "PAUSED (Stubbed in senders.ts)",
          color: "#d97706",
          bg: "#fffbeb",
          border: "#fde68a",
        },
    editLocation: {
      type: "CODE",
      label: "emails/templates/CouponConfirmationEmail.tsx",
      pathOrUrl: "emails/templates/CouponConfirmationEmail.tsx",
    },
    notes: "Marketing pipeline paused. Coupon code is displayed on-screen immediately upon submission.",
    canSpamCompliance: {
      unsubscribeHmac: true,
      physicalAddress: true,
      consentRequired: false,
    },
  },

  coupon_reminder: {
    id: "coupon_reminder",
    name: "Coupon Expiration Reminder",
    journeyStage: "RETENTION",
    journeyStageLabel: "5. 쿠폰 만료 3/7일전 소멸 방지",
    engine: "RESEND",
    engineLabel: "Next.js + Resend",
    channelMedia: "EMAIL",
    channelMediaLabel: "EMAIL",
    legalClassification: "MARKETING",
    legalLabel: "Marketing (수신동의 필수)",
    trigger: "cron-job.org ➔ /api/cron/coupon-reminder (Daily)",
    endpointOrTrigger: "/api/cron/coupon-reminder",
    status: IS_MARKETING_EMAIL_ENABLED ? "ACTIVE" : "PAUSED",
    statusBadge: IS_MARKETING_EMAIL_ENABLED
      ? {
          label: "ACTIVE (Resend)",
          color: "#16a34a",
          bg: "#f0fdf4",
          border: "#bbf7d0",
        }
      : {
          label: "PAUSED (Zero-Cost Guard)",
          color: "#d97706",
          bg: "#fffbeb",
          border: "#fde68a",
        },
    editLocation: {
      type: "CODE",
      label: "emails/templates/CouponReminderEmail.tsx",
      pathOrUrl: "emails/templates/CouponReminderEmail.tsx",
    },
    notes: "Marketing campaigns paused (2026-07-21~). Route short-circuits in ~15ms with 0 Supabase queries.",
    canSpamCompliance: {
      unsubscribeHmac: true,
      physicalAddress: true,
      consentRequired: true,
    },
  },

  // ─── 5. EXCEPTIONS & CANCELLATIONS (Shopify Native) ───
  order_cancellation: {
    id: "order_cancellation",
    name: "Order Cancellation Confirmation",
    journeyStage: "EXCEPTIONS",
    journeyStageLabel: "6. 주문 취소 확인",
    engine: "SHOPIFY_NATIVE",
    engineLabel: "Shopify Native",
    channelMedia: "EMAIL",
    channelMediaLabel: "EMAIL",
    legalClassification: "TRANSACTIONAL",
    legalLabel: "Transactional (동의 불요)",
    trigger: "Storefront /api/cancel-order or Shopify Admin",
    endpointOrTrigger: "/api/cancel-order (email: true)",
    status: "SHOPIFY_MANAGED",
    statusBadge: {
      label: "SHOPIFY MANAGED (Active)",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    editLocation: {
      type: "SHOPIFY_ADMIN",
      label: "Shopify Admin > Notifications > Order cancelled",
      pathOrUrl: SHOPIFY_ADMIN_NOTIFICATIONS_URL,
    },
    notes: "Handled natively by Shopify API with email: true. Standby template preserved in emails/templates.",
    canSpamCompliance: {
      unsubscribeHmac: true,
      physicalAddress: true,
      consentRequired: false,
    },
  },

  order_refund: {
    id: "order_refund",
    name: "Order Refund Confirmation",
    journeyStage: "EXCEPTIONS",
    journeyStageLabel: "6. 결제 환불 영수증",
    engine: "SHOPIFY_NATIVE",
    engineLabel: "Shopify Native",
    channelMedia: "EMAIL",
    channelMediaLabel: "EMAIL",
    legalClassification: "TRANSACTIONAL",
    legalLabel: "Transactional (동의 불요)",
    trigger: "Refund Executed in /api/cancel-order or Admin",
    endpointOrTrigger: "Shopify Refunds API (notify: true)",
    status: "SHOPIFY_MANAGED",
    statusBadge: {
      label: "SHOPIFY MANAGED (Active)",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    editLocation: {
      type: "SHOPIFY_ADMIN",
      label: "Shopify Admin > Notifications > Order refund",
      pathOrUrl: SHOPIFY_ADMIN_NOTIFICATIONS_URL,
    },
    notes: "Official PG refund confirmation details and estimated bank statement arrival time.",
    canSpamCompliance: {
      unsubscribeHmac: false,
      physicalAddress: true,
      consentRequired: false,
    },
  },

  // ─── 6. LIVE CHAT & CONVERSATIONAL SUPPORT (Crisp SDK) ───
  customer_support_chat: {
    id: "customer_support_chat",
    name: "Live Chat Support & Offline Email Alerts",
    journeyStage: "SUPPORT",
    journeyStageLabel: "7. 실시간 상담 & 부재중 알림",
    engine: "CRISP",
    engineLabel: "Crisp SDK",
    channelMedia: "CHAT_AND_EMAIL",
    channelMediaLabel: "CHAT + EMAIL",
    legalClassification: "SUPPORT",
    legalLabel: "Customer Support (직접 문의)",
    trigger: "Customer Initiates Chat in Storefront Widget",
    endpointOrTrigger: "Crisp Webhook / Web SDK",
    status: "ACTIVE",
    statusBadge: {
      label: "CRISP ACTIVE (Live Widget)",
      color: "#0284c7",
      bg: "#f0f9ff",
      border: "#bae6fd",
    },
    editLocation: {
      type: "CRISP_ADMIN",
      label: "Crisp Admin Console (app.crisp.chat)",
      pathOrUrl: CRISP_ADMIN_URL,
    },
    notes: "Live chat widget on storefront. Automatically forwards agent replies to customer email if offline.",
    canSpamCompliance: {
      unsubscribeHmac: false,
      physicalAddress: true,
      consentRequired: false,
    },
  },
};

export function getEmailPipelineMetadata(id: EmailPipelineId): EmailPipelineMetadata {
  return EMAIL_PIPELINE_REGISTRY[id];
}

export function getAllPipelineMetadata(): EmailPipelineMetadata[] {
  return Object.values(EMAIL_PIPELINE_REGISTRY);
}

export function getPipelinesByEngine(engine: DispatchEngine): EmailPipelineMetadata[] {
  return getAllPipelineMetadata().filter((p) => p.engine === engine);
}

export function getPipelinesByStage(stage: JourneyStage): EmailPipelineMetadata[] {
  return getAllPipelineMetadata().filter((p) => p.journeyStage === stage);
}
