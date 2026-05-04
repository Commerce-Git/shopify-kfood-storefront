# K-Food Headless Storefront

> **이 문서를 읽는 AI 및 에이전트에게**: 이 프로젝트의 구현 계획 및 상세 아키텍처 문서입니다. 본 프로젝트는 단순한 랜딩 페이지가 아닌, 사용자 결제 이탈 방지와 고도화된 Shopify API 제어 로직이 포함된 **프로덕션 레벨의 세일즈 퍼널(Sales Funnel)**입니다. 코드를 수정하거나 기능을 추가할 때 아래 내용을 반드시 꼼꼼하게 숙지해 주세요.

## 1. 프로젝트 개요

한국 K-Food 스낵 큐레이션 박스를 미국 시장에 D2C(Direct-to-Consumer)로 판매하는 **원 프로덕트(One-Product) 랜딩 페이지 및 헤드리스 커머스**입니다.

- **아키텍처**: Headless Commerce (Next.js 프론트엔드 + Shopify 결제 백엔드)
- **핵심 전략**: 상품 1개(큐레이션 박스)만 판매하는 랜딩 페이지형 스토어 (Russell Brunson의 Sales Funnel 프레임워크 적용)
- **브랜드 슬로건**: "Gift a Piece of Korea" (한국을 선물하세요)
- **브랜드 이름**: 미정 (임시로 "K-Food Store" 사용, 추후 변경 예정)
- **법인명**: Blank Palette LLC (DBA: 추후 결정)

## 2. 관련 프로젝트 및 아키텍처

이 프로젝트는 **프론트엔드(고객 화면)** 전용입니다. 백엔드 관리 기능(주문 수집, EMS 예약, FDA PN 신고, 상품 등록)은 별도 프로젝트인 `shopify-git`에서 처리됩니다. 두 프로젝트는 Shopify를 중앙 허브로 연결됩니다.

```text
[이 프로젝트: 고객 화면]              [shopify-git: 관리자 백오피스]
  Storefront API (읽기/체크아웃)       Admin API (읽기/쓰기/자동화)
         ↓                                    ↓
    ┌─────────────────────────────────────────────┐
    │              Shopify (중앙 DB)               │
    │  상품, 주문, 재고, 쿠폰, 결제 데이터 저장        │
    └─────────────────────────────────────────────┘
```

## 3. 기술 스택

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + React 19 |
| 스타일링 | TailwindCSS 4 |
| 결제/커머스 | Shopify Storefront API & Admin GraphQL API (2025-10) |
| 데이터베이스 | Supabase (PostgreSQL - 리뷰, 피드백, 토큰 캐시, 고객, 취소 요청) |
| 이메일 발송 | Resend + React Email |
| 배포 | Vercel (Vercel Cron으로 자동화 스케줄링) |
| 언어 | TypeScript |

## 4. 고도화된 핵심 구현 로직 (AI 에이전트 필독)

기존의 단순 프론트엔드 템플릿과 다릅니다. 아래의 핵심 로직들이 구현되어 있으므로, 관련 파일 수정 시 의도된 동작이 깨지지 않도록 주의하세요.

### 4.1. 장바구니 및 체크아웃 이탈 방지 (Cart Backup System)
- **관련 파일**: `app/components/CartProvider.tsx`, `app/cart/page.tsx`
- **구현 내용**: 
  - 사용자가 결제 버튼을 눌러 Shopify Checkout으로 리다이렉트 될 때, 장바구니 데이터를 `localStorage`(`kfood-checkout-backup`)에 안전하게 백업합니다.
  - 결제를 미완료하고 이탈한 후 다시 돌아왔을 때, "Restore My Cart" 복구 배너를 띄워 원클릭으로 장바구니를 복구할 수 있게 설계되었습니다.
  - 결제 링크 생성 대기 중에 발생하는 UX 저하를 막기 위해 풀스크린 오버레이("Redirecting to Secure Checkout")를 띄웁니다.

### 4.2. 고도화된 Shopify Admin API 통신
- **관련 파일**: `lib/shopify/admin.ts`
- **구현 내용**: 
  - **토큰 스마트 캐싱**: 2025-10 최신 OAuth 규격(Client Credentials)에 맞춰 Supabase 및 메모리 이중 캐싱을 통해 액세스 토큰을 관리하고 불필요한 재발급을 막습니다.
  - **Rate Limit (429) 대응**: API 호출 한계 초과 시 지수 백오프(Exponential Backoff)를 통한 자동 재시도 로직이 내장되어 있습니다.
  - **원클릭 환불/취소**: `cancelOrder` 함수는 Calculate ➡️ Refund Execute ➡️ Order Cancel 로 이어지는 복잡한 Shopify REST API 플로우를 원자적으로 처리합니다.
  - **서버 사이드 취소 윈도우 검증**: 주문 취소 시 클라이언트 값에 의존하지 않고, Shopify Admin API에서 `processedAt`을 직접 조회하여 취소 가능 시간을 서버에서 검증합니다.

