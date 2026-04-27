# 프로젝트 파일 구조

> K-Food Headless Storefront의 전체 파일 구조와 각 파일의 역할을 정리합니다.

## 디렉토리 트리

```
shopify-kfood-storefront/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (폰트, SEO, Header/Footer)
│   ├── page.tsx                  # 랜딩 페이지 (/)
│   ├── globals.css               # 디자인 시스템 (브랜드 토큰, 유틸리티)
│   ├── favicon.ico               # 파비콘
│   │
│   ├── components/               # 재사용 컴포넌트
│   │   ├── Header.tsx            # 글래스모피즘 네비게이션 바
│   │   ├── Footer.tsx            # 다크 푸터 (링크, SNS, Shopify 뱃지)
│   │   ├── CartProvider.tsx      # 장바구니 상태 (React Context)
│   │   ├── BuyButton.tsx         # Buy Now → Shopify checkout 리다이렉트
│   │   ├── Hero.tsx              # 히어로 섹션 (풀스크린)
│   │   ├── ProductShowcase.tsx   # 상품 소개 (이미지 + 정보)
│   │   ├── WhatsInside.tsx       # 구성품 그리드
│   │   ├── TrustBadges.tsx       # 신뢰 뱃지 (Seoul/FDA/Authentic)
│   │   ├── Reviews.tsx           # 리뷰 캐러셀
│   │   ├── FAQ.tsx               # 아코디언 FAQ
│   │   └── StickyBuyBar.tsx      # 하단 고정 구매 바
│   │
│   ├── about/
│   │   └── page.tsx              # About 페이지 (/about)
│   │
│   ├── cart/
│   │   └── page.tsx              # 장바구니 페이지 (/cart)
│   │
│   ├── faq/
│   │   └── page.tsx              # FAQ 전체 페이지 (/faq)
│   │
│   ├── product/
│   │   └── [handle]/
│   │       └── page.tsx          # 상품 상세 (/product/[handle])
│   │
│   └── policies/
│       ├── layout.tsx            # 정책 공통 레이아웃 (사이드바)
│       ├── shipping/page.tsx     # 배송 정책
│       ├── returns/page.tsx      # 반품 정책
│       ├── privacy/page.tsx      # 개인정보 처리방침
│       └── terms/page.tsx        # 이용약관
│
├── lib/                          # 유틸리티 & API
│   └── shopify/
│       ├── storefront.ts         # Storefront API GraphQL 클라이언트
│       ├── queries.ts            # GraphQL 쿼리 & mutation
│       └── types.ts              # TypeScript 타입 정의
│
├── public/
│   └── images/                   # 이미지 에셋
│       ├── hero-bg.webp          # 히어로 배경
│       ├── snack-box.webp        # 스낵 박스 제품 사진
│       ├── snack-1~6.webp        # 개별 스낵 이미지
│       └── about-story.webp      # About 페이지 이미지
│
├── doc/                          # 프로젝트 문서
│   ├── shopify-boundaries.md     # 건드리면 안 되는 것 가이드
│   ├── integration-review.md     # Shopify 연동 검토 보고서
│   └── file-structure.md         # 이 파일
│
├── .env.local                    # 환경 변수 (생성 필요)
├── next.config.ts                # Next.js 설정
├── package.json                  # 의존성
├── tsconfig.json                 # TypeScript 설정
├── postcss.config.mjs            # PostCSS (TailwindCSS 4)
└── README.md                     # 프로젝트 개요 & 구현 계획
```

## 컴포넌트 의존 관계

```
layout.tsx
  ├── CartProvider (Context)
  ├── Header
  │     └── useCart()
  └── Footer

page.tsx (랜딩)
  ├── Hero
  ├── ProductShowcase
  │     └── BuyButton → storefrontFetch(CREATE_CHECKOUT)
  ├── WhatsInside
  ├── TrustBadges
  ├── Reviews
  ├── FAQ
  └── StickyBuyBar

product/[handle]/page.tsx
  ├── BuyButton
  ├── TrustBadges
  └── Reviews

cart/page.tsx
  └── useCart() → CartProvider
```

## Server vs Client 컴포넌트

| 타입 | 파일 |
|---|---|
| **Server** | `layout.tsx`, `page.tsx`, `about/page.tsx`, `faq/page.tsx`, `product/[handle]/page.tsx`, 모든 `policies/*/page.tsx`, `Footer.tsx`, `TrustBadges.tsx` |
| **Client** (`'use client'`) | `Header.tsx`, `CartProvider.tsx`, `BuyButton.tsx`, `Hero.tsx`, `ProductShowcase.tsx`, `WhatsInside.tsx`, `Reviews.tsx`, `FAQ.tsx`, `StickyBuyBar.tsx`, `cart/page.tsx`, `policies/layout.tsx` |
