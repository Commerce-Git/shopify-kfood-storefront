# 📧 Email Marketing Pipeline Architecture

본 문서는 K-Food Storefront의 이메일 마케팅 파이프라인 및 아키텍처에 대한 상세 가이드입니다. 

---

## 1. 핵심 철학 (Single Source of Truth)

**오직 Shopify만이 고객 마케팅 동의 상태의 유일한 기준(Single Source of Truth, SSOT)이 됩니다.**
과거에 사용하던 Supabase의 `email_opt_out` 테이블은 데이터 파편화 및 스팸법 위반(CAN-SPAM) 리스크를 방지하기 위해 완전히 폐기되었습니다. 모든 마케팅 이메일 발송 전, 시스템은 실시간으로 Shopify Admin API를 조회하여 고객의 수신 동의 여부를 확인합니다.

---

## 2. 이메일 발송 전체 파이프라인 (Step-by-Step)

스토어프런트의 모든 자동화 이메일은 **Vercel Cron ➡️ Next.js API ➡️ Shopify/Supabase 검증 ➡️ React-email 렌더링 ➡️ Resend API 발송** 이라는 일원화된 파이프라인을 거칩니다.

### 🔄 전체 작동 원리 (리뷰 요청 메일 기준)

1. **트리거 (Vercel Cron):** `vercel.json`에 정의된 스케줄에 따라 매일 지정된 시간에 Next.js API 라우트(`/api/cron/send-review-request`)가 자동으로 호출됩니다.
2. **데이터 페칭 및 필터링 (Shopify & Supabase):**
   - **Shopify API:** 상태가 `FULFILLED`(배송 완료)이고 특정 기간(예: 14일)이 경과한 주문 목록을 불러옵니다.
   - **Supabase 검증:** 해당 주문 번호로 이미 리뷰가 작성되었는지(`reviews` 테이블), 또는 이미 요청 메일을 보냈는지 확인하여 중복 발송을 차단합니다.
3. **마케팅 수신 동의 확인 (SSOT):**
   - 필터링을 통과한 타겟 명단을 대상으로 `isMarketingSubscribed(email)` 함수를 실행하여 **Shopify 본진의 수신 동의 여부**를 확인합니다. 거부자(UNSUBSCRIBED)는 여기서 최종 탈락합니다.
4. **이메일 렌더링 (React-email):**
   - `emails/ReviewRequestEmail.tsx` 등의 React 기반 템플릿 컴포넌트에 고객 이름, 고유 토큰 등의 동적 데이터를 주입합니다.
   - `react-email` 라이브러리가 이 React 코드를 모든 이메일 클라이언트(Gmail, Outlook 등)에서 깨지지 않고 호환되는 순수 정적 HTML/CSS로 변환(Render)합니다.
5. **메일 전송 (Resend API):**
   - 최종 렌더링된 HTML 문자열과 제목(Subject)을 담아 **Resend API**로 전송 요청을 보냅니다.
   - Resend가 1초 내로 메일을 발송하며, 스팸 분류를 막기 위해 사전에 세팅된 도메인 인증(DKIM/SPF)을 거쳐 고객의 메일함에 안전하게 도착합니다.

---

### 📩 개별 자동화 메일 종류

#### A. 리뷰 요청 메일 (`/api/cron/send-review-request`)
- **목적:** 배송 완료 고객에게 리뷰 작성을 유도하고 보상(할인 쿠폰)을 안내
- **마케팅 동의 필수 여부:** ⭕️ (동의자에게만 발송)

#### B. 쿠폰 만료 리마인더 (`/api/cron/coupon-reminder`)
- **목적:** 리뷰 작성 보상으로 받은 쿠폰의 만료일(예: 3일, 7일 전)이 다가옴을 알림
- **마케팅 동의 필수 여부:** ⭕️ (동의자에게만 발송)

#### C. 쿠폰 발급 확정 메일 (`/api/review`)
- **목적:** 고객이 리뷰를 작성하고 제출(Submit)하는 즉시, 보상 쿠폰 코드를 전달
- **마케팅 동의 필수 여부:** ❌ (거래 후속 조치이므로 동의 여부 무관하게 즉시 발송)