### 4.3. 정교한 리뷰 및 쿠폰 자동화 (Review & Coupon System)
- **관련 파일**: `app/api/review/route.ts`, `lib/coupon-config.ts`
- **구현 내용**: 
  - 사용자가 고유 토큰으로 리뷰 폼을 제출하면 서버에서 토큰 유효성, 중복 여부, 만료 여부를 검증합니다.
  - 리뷰 텍스트 필터링(`getReviewStatus`)을 통과한 리뷰에 대해, 즉각적으로 Shopify Admin GraphQL을 호출해 리뷰 보상 할인 쿠폰을 자동 생성합니다.
  - DB 업데이트 후 Resend를 활용해 이메일 발송(`CouponConfirmationEmail`)을 비동기(fire-and-forget)로 처리하여 API 응답 시간을 최소화합니다.
  - 쿠폰 코드는 `crypto.getRandomValues()`를 사용하여 암호학적으로 안전하게 생성됩니다.

## 5. 디자인 시스템 및 세일즈 퍼널

일반적인 브로셔 웹사이트가 아닌 **세일즈 퍼널(Sales Funnel)**로 디자인되었습니다.

### 5.1. 디자인 톤
- **Primary (네온 핑크)**: `#FF1E56` / **Background (쿨 화이트)**: `#FAFAFA`
- **타이포그래피**: Google Fonts `Outfit` (헤딩), `Inter` (본문)
- K-Pop, K-Drama 스타일의 활기찬 무드, 네온사인 스타일, 프리미엄 글래스모피즘 및 다이나믹 애니메이션 적용.

### 5.2. 랜딩 페이지 흐름 (Hook-Story-Offer)
위에서 아래로 자연스럽게 스크롤하며 구매를 유도합니다. (`app/page.tsx` 및 `app/components/*`)

1. **Hero**: 3초 훅 + 긴급성 부여 ("✈️ Order now to catch this week's direct shipment from Seoul")
2. **Story Section**: Epiphany Bridge 형식의 공감대 형성 스토리
3. **Offer Stack**: 단일 상품 판매를 넘은 혜택 강화 패키징 소개
4. **Trust Badges**: FDA Compliant, 100% Authentic, Direct from Seoul 배지
5. **Reviews**: 실제 인스타그램/틱톡 스타일 고객 후기 (초기 목업 ➡️ Supabase 연동)
6. **FAQ**: 구매 전환율을 높이기 위한 배송/관세 불안감 해소
7. **Sticky Buy Bar**: 스크롤에 관계없이 항시 따라다니는 "Buy Now" CTA

## 6. 코드 컨벤션 및 보안 규칙 (AI 에이전트 필독)

### 6.1. GraphQL은 반드시 Variables 사용
Shopify Admin API GraphQL 호출 시, **문자열 보간(Template Literal)으로 값을 직접 쿼리에 삽입하지 마세요.** 반드시 GraphQL Variables를 사용해야 합니다 (GraphQL Injection 방어).

```typescript
// ❌ 금지 — 문자열 보간
await adminGraphQL(`{ order(id: "${orderId}") { ... } }`);

// ✅ 올바름 — Variables 사용
await adminGraphQL(
  `query($id: ID!) { order(id: $id) { ... } }`,
  { id: orderId }
);
```

### 6.2. Supabase Admin Client는 싱글톤 사용
Service Role Key를 사용하는 Supabase 클라이언트는 `lib/supabase/admin.ts`의 싱글톤(`supabaseAdmin`)을 import하세요. API Route에서 직접 `createClient()`를 호출하지 마세요.

```typescript
// ❌ 금지 — 중복 인스턴스 생성
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(url, serviceRoleKey);

// ✅ 올바름 — 싱글톤 사용
import { supabaseAdmin } from "@/lib/supabase/admin";
```

### 6.3. 환경 변수 관리
`NEXT_PUBLIC_`이 붙은 환경 변수 외에는 모두 서버 사이드(`app/api/*`)에서만 사용해야 합니다. 전체 환경 변수 목록은 `OPERATIONS.md`에 정리되어 있습니다.

### 6.4. Storefront API 캐싱
`lib/shopify/storefront.ts`의 `storefrontFetch()`는 `next: { revalidate: 300 }` (5분 ISR)이 적용되어 있습니다. 실시간 데이터가 필요한 경우 `{ cache: 'no-store' }` 옵션을 전달하세요.

## 7. 체크아웃 및 운영 참고사항

### 7.1. 체크아웃 도메인
Headless 구조에서 "Buy Now" 또는 카트에서 결제 클릭 시, 브라우저가 쇼피파이 체크아웃 도메인(`[store].myshopify.com`)으로 리다이렉트됩니다. 

### 7.2. Supabase DB 스키마
`supabase/migrations/` 디렉터리에 이 프로젝트 소유 테이블의 SQL 마이그레이션 파일이 정리되어 있습니다. 동일 Supabase DB에 백오피스(`shopify-git`) 테이블도 공존합니다.

### 7.3. 타겟 고객
K-Pop, K-Drama 등 K-Culture에 관심이 많은 미국 현지인 (10대 후반 ~ 30대). 자기 자신에게 또는 K-Culture를 사랑하는 친구/가족에게 특별한 선물을 주고 싶어하는 소비자를 타겟으로 직접적이고 친근한 카피(Direct Response Copywriting)를 유지하세요.
