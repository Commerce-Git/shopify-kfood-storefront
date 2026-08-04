# 🗺️ 카테고리 위계 마스터 맵 (Category Hierarchy Master Map)

본 문서는 **Shopify Admin / Admin Portal (`blank-seoul-admin`) / Storefront (`blankseoul.com`)** 전 영역에 적용되는 **1:1 카테고리 위계 아키텍처 및 3대 대카테고리 & 8대 세부 카테고리 마스터 규칙 명세서**입니다.

---

## 🏛️ 1. 카테고리 매핑 기본 원칙 (Mapping Architecture)

| 구분 | Shopify Admin 연동 위치 | DB 칼럼명 | 설명 |
| :--- | :--- | :--- | :--- |
| **대카테고리** | **`Product Type (유형)`** | `master_products.category` | 3대 대카테고리 중 1개 1:1 지정 |
| **세부 카테고리** | **`Collections (컬렉션)`** | `master_products.sub_category` | 8대 세부 카테고리 컬렉션 중 1개 1:1 지정 |
| **전체 상품 모아보기** | **`Home page` (`/collections/all`)** | N/A | 쇼피파이 내장 가상 전체보기 뷰 (상품 카테고리 데이터 오염 없음) |

---

## 📂 2. 3대 대카테고리 & 8대 세부 카테고리 마스터 구조 (Master Taxonomy)

```
 [1. Bags & Pouches (가방 & 파우치)]
  ├── A. Hobo & Shoulder Bags     (보부상 가방, 댕기백, 3way 가방 등)
  ├── B. Pouches & Wristlets       (복주머니, 지퍼 파우치, 손목 파우치 등)
  └── C. Wallets & Passport Cases  (동전지갑, 카드지갑, 여권케이스 등)

 [2. Accessories & Charms (패션 장신구 & 키링)]
  ├── D. Keyrings & Bag Charms     (십장생, 노리개, 북어, 연꽃 키링 & 백참 등)
  ├── E. Hair Scrunchies & Binyeo  (댕기, 스크런치, 흑단 비녀 등)
  └── F. Necklaces & Headbands     (전통 초커 목걸이, 반다나 머리띠 등)

 [3. Home & Living (홈 & 리빙)]
  ├── G. Home Decor & Doorbells    (액막이 명태 도어벨, 패브릭 트레이 등)
  └── H. Tea & Dining              (일월오봉 티코스터, 수제 도자기 컵 등)
```

---

## 📌 3. 카테고리 운영 및 유지보수 규칙 (Operation Rules)

1. **신규 상품 등록 시:**
   * 쇼피파이 어드민 [Products] 등록 시 `Product Type (유형)`에 3대 대카테고리 중 1개 선택.
   * `Collections (컬렉션)`에서 8대 세부 카테고리 컬렉션 중 1개 선택.
2. **자동 역동기화 및 렌더링:**
   * 쇼피파이 어드민에서 카테고리 선택 시 `products/update` 웹훅이 작동하여 Supabase DB (`category`, `sub_category`) 및 스토어프런트 캐시가 0.1초 만에 자동 최신화됩니다.
