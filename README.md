# K-Food Headless Storefront

> **이 문서를 읽는 AI에게**: 이 프로젝트의 구현 계획서입니다. 아래 내용에 따라 코드를 작성해 주세요.

## 프로젝트 개요

한국 K-Food 스낵 큐레이션 박스를 미국 시장에 D2C(Direct-to-Consumer)로 판매하는 **원 프로덕트(One-Product) 랜딩 페이지**입니다.

- **아키텍처**: Headless Commerce (Next.js 프론트엔드 + Shopify 결제 백엔드)
- **핵심 전략**: 상품 1개(큐레이션 박스)만 판매하는 랜딩 페이지형 스토어
- **브랜드 슬로건**: "Gift a Piece of Korea" (한국을 선물하세요)
- **브랜드 이름**: 미정 (임시로 "K-Food Store" 사용, 추후 변경 예정)
- **법인명**: Blank Palette LLC (DBA: 추후 결정)

## 기술 스택

| 항목 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 + React 19 |
| 스타일링 | TailwindCSS 4 |
| 결제 | Shopify Storefront API (GraphQL) |
| 배포 | Vercel (예정) |
| 언어 | TypeScript |

## 관련 프로젝트

이 프로젝트는 **프론트엔드(고객 화면)** 전용입니다. 백엔드 관리 기능(주문 수집, EMS 예약, FDA PN 신고, 상품 등록)은 별도 프로젝트인 `shopify-git`에서 처리됩니다. 두 프로젝트는 Shopify를 중앙 허브로 연결됩니다.

```
[이 프로젝트: 고객 화면]              [shopify-git: 관리자 백오피스]
  Storefront API (읽기)                Admin API (읽기/쓰기)
         ↓                                    ↓
    ┌─────────────────────────────────────────────┐
    │              Shopify (중앙 DB)               │
    │  상품, 주문, 재고, 결제 데이터 저장            │
    └─────────────────────────────────────────────┘
```

## 디자인 시스템

### 브랜드 컬러
- **Primary (네온 핑크)**: `#FF1E56`
- **Background (쿨 화이트)**: `#FAFAFA`
- **Dark**: `#121212`
- **Accent**: 필요 시 추가

### 타이포그래피
- **헤딩**: Google Fonts `Outfit` (Bold, ExtraBold)
- **본문**: Google Fonts `Inter` (Regular, Medium)

### 디자인 톤
- 팝(Pop)하고 활기찬 무드, 네온사인 스타일
- K-Pop 뮤직비디오처럼 대비가 뚜렷하고 트렌디한 색상
- 친근하고 약간의 호들갑(Excited)이 있는 톤
- 프리미엄하면서도 MZ세대에게 어필하는 디자인

## 구현 계획

### Phase 1: GitHub 연동
- `Commerce-Git` 조직에 `shopify-kfood-storefront` Private 레포 생성
- SSH 키: `github.com-commerce` 사용
- 초기 커밋 및 Push

### Phase 2: Shopify Storefront API 연동

#### 환경 변수 (`.env.local`)
```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=tv7r0x-zn.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<Storefront API 토큰>
```

#### 필요한 파일
1. `lib/shopify/storefront.ts` — Storefront API GraphQL 클라이언트 (공개 토큰)
2. `lib/shopify/queries.ts` — 상품 조회 쿼리 + checkoutCreate mutation

#### 핵심 로직: "Buy Now" 버튼
```typescript
// checkoutCreate mutation으로 결제 URL을 생성한 뒤 리다이렉트
async function handleBuyNow(variantId: string) {
  const { checkoutUrl } = await storefrontClient.mutate(CHECKOUT_CREATE, {
    lineItems: [{ variantId, quantity: 1 }]
  });
  window.location.href = checkoutUrl; // 쇼피파이 체크아웃으로 이동
}
```

### Phase 3: 원 프로덕트 랜딩 페이지 (핵심)

위에서 아래로 스크롤하는 구조. 홈페이지 전체가 하나의 거대한 세일즈 페이지 역할.

| 순서 | 섹션 | 설명 |
|---|---|---|
| ① | **Hero** | 풀스크린 배경 이미지 + "Gift a Piece of Korea" 카피 + CTA 버튼 |
| ② | **Product Showcase** | 박스 이미지(온전히 보이게) 좌측 + 가격/설명/Buy Now 우측 |
| ③ | **What's Inside** | 구성품 타일 (스크롤 시 하나씩 등장하는 애니메이션) |
| ④ | **Trust Badges** | ✈️ Direct from Seoul / ✅ FDA Compliant / 💯 Authentic |
| ⑤ | **Reviews** | 인스타그램 스타일 고객 후기 카드 (초기엔 목업 데이터) |
| ⑥ | **FAQ** | 배송 기간, 관세, 유통기한 등 아코디언 UI |
| ⑦ | **Sticky Buy Bar** | 하단 고정 바: 가격 + "Buy Now" 버튼 (스크롤 위치 무관) |

#### 컴포넌트 목록
- `app/components/Hero.tsx`
- `app/components/ProductShowcase.tsx`
- `app/components/WhatsInside.tsx`
- `app/components/TrustBadges.tsx`
- `app/components/Reviews.tsx`
- `app/components/FAQ.tsx`
- `app/components/StickyBuyBar.tsx`
- `app/components/BuyButton.tsx` — Storefront API checkoutCreate 호출

### Phase 4: 이미지 에셋
- `public/images/` 디렉토리에 히어로 배경, 구성품 이미지 등 배치
- AI 이미지 생성 도구를 활용하여 K-Food 스낵 박스 모카업 생성

### Phase 5: SEO 메타데이터
- `app/layout.tsx`에 title, meta description, OG 이미지 설정
- Google Fonts (Inter, Outfit) 로드

### Phase 6: 배포
- Vercel에서 GitHub 레포 Import → 자동 CI/CD
- 커스텀 도메인 연결 (추후)

## 중요 참고사항

### 체크아웃 도메인
Headless 구조에서 "Buy Now" 클릭 시 브라우저가 쇼피파이 체크아웃 도메인으로 리다이렉트됩니다. 버튼 근처에 "Secure checkout powered by Shopify" 문구를 표시하여 고객 신뢰감을 확보해야 합니다.

### Storefront API vs Admin API
- **이 프로젝트**: Storefront API만 사용 (공개 토큰, 읽기 전용 + 결제 생성)
- **shopify-git 프로젝트**: Admin API 사용 (비밀 토큰, 읽기/쓰기)
- 이 프로젝트에 Admin API 키를 절대 넣지 마세요!

### 타겟 고객
K-Pop, K-Drama 등 K-Culture에 관심이 많은 미국 현지인 (10대 후반 ~ 30대). 자기 자신에게 또는 K-Culture를 사랑하는 친구에게 특별한 선물을 주고 싶어하는 사람들.