---

## 3. 구독 취소 아키텍처 (Unsubscribe Flow)

모든 이메일 하단에는 구독 취소(Unsubscribe) 링크가 포함되어 있으며, 보안과 정확성을 위해 아래 파이프라인을 따릅니다.

1. **HMAC 서명된 URL 생성:**
   이메일 발송 시 `lib/unsubscribe.ts`의 `generateUnsubscribeUrl` 함수가 고객의 이메일을 기반으로 고유한 해시(Token)를 만들어 URL에 첨부합니다. (본인 외 구독 취소 조작 방지)
2. **사용자 클릭 & API 호출:**
   고객이 링크를 클릭하면 `/unsubscribe` 페이지로 이동하며, 승인 시 `/api/unsubscribe` 라우트가 호출됩니다.
3. **Shopify Admin API 직접 업데이트:**
   API 라우트는 `updateMarketingConsent(email, "UNSUBSCRIBED")` 함수를 실행하여, **Shopify 본진의 고객 데이터베이스(CRM)에 마케팅 동의 상태를 즉시 `UNSUBSCRIBED`로 변경**합니다.

---

## 4. 관련 핵심 파일 위치

| 기능 | 파일 경로 | 설명 |
|---|---|---|
| **API 헬퍼** | `lib/shopify/admin.ts` | Shopify GraphQL을 통해 동의 상태 조회 및 업데이트 (`isMarketingSubscribed`, `updateMarketingConsent`) |
| **보안 유틸** | `lib/unsubscribe.ts` | 구독 취소 링크 생성을 위한 HMAC 토큰 암호화/검증 |
| **이메일 템플릿** | `emails/*.tsx` | React-email을 활용한 실제 이메일 UI/UX 컴포넌트 |
| **구독 취소 API** | `api/unsubscribe/route.ts` | 클라이언트의 구독 취소 요청을 받아 Shopify API를 호출하는 엔드포인트 |

---

## 5. 법적 준수 사항 (Legal Compliance)

이메일 템플릿과 파이프라인은 미국 **CAN-SPAM Act**를 100% 준수하도록 설계되었습니다.
- **Opt-in:** 결제창에서 동의한 고객(`SUBSCRIBED`)에게만 마케팅 이메일 발송
- **Opt-out:** 모든 템플릿 하단에 1-Click Unsubscribe 링크 포함 및 10일 내 즉시 반영 (실제로는 Shopify를 통해 즉시 처리됨)
- **Physical Address:** 모든 템플릿 하단에 Blank Palette LLC의 물리적 사업장 주소 (Wyoming) 필수 표기

---

## 6. Supabase 데이터 연동 아키텍처 (이메일 관점)

이메일 파이프라인에서 Supabase는 주로 고객 행동(UX) 데이터를 검증하고 저장하는 용도로 쓰입니다.

### 📝 이메일 발송 시 데이터 저장 경로
크론잡(Cron)이 리뷰 요청 이메일을 발송할 때, 메일만 보내는 것이 아니라 **Supabase `reviews` 테이블에 '초대장(빈 껍데기)' 행을 미리 생성**합니다.
- **경로:** Shopify Admin API ➡️ Next.js 서버(Cron) ➡️ Supabase Database (`supabaseAdmin` 권한)
- **저장 데이터:** 리뷰 토큰(UUID), 만료일, 주문 번호, 고객 이메일 등 (리뷰 내용은 비어있음)

### 🛡️ 중복 발송 차단 검증 원리
Supabase는 고객이 해당 링크를 통해 이미 리뷰를 남겼는지, 혹은 이미 쿠폰을 사용했는지 확인하여 불필요한 메일(스팸)이 두 번 발송되지 않도록 UX 방어막 역할을 합니다.

> 💡 **더 자세한 Supabase 아키텍처 가이드:**
> 사용자 인증부터 리뷰 작성까지 전체 Supabase 데이터 흐름은 [`lib/supabase/README.md`](../lib/supabase/README.md) 파일에 분리하여 상세히 기록해 두었습니다.
