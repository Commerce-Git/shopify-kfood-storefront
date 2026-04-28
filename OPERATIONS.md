# 📋 Seoul Snack Box — 운영 가이드

> 이 문서는 스토어프론트의 모든 자동화, 스케줄, 설정을 한눈에 볼 수 있는 운영 가이드입니다.
> 기능을 추가하거나 변경할 때 이 문서도 함께 업데이트해 주세요.

---

## ⏰ 크론잡 스케줄 (vercel.json)

| # | 크론잡 | 스케줄 | 설명 |
|:-:|--------|--------|------|
| 1 | `/api/cron/send-review-request` | 매일 01:00 UTC (10:00 KST) | 배송 완료 3주 후 리뷰 요청 이메일 발송 |
| 2 | `/api/cron/coupon-reminder` | 매일 02:00 UTC (11:00 KST) | 쿠폰 만료 7일 전 리마인더 이메일 발송 (미사용만) |

---

## 📧 이메일 자동화

| 이메일 | 트리거 | 템플릿 파일 |
|--------|--------|------------|
| 리뷰 요청 | 배송 완료 21일 후 (크론잡 #1) | `emails/ReviewRequestEmail.tsx` |
| 쿠폰 발급 확인 | 리뷰 작성 직후 (즉시) | `emails/CouponConfirmationEmail.tsx` |
| 쿠폰 만료 리마인더 | 쿠폰 만료 7일 전 (크론잡 #2) | `emails/CouponReminderEmail.tsx` |

> **발신자**: `Seoul Snack Box <onboarding@resend.dev>` (도메인 인증 후 변경 예정)

---

## 🎫 쿠폰 설정

**설정 파일**: `lib/coupon-config.ts`

| 설정 | 현재 값 | 설명 |
|------|---------|------|
| `discountType` | `percentage` | 할인 유형 (percentage / fixed_amount) |
| `discountValue` | `15` | 15% OFF |
| `validityDays` | `30` | 쿠폰 유효기간 (리뷰 작성일 기준) |
| `tokenExpiryDays` | `60` | 리뷰 토큰 유효기간 (이메일 발송일 기준) |
| `reminderDaysBeforeExpiry` | `7` | 만료 리마인더 발송 시점 |
| `usageLimit` | `2` | 쿠폰 사용 횟수 (취소 후 재사용 1회 허용) |
| `minimumOrderAmount` | `null` | 최소 주문 금액 (null = 없음) |

### 할인율 변경 방법
1. `lib/coupon-config.ts` 열기
2. `discountValue: 15` → 원하는 숫자로 수정
3. git push → 자동 배포

---

## ⭐ 리뷰 시스템

### 리뷰 플로우
```
이메일 → /review?token=xxx → 6단계 위저드 → Shopify 쿠폰 자동 생성 → 쿠폰 노출
```

### 리뷰 승인 방식
- **기본**: 자동 승인 (`approved`)
- **금지어 탐지 시**: 수동 확인 필요 (`pending`)
- **금지어 목록**: `lib/review-filter.ts`

### 리뷰 승인/거절 방법 (수동)
1. Supabase 대시보드 → `reviews` 테이블
2. `status` 컬럼에서 `pending` → `approved` 또는 `rejected` 변경

### 상품 페이지 리뷰 위젯
- 실제 리뷰 3개 이상: Supabase에서 실시간 조회
- 3개 미만: MOCK 데이터 폴백 (Verified 배지 없음)
- 파일: `app/components/Reviews.tsx`

---

## 🗂️ 주요 파일 맵

### API 라우트
| 경로 | 메서드 | 설명 |
|------|:------:|------|
| `/api/review` | POST | 리뷰 제출 + 쿠폰 생성 |
| `/api/review` | GET | 승인된 리뷰 조회 |
| `/api/orders` | GET | 주문 조회 |
| `/api/cancel-order` | POST | 주문 취소 + 환불 |
| `/api/track-order` | GET | 배송 추적 |
| `/api/cron/send-review-request` | GET | 리뷰 요청 크론잡 |
| `/api/cron/coupon-reminder` | GET | 쿠폰 리마인더 크론잡 |

### 페이지
| 경로 | 설명 |
|------|------|
| `/` | 메인 (Hero + Story + Offer + Trust + Reviews + FAQ) |
| `/product/[handle]` | 상품 상세 (+ SEO JSON-LD) |
| `/review` | 리뷰 작성 (6단계 위저드) |
| `/cart` | 장바구니 |
| `/account` | 계정 관리 |
| `/order-lookup` | 주문 조회 |
| `/faq` | FAQ |
| `/about` | 소개 |
| `/policies/*` | 약관, 개인정보, 배송, 반품 |

### 설정 파일
| 파일 | 설명 |
|------|------|
| `lib/coupon-config.ts` | 쿠폰 할인율, 유효기간 등 |
| `lib/snack-options.ts` | 스낵/카테고리 옵션 목록 |
| `lib/review-filter.ts` | 리뷰 금지어 필터 |
| `lib/constants.ts` | 주문 취소 윈도우 (12시간) |
| `vercel.json` | 크론잡 스케줄 |
| `.env.local` | 환경 변수 (API 키, 시크릿) |

---

## 🔑 환경 변수 목록

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Shopify 스토어 도메인 |
| `SHOPIFY_CLIENT_ID` | Shopify Admin API 인증 |
| `SHOPIFY_CLIENT_SECRET` | Shopify Admin API 인증 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서버측 인증 |
| `RESEND_API_KEY` | Resend 이메일 발송 |
| `NEXT_PUBLIC_SITE_URL` | 이메일 내 링크 기본 URL |
| `CRON_SECRET` | Vercel 크론잡 보안 토큰 |
| `NEXT_PUBLIC_CANCEL_WINDOW_HOURS` | 주문 취소 가능 시간 (기본 12) |

---

## 📊 Supabase 테이블

| 테이블 | 용도 |
|--------|------|
| `reviews` | 리뷰 + 피드백 + 쿠폰 통합 |
| `feedback` | (레거시) 기존 피드백 데이터 보존용 |
| `shopify_token_cache` | Shopify Admin API 토큰 캐시 |
