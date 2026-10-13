# ⚡ Next.js Storefront 캐시 아키텍처 가이드 (Cache Architecture Guide)

본 문서는 `blank-seoul-storefront` 헤드리스 쇼핑몰 프로젝트에서 데이터 정밀도와 페이지 로딩 속도를 양립하기 위해 설계된 하이브리드 캐싱 모델에 대해 설명합니다.

---

## 🏗️ 전체 캐시 아키텍처 개요

쇼핑몰의 캐싱 모델은 크게 4가지 레이어로 유기적으로 결합되어 작동합니다.

```
                  ┌────────────────────────┐
                  │   Client (Browser)     │
                  └───────────┬────────────┘
                              │
             ┌────────────────┴────────────────┐
             ▼ (실시간 재고/구매 가능 검사)       ▼ (페이지 및 기본 상품 정보 조회)
     ┌───────────────┐                 ┌───────────────┐
     │  /api/stock   │                 │   Next.js     │
     │ (ForceDynamic)│                 │   Static Cache│
     └───────┬───────┘                 └───────┬───────┘
             │ (Bypass Cache)                  │ (60초 ISR 또는 On-Demand Revalidate)
             ▼                                 ▼
   ┌─────────────────────────────────────────────────────┐
   │                  Shopify API 본진                    │
   └─────────────────────────────────────────────────────┘
```

---

## 1. API 레벨 통합 캐싱 (1분 단위 ISR)
쇼핑몰이 Shopify Storefront API에 보내는 모든 GraphQL 요청은 `lib/shopify/storefront.ts`의 `storefrontFetch()` 공통 함수를 통과합니다.

* **설정 방식**: `fetch` 요청 시 Next.js 전용 옵션인 `next: { revalidate: 60 }`이 적용되어 있습니다.
  ```typescript
  const response = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: { ... },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60, tags: ["shopify-catalog"] },
  });
  ```
* **동작 원리**: 
  - 최초 요청 후 **60초(1분) 동안 GraphQL 응답 결과 데이터가 서버 메모리에 캐싱**됩니다.
  - 1분 안에 발생하는 동일한 GraphQL 요청은 Shopify 서버를 거치지 않고 캐시에서 즉각 응답하여 리소스를 아끼고 속도를 향상시킵니다.

---

## 2. 페이지 레벨 캐싱 (정적 페이지 빌드)
메인 홈(`/`), 상품 상세 페이지(`/product/[handle]`), 컬렉션 페이지(`/collections/[handle]`) 등 주요 브라우징 페이지는 Next.js 빌드 시 정적 페이지(Static Page)로 컴파일됩니다.

* **동작 원리**: 
  - 1분 단위의 **ISR (Incremental Static Regeneration)** 상태로 동작합니다.
  - 고객이 페이지에 진입하면 캐싱된 HTML을 즉각 응답(로딩 0.05초)합니다.
  - 1분이 지난 시점 이후 최초로 방문하는 고객이 있을 때, 서버 백그라운드에서 백엔드 데이터를 다시 긁어와 정적 HTML 파일을 조용히 최신화합니다. (그다음 고객부터 최신 페이지 노출)

---

## 3. 실시간 재고 조회 (캐시 우회 클라이언트 패칭)
장바구니 담기, 결제, 상품 구매 가능 여부 판별 등 **1초의 지연도 용납되지 않는 재고 정밀도**가 필요한 데이터는 Next.js 캐싱 레이어를 거치지 않고 바이패스(Bypass)합니다.

* **경로**: `/app/api/stock/route.ts` API 엔드포인트
* **설정 방식**:
  - `export const dynamic = "force-dynamic";`로 선언하여 서버 사이드 정적 빌드 대상에서 제외합니다.
  - Shopify Storefront API 호출 시 `cache: "no-store"` 옵션을 명시하여 Next.js의 모든 캐시를 우회합니다.
* **동작 원리**: 
  - 브라우저 클라이언트 컴포넌트(`BuyButton`, `QuantitySelector` 등)에서 페이지 로드 직후 또는 주기적으로 해당 API를 직접 비동기 호출합니다.
  - 항상 Shopify DB에서 즉시 긁어온 가장 신선한 실시간 재고 잔여 수량을 기준으로 구매 버튼을 제어하므로, 정적 캐싱으로 인한 초과 판매(Overselling)를 원천 차단합니다.

---

## 4. 온디맨드 즉각 캐시 무효화 (On-Demand Revalidation)
Admin의 상품 동기화 후 홈페이지가 다음 접근에서 최신 데이터를 가져오도록 캐시를 만료합니다. 고정된 0.1초 반영이나 외부 API의 즉시 일관성을 보장하는 계약은 아닙니다.

* **경로**: `/app/api/revalidate/route.ts` API 엔드포인트
* **인증**: 같은 환경의 `REVALIDATE_SECRET`을 검사합니다. 보호된 Preview의 서버 접근에는 [환경 연결 계약](../environment-isolation.md#연결값)의 `STOREFRONT_API_PROTECTION_BYPASS` 헤더도 필요합니다.
* **동작 원리**:
  1. WMS 데이터 동기화 완료 시 `POST /api/revalidate`로 요청이 전달됩니다.
  2. 가격 변경 요청에는 Admin이 조회한 Shopify 실제 handle과 `expectedPrice: { variantId, amountUsd }`를 전달합니다. Storefront는 `cache: 'no-store'`로 자신의 Shopify 가격을 조회합니다. 값이 아직 다르면 캐시를 만료하지 않고 `409 / SHOPIFY_PRICE_PENDING`을 반환합니다. Admin은 이 응답만 1초 간격으로 최대40회·전체45초 안에서 확인하고, 다른 실패·미지원 응답은 성공으로 기록하지 않습니다. 이 한도를 넘는 지연은 로그에 남으며 영구 재시도 큐는 이번 범위가 아닙니다. 이전 버전의 Storefront가 가격 확인 없이200을 반환해도 `priceConfirmed: true`가 없으면 성공으로 기록하지 않습니다.
  3. 새 가격을 확인한 뒤 `revalidateTag('shopify-catalog', { expire: 0 })`로 공통 Shopify 조회 캐시를 만료합니다. 페이지 재생성 때 이전 상품 응답을 다시 사용하지 않도록 합니다. 가격 검사가 없는 상품·이미지·작가 갱신도 이 태그를 만료합니다.
  4. 수신된 `handle` 및 `collections`에 **`revalidatePath()`**를 적용합니다. 구체 주소에는 `type`을 생략합니다. `/artists/[slug]` 같은 동적 경로 패턴에는 `'page'`가 필요합니다.
     - `revalidatePath("/product/상품슬러그")`
     - `revalidatePath("/collections/카테고리슬러그")`
     - `revalidatePath("/")`
  5. Route Handler에서 만료한 페이지는 다음 접근에서 다시 생성합니다. Admin의 상품 수정 API는 캐시 요청을 기다린 뒤 응답하므로 응답 종료로 요청이 중단되지 않습니다. 이미 열린 브라우저 화면은 재접근·새로고침이 필요하며, 변경 전에 localStorage에 담아 둔 장바구니 금액의 재동기화는 이 서버 캐시 계약에 포함하지 않습니다.

설치된 Next.js16.2 문서의 `revalidatePath`·`revalidateTag`·`fetch` 규격을 기준으로 구현합니다. [검증 기록](../../../blank-seoul-admin/.agent-bridge/storefront-cache-verification-results.json)에 코드·실제 API·운영 방식의 로컬 화면·배포 대기를 구분합니다.
