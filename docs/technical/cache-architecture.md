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
    next: { revalidate: 60 }, // ISR: 60초 캐싱
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
WMS 대시보드(`shopify-git`)에서 작가가 재고를 업데이트하거나 이미지를 새로 업로드하는 등 데이터 소스의 변동이 완료되었을 때, 1분(60초)의 만료 대기 시간을 기다리지 않고 쇼핑몰 화면을 즉시 갱신하는 실시간 동기화 브릿지입니다.

* **경로**: `/app/api/revalidate/route.ts` API 엔드포인트
* **보안 토큰**: `.env.local`의 `REVALIDATE_SECRET`을 매칭하여 인증되지 않은 악의적인 외부 Revalidate 폭탄 공격을 가드합니다.
* **동작 원리**:
  1. WMS 데이터 동기화 완료 시 `POST /api/revalidate`로 요청이 전달됩니다.
  2. 수신된 `handle` 및 `collections` 파라미터를 기반으로 Next.js 내부 캐시 무효화 함수인 **`revalidatePath()`**를 호출합니다.
     - `revalidatePath("/product/상품슬러그")`
     - `revalidatePath("/collections/카테고리슬러그")`
     - `revalidatePath("/")`
  3. 무효화 즉시 Next.js 서버는 해당 페이지들의 기존 캐시를 강제 파기하고 즉각 새 정적 HTML 파일을 조용히 재빌드합니다.
