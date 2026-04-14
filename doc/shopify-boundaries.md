# Shopify Headless Architecture — 건드리면 안 되는 것

> 이 문서는 프론트엔드 UI/UX 수정 시 반드시 지켜야 하는 Shopify 연동 규칙을 정리합니다.

## 아키텍처 개요

```
┌──────────────────────────────────┐
│  ✅ 자유롭게 수정 가능한 영역      │
│                                  │
│  Next.js 프론트엔드               │
│  - 모든 UI/UX (색상, 폰트, 레이아웃)│
│  - 페이지 구조, 라우팅             │
│  - 장바구니 UI                    │
│  - 애니메이션, 인터랙션             │
│  - SEO 메타데이터                 │
│  - 추가 페이지 (블로그, 이벤트 등)  │
│                                  │
└────────────┬─────────────────────┘
             │
             │ Storefront API (GraphQL)
             │ ← 이 연결 규격만 지키면 됨
             │
┌────────────▼─────────────────────┐
│  🔒 Shopify가 처리하는 영역       │
│                                  │
│  - 체크아웃 페이지 (결제 UI)       │
│  - 신용카드/PayPal 처리           │
│  - 주문 생성 & 관리               │
│  - 세금/배송비 계산               │
│  - 상품/재고 데이터 저장           │
│                                  │
└──────────────────────────────────┘
```

---

## 🔴 절대 변경 금지 (5가지)

### 1. Variant ID 형식

Shopify의 Global ID 형식을 그대로 사용해야 합니다. 임의로 만들거나 가공하면 체크아웃이 실패합니다.

```
# 올바른 형식 (Shopify가 반환하는 그대로)
gid://shopify/ProductVariant/44567890123

# ❌ 잘못된 예
44567890123          ← 숫자만 추출
mock-variant-id      ← 임의 ID
variant_44567890123  ← 형식 변경
```

**적용 위치**: `BuyButton.tsx`의 `variantId` prop, `CartProvider.tsx`의 `CartItem.variantId`

---

### 2. Storefront API 엔드포인트 URL

```
https://{store-domain}.myshopify.com/api/{version}/graphql.json
```

- `{store-domain}`: Shopify Admin에서 확인 (현재: `tv7r0x-zn`)
- `{version}`: API 버전 (현재: `2024-10`)
- 반드시 HTTPS, POST 메서드 사용

**적용 위치**: `lib/shopify/storefront.ts`

---

### 3. 인증 헤더

```http
X-Shopify-Storefront-Access-Token: {토큰}
```

- 헤더 이름은 Shopify가 정한 것이며 한 글자라도 다르면 `401 Unauthorized`
- Storefront Access Token은 **공개 토큰** (프론트엔드에 노출 가능)
- `Content-Type: application/json` 필수

**적용 위치**: `lib/shopify/storefront.ts`의 `headers`

---

### 4. 체크아웃 URL 리다이렉트

`checkoutCreate` mutation이 반환하는 `checkout.webUrl`을 그대로 사용해야 합니다.

```typescript
// ✅ 올바른 사용
window.location.href = checkout.webUrl;

// ❌ 금지
window.location.href = checkout.webUrl + "?custom_param=1";  // URL 가공
window.location.href = "/our-checkout";                       // 자체 체크아웃
```

**이유**: Shopify 체크아웃 URL에는 세션 토큰이 포함되어 있으며, 이를 변경하면 결제가 실패합니다.

**적용 위치**: `app/components/BuyButton.tsx`

---

### 5. Admin API 키 노출 금지

```
# ✅ 프론트엔드에서 사용 가능
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=xxx    ← Storefront API (공개 토큰)

# ❌ 절대 프론트엔드에 노출 금지
SHOPIFY_ADMIN_API_TOKEN=xxx                 ← Admin API (비밀 토큰)
```

- Admin API 토큰은 `shopify-git` 프로젝트(백오피스)에서만 사용
- 이 프로젝트에 Admin API 키를 절대 넣지 않기

**적용 위치**: `.env.local`, `lib/shopify/storefront.ts`

---

## 🟡 변경 시 주의 필요 (3가지)

### 1. GraphQL 쿼리 필드

- 필드 **추가**는 자유 (Storefront API 스키마에 존재하는 필드만)
- 필드 **삭제** 시 해당 데이터를 사용하는 컴포넌트 확인 필수
- [Storefront API 레퍼런스](https://shopify.dev/docs/api/storefront) 참고

```graphql
# ✅ 필드 추가 가능
product(handle: $handle) {
  title
  description
  tags          # ← 추가 가능
  metafields    # ← 추가 가능
}

# ❌ 존재하지 않는 필드
product(handle: $handle) {
  customField   # ← Storefront API에 없으면 에러
}
```

**적용 위치**: `lib/shopify/queries.ts`

---

### 2. API 버전

현재 `2024-10`을 사용 중입니다. 변경 시:

- [Shopify API 버전 릴리즈 노트](https://shopify.dev/docs/api/release-notes) 확인
- Deprecated 필드가 제거되었을 수 있음
- `checkoutCreate` 같은 mutation의 입력 형식이 변경될 수 있음

**적용 위치**: `lib/shopify/storefront.ts`의 `STOREFRONT_API_URL`

---

### 3. Next.js 이미지 설정

Shopify CDN 이미지를 사용하려면 `next.config.ts`에 도메인을 허용해야 합니다.

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

이 설정이 없으면 `<Image>` 컴포넌트에서 Shopify 이미지 로드 시 에러 발생.

**적용 위치**: `next.config.ts`

---

## 🟢 자유롭게 변경 가능

| 영역 | 예시 |
|---|---|
| **UI 디자인 전체** | 색상, 폰트, 레이아웃, 간격, 그림자, 테두리 |
| **컴포넌트 구조** | 섹션 순서 변경, 새 컴포넌트 추가/삭제 |
| **페이지 추가** | 블로그, 이벤트, Contact, Track Order 등 |
| **장바구니 UI** | 드로어, 플로팅 카트, 미니 카트 등 어떤 형태든 |
| **상품 표시 방식** | 그리드, 리스트, 캐러셀, 단일 페이지 등 |
| **애니메이션** | 스크롤, 호버, 트랜지션, 파라랠스 |
| **반응형 디자인** | 모바일/태블릿/데스크톱 레이아웃 자유 |
| **SEO** | title, meta, OG 이미지, sitemap |
| **폰트** | Google Fonts, 로컬 폰트, 아무거나 |
| **다크모드** | 자유 추가 가능 |

**핵심 원칙**: Shopify에 보내는 API 요청의 형식과 체크아웃 URL만 지키면, 나머지 화면은 100% 자유입니다.
