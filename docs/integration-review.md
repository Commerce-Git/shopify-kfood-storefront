# Shopify 연동 기능 검토 보고서

> 현재 구현 상태와 실제 Shopify 연동을 위해 필요한 수정 사항을 정리합니다.

## 현재 상태 요약

| 기능 | 상태 | 설명 |
|---|---|---|
| 상품 자동 인식 | ❌ Mock | Shopify Admin 상품 변경이 프론트에 반영 안 됨 |
| Buy Now 직접 구매 | ✅ 구현 | API 토큰만 추가하면 작동 |
| 장바구니 UI | ✅ 구현 | React Context + localStorage |
| Cart → Checkout | ❌ 미연결 | 버튼 클릭 시 checkout 생성 안 됨 |
| Shopify 이미지 | ❌ 로컬 | CDN URL 미사용 |

---

## 1. 상품 자동 인식

### 현재: Mock 데이터 하드코딩

- `ProductShowcase.tsx`: 가격, 이름, variant ID가 전부 하드코딩
- `product/[handle]/page.tsx`: Mock 데이터 사용
- `WhatsInside.tsx`: 구성품 목록 하드코딩

### 수정 방향

Shopify Admin에서 상품 등록 → Storefront API가 자동 반영 → Next.js Server Component에서 fetch

```typescript
// 수정 예시: app/page.tsx
import { storefrontFetch } from "@/lib/shopify/storefront";
import { GET_ALL_PRODUCTS } from "@/lib/shopify/queries";

export default async function Home() {
  const data = await storefrontFetch(GET_ALL_PRODUCTS);
  const product = data.products.edges[0].node;
  
  return (
    <>
      <Hero />
      <ProductShowcase product={product} />  {/* props로 전달 */}
      ...
    </>
  );
}
```

### 수정 대상 파일

| 파일 | 수정 내용 |
|---|---|
| `app/page.tsx` | Server Component에서 `GET_ALL_PRODUCTS` 호출 |
| `app/components/ProductShowcase.tsx` | Mock 제거, props로 데이터 받기 |
| `app/product/[handle]/page.tsx` | `GET_PRODUCT_BY_HANDLE` 호출 |

---

## 2. 장바구니 → 체크아웃 연결

### 현재 문제

```tsx
// cart/page.tsx - Line 156
<button className="btn-primary w-full text-base py-4 mt-2">
  Proceed to Checkout   // ← onClick 핸들러가 없음!
</button>
```

### 수정 방향

```typescript
async function handleCheckout() {
  const lineItems = items.map(item => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));
  
  const data = await storefrontFetch(CREATE_CHECKOUT, { lineItems });
  window.location.href = data.checkoutCreate.checkout.webUrl;
}
```

---

## 3. Shopify 이미지 CDN

### 현재: 로컬 이미지

`public/images/` 디렉토리의 AI 생성 이미지 사용 중

### 수정 필요

1. `next.config.ts`에 Shopify CDN 도메인 허용
2. 상품 이미지를 API 응답의 `images.edges[].node.url` (Shopify CDN URL)로 대체

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
    ],
  },
};
```

---

## 4. 환경 변수 설정

### 필요한 `.env.local` 파일

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=tv7r0x-zn.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<Storefront API 토큰>
```

### 토큰 생성 방법

1. Shopify Admin → Settings → Apps and sales channels
2. "Develop apps" 클릭
3. 새 앱 생성 → Storefront API access scopes 설정
4. 필요한 권한: `unauthenticated_read_products`, `unauthenticated_write_checkouts`
5. Install → Storefront access token 복사

---

## 수정 우선순위

```
1️⃣  .env.local 생성 (토큰 설정)
2️⃣  next.config.ts 수정 (이미지 CDN)
3️⃣  랜딩 페이지 → API 연동
4️⃣  상품 상세 페이지 → API 연동
5️⃣  Cart → Checkout 연결
6️⃣  Add to Cart 버튼 추가
```
