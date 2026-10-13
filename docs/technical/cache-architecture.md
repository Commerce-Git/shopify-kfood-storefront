# ⚡ Next.js Storefront 캐시 아키텍처 가이드 (Cache Architecture Guide)

본 문서는 `blank-seoul-storefront` 헤드리스 쇼핑몰 프로젝트에서 데이터 정밀도와 페이지 로딩 속도를 양립하기 위해 설계된 하이브리드 캐싱 모델에 대해 설명합니다.

---

## 🏗️ 전체 캐시 아키텍처 개요

| 조회 | 현재 구현 | 목적 |
| --- | --- | --- |
| 홈·상품 목록·컬렉션 | Shopify 응답60초 캐시·카탈로그 태그·페이지 ISR | 반복 조회 비용 절감 |
| 상품 상세·상품 메타데이터 | 상품 조회 `no-store`, 페이지 `revalidate = 0`, 같은 요청 안에서만 React `cache` 공유 | 구매 가격에 이전 페이지·데이터 캐시를 더하지 않음 |
| 상품 상세 리뷰 | `unstable_cache` 300초 | 리뷰 조회 DB 비용 절감 |
| 재고 API | 동적 API·Shopify 조회15초·CDN15초/SWR60초 | 재고 조회 부하 제한; 완전한 실시간 보장은 아님 |

상품 상세의 요청별 조회 수정은 로컬 구현·검증 상태이며 후속 dev 배포가 남아 있습니다.

---

## 1. API 레벨 통합 캐싱 (1분 단위 ISR)
홈·상품 목록·컬렉션과 상품 상세가 Shopify Storefront API에 보내는 GraphQL 요청은 `lib/shopify/storefront.ts`의 `storefrontFetch()` 공통 함수를 통과합니다.

* **설정 방식**: 공통 함수의 기본 요청에는 `next: { revalidate: 60 }`이 적용됩니다. `getProductByHandle`의 상품 상세 조회와 가격 확인 API는 `{ cache: 'no-store' }`를 지정해 이 캐시에서 제외됩니다.
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
메인 홈(`/`)과 컬렉션 페이지(`/collections/[handle]`)는 ISR을 사용합니다. 상품 상세(`/product/[handle]`)는 `revalidate = 0`·상품 조회 `no-store`로 요청마다 렌더링하며 `generateStaticParams`를 제거했습니다. 메타데이터와 본문은 같은 요청 안에서만 `cache(getProductByHandle)`로 조회를 공유합니다. 상세 진입마다 Shopify 요청이 발생하므로 기존 ISR보다 조회 비용과 응답 시간의 영향을 받습니다. 대규모 부하 검증은 별도입니다.

* **동작 원리**: 
  - 1분 단위의 **ISR (Incremental Static Regeneration)** 상태로 동작합니다.
  - 고객이 페이지에 진입하면 캐싱된 HTML을 응답합니다. 고정된 로딩 시간을 보장하지 않습니다.
  - 1분이 지난 시점 이후 최초로 방문하는 고객이 있을 때, 서버 백그라운드에서 백엔드 데이터를 다시 긁어와 정적 HTML 파일을 조용히 최신화합니다. (그다음 고객부터 최신 페이지 노출)

---

## 3. 실시간 재고 조회 (캐시 우회 클라이언트 패칭)
`/app/api/stock/route.ts`는 `force-dynamic` API지만 Shopify 조회에는 `next: { revalidate: 15 }`, 응답에는 `public, s-maxage=15, stale-while-revalidate=60`을 사용합니다. 상품 상세 클라이언트가 이 API로 재고 배지를 표시하고 구매 버튼을 제어합니다. 실제 코드의15초 캐시를 무시하고 완전한 실시간 재고·초과 판매 방지로 판정하지 않습니다. 이번 가격 작업에서 재고 구현은 변경하지 않았습니다.

---

## 4. 온디맨드 즉각 캐시 무효화 (On-Demand Revalidation)
Admin의 상품 동기화 후 홈페이지가 다음 접근에서 최신 데이터를 가져오도록 캐시를 만료합니다. 고정된 0.1초 반영이나 외부 API의 즉시 일관성을 보장하는 계약은 아닙니다.

