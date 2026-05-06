# 🗄️ Supabase Data Architecture

본 문서는 K-Food Storefront (Next.js 헤드리스) 아키텍처에서 **Supabase**가 사용자 데이터를 어떤 경로로 수집하고 저장하는지 정리한 가이드입니다.

---

## 1. Supabase의 역할 (UX 전담 DB)

우리 시스템에서 **Shopify**가 결제, 제품, 마케팅 동의 등 핵심 CRM(Customer Relationship Management)을 담당한다면, **Supabase**는 사용자 인증(Auth), 리뷰, 피드백, 취소 사유 등 **고객 경험(UX)과 관련된 부가 데이터**를 전담하여 저장합니다.

---

## 2. 사용자 정보 저장 경로 (3가지 Data Flow)

Supabase에 데이터가 기록되는 경로는 크게 3가지 파이프라인으로 나뉩니다.

### Flow A. 브라우저 직접 통신 (인증)
고객이 로그인이나 회원가입을 할 때, 브라우저는 Next.js 서버를 거치지 않고 Supabase Auth 서버와 직접 통신하여 인증을 처리합니다.
- **경로:** 브라우저 (클라이언트) ➡️ Supabase Auth API
- **관련 파일:** `lib/supabase/client.ts`, `app/components/AuthProvider.tsx`
- **저장 데이터:** 사용자 이메일, 해시된 비밀번호, 보안 세션 토큰 (`auth.users` 시스템 테이블)

### Flow B. Next.js API를 통한 저장 (사용자 행동)
고객이 리뷰를 작성하거나, 주문을 취소하거나, 피드백을 남길 때 브라우저가 직접 DB에 접근하지 못하도록 Next.js 백엔드가 중계자(Proxy) 역할을 합니다.
- **경로:** 브라우저 ➡️ Next.js API 라우트 ➡️ Supabase Database (Server Client)
- **관련 파일:** `app/api/review/route.ts`, `app/api/cancel-order/route.ts`, `app/api/feedback/route.ts`
- **저장 데이터:**
  - `reviews` 테이블: 별점, 리뷰 텍스트, 이미지 URL
  - `cancellations` 테이블: 고객이 선택한 취소 사유
  - `feedback` 테이블: 고객의 개선 요청 사항

### Flow C. 백그라운드 자동화 저장 (Cron Jobs)
고객이 아무 행동을 하지 않아도, 스케줄링된 백그라운드 작업(Cron)이 관리자 권한(`supabaseAdmin`)을 가지고 Shopify의 데이터를 읽어와 Supabase에 강제로 주입합니다.
- **경로:** Shopify Admin API ➡️ Next.js 서버 (Vercel Cron) ➡️ Supabase Database (Admin Client)
- **관련 파일:** `app/api/cron/send-review-request/route.ts`, `app/api/cron/coupon-reminder/route.ts`
- **저장 데이터:** 리뷰 작성을 위한 일회성 고유 토큰(UUID), 만료일, 발송 기록 등 (빈 껍데기 형태의 '초대장' 데이터 생성)

---

## 3. 보안 및 권한 관리

- **클라이언트 (Browser):** 오직 자신의 세션에 해당하는 권한만 가지며, RLS(Row Level Security) 정책에 의해 다른 사람의 리뷰나 주문 정보에 접근할 수 없습니다.
- **서버 (Next.js):**
  - `createServerClient`: 로그인한 유저의 쿠키(세션)를 바탕으로 해당 유저의 권한으로 DB에 접근합니다.
  - `supabaseAdmin` (Service Role Key): RLS를 무시하는 최고 관리자 권한입니다. Cron Job이나 Webhook 등 백그라운드 작업에서만 제한적으로 사용됩니다.