* **경로**: `/app/api/revalidate/route.ts` API 엔드포인트
* **인증**: 같은 환경의 `REVALIDATE_SECRET`을 검사합니다. 보호된 Preview의 서버 접근에는 [환경 연결 계약](../environment-isolation.md#연결값)의 `STOREFRONT_API_PROTECTION_BYPASS` 헤더도 필요합니다.
* **동작 원리**:
  1. WMS 데이터 동기화 완료 시 `POST /api/revalidate`로 요청이 전달됩니다.
  2. 가격 변경 요청에는 Admin이 조회한 Shopify 실제 handle과 `expectedPrice: { variantId, amountUsd }`를 전달합니다. Storefront는 상품 상세와 같은 `storefrontFetch`·API 주소(`2025-10`)·전체 상품 쿼리·변수를 사용하고, 확인 요청에만 `cache: 'no-store'`와4초 제한을 적용합니다. 값이 아직 다르면 캐시를 만료하지 않고 `409 / SHOPIFY_PRICE_PENDING`을 반환합니다. Admin은 이 응답만 1초 간격으로 최대40회·전체45초 안에서 확인하고, 다른 실패·미지원 응답은 성공으로 기록하지 않습니다. 이 한도를 넘는 지연은 로그에 남으며 영구 재시도 큐는 이번 범위가 아닙니다. 이전 버전의 Storefront가 가격 확인 없이200을 반환해도 `priceConfirmed: true`가 없으면 성공으로 기록하지 않습니다.
  3. 새 가격을 확인한 뒤 `revalidateTag('shopify-catalog', { expire: 0 })`로 공통 Shopify 조회 캐시를 만료합니다. 페이지 재생성 때 이전 상품 응답을 다시 사용하지 않도록 합니다. 가격 검사가 없는 상품·이미지·작가 갱신도 이 태그를 만료합니다.
  4. 수신된 `handle` 및 `collections`에 **`revalidatePath()`**를 적용합니다. 구체 주소에는 `type`을 생략합니다. `/artists/[slug]` 같은 동적 경로 패턴에는 `'page'`가 필요합니다.
     - `revalidatePath("/product/상품슬러그")`
     - `revalidatePath("/collections/카테고리슬러그")`
     - `revalidatePath("/")`
  5. Route Handler에서 만료한 페이지는 다음 접근에서 다시 생성합니다. Admin의 상품 수정 API는 캐시 요청을 기다린 뒤 응답하므로 응답 종료로 요청이 중단되지 않습니다. 이미 열린 브라우저 화면은 재접근·새로고침이 필요하며, 변경 전에 localStorage에 담아 둔 장바구니 금액의 재동기화는 이 서버 캐시 계약에 포함하지 않습니다.

설치된 Next.js16.2 문서의 `revalidatePath`·`revalidateTag`·`fetch` 규격을 기준으로 구현합니다. [검증 기록](../../../blank-seoul-admin/.agent-bridge/storefront-cache-verification-results.json)에 코드·실제 API·운영 방식의 로컬 화면·배포 검증을 구분합니다.

2026-10-14 첫 dev 버전의4회 시험에서는 이전 가격 잔류2회·첫 조회 반영2회를 확인했습니다. 조회 주소를 통일한 Storefront `51c70cf`·Admin `4394753`의 후속 dev 시험2회 중1회는 첫 조회와 마우스 클릭의 새 장바구니가153을 표시했고1회는 이전 가격이 남았습니다. 주소 통일만으로 지연이 해소됐다고 판정하지 않습니다.

추가 시험에서는 **Shopify Admin API는153인데 캐시를 우회한 Storefront API 자체는34**인 시점을 함께 기록했습니다. 로컬 운영 방식의 요청별 상세 조회에서 외부 Storefront 가격이153으로 전파되자 화면도153이 됐고, 새 장바구니153·가격 하향 뒤 새 상세/새 장바구니34를 확인했습니다. 최종 사례에서는 최초 측정부터 약15초 동안 외부 API의 이전 가격이 관찰됐습니다. 외부 가격 전파의 즉시 일관성을 보장할 수 없으며, 요청별 상세 조회 수정의 dev 배포 검증은 아직 남아 있습니다. [Next.js fetch 규격](https://nextjs.org/docs/app/api-reference/functions/fetch)의 `no-store`는 Next.js 캐시를 우회하는 옵션이며 Shopify 내부 전파 지연까지 제거하는 기능은 아닙니다.
