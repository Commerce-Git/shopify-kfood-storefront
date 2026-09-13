# 🗺️ 카테고리 위계 마스터 맵 (Category Hierarchy Master Map)
## (Shopify 3/8대 상업용 분류 & 작가 위저드 11대 공예 통관 분류 브릿지 명세서)

본 문서는 **Shopify Admin / Admin Portal (`blank-seoul-admin`) / Storefront (`blankseoul.com`)** 전 영역에 적용되는 **2-Tier 카테고리 위계 아키텍처 및 쇼피파이 3대/8대 컬렉션과 작가 등록 위저드 11대 공예 카테고리 간의 상호 매핑 브릿지 규칙 명세서**입니다.

---

## 🏛️ 1. 2-Tier 카테고리 위계 아키텍처 (2-Tier Taxonomy)

블랭크서울은 **고객 중심의 쇼핑몰 UX(상업용 분류)**와 **전문적인 글로벌 세관 통관(공예품 본질 분류)**을 분리하여 양방향 1:1 자동 매핑하는 2-Tier 구조를 운영합니다:

```
┌── [ Tier 1: 작가 등록 & 세관 통관 엔진 ] ──────────────────────────────────────────┐
│  • 작가 포털 위저드(ProductWizardModal) 및 통관 엔진(hscodeWizardMaster.ts)        │
│  • 11대 공예 카테고리 ➔ 34개 터미널 세번 (HSK 10자리 / WCO 6자리 / 실물 영문명)    │
│  • [결과]: 통관 데이터 4종 + 쇼피파이 대카테고리/컬렉션(subCategory) 자동 생성     │
└──────────────────────────────────────┬──────────────────────────────────────────────┘
                                       │ (자동 매핑 & DB 저장)
                                       ▼
┌── [ Tier 2: 쇼피파이 스토어프런트 & 커머스 분류 ] ──────────────────────────────────┐
│  • 고객 쇼핑 및 컬렉션 탐색 UX (blankseoul.com)                                     │
│  • [대카테고리]: Product Type (유형) ➔ master_products.category (3대 대분류)        │
│  • [세부 컬렉션]: Collections (컬렉션) ➔ master_products.sub_category (8대 세부)     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

| 구분 | Shopify Admin 연동 필드 | DB 칼럼명 | 설명 |
| :--- | :--- | :--- | :--- |
| **대카테고리** | **`Product Type (유형)`** | `master_products.category` | 3대 대카테고리 중 1개 1:1 지정 |
| **세부 컬렉션** | **`Collections (컬렉션)`** | `master_products.sub_category` | 8대 세부 카테고리 컬렉션 중 1개 1:1 지정 |
| **전체 상품 뷰** | **`Home page` (`/collections/all`)** | N/A | 쇼피파이 내장 가상 전체보기 (카테고리 데이터 오염 없음) |

---

## 📂 2. 쇼피파이 3대 대카테고리 & 8대 세부 컬렉션 마스터 구조

스토어프런트 네비게이션 및 쇼피파이 상품 관리의 기본 골격입니다:

```
 [1. Bags & Pouches (가방 & 파우치)]
  ├── A. Hobo & Shoulder Bags     (보부상 가방, 댕기백, 3way 보자기 가방 등)
  ├── B. Pouches & Wristlets       (양단 복주머니, 지퍼 파우치, 손목 스트랩 파우치 등)
  └── C. Wallets & Passport Cases  (전통 카드지갑, 사각 동전지갑, 누비 여권케이스 등)

 [2. Accessories & Charms (패션 장신구 & 키링)]
  ├── D. Keyrings & Bag Charms     (십장생·자개 키링, 전통 실크 매듭 노리개 및 술, 백참 등)
  ├── E. Hair Scrunchies & Binyeo  (댕기, 한복 스크런치, 흑단목/은/황동 비녀, 뒤꽂이 등)
  └── F. Necklaces & Headbands     (전통 초커 목걸이, 실크 스카프/머플러, 반다나 머리띠 등)

 [3. Home & Living (홈 & 리빙)]
  ├── G. Home Decor & Doorbells    (액막이 명태 도어벨, 풍경, 황동·원목 인센스 홀더 및 트레이,
  │                                나전칠기 보석함, 한지 조명, 고체 선향/향낭, 원작 회화 등)
  └── H. Tea & Dining              (일월오봉 티코스터, 수제 백자/청자 다도 세트, 찻잔,
                                   전통 미니어처 소반, 천연 옻칠 수저세트 등)
```

---

## 🌉 3. 11대 공예 위저드 ➔ 쇼피파이 8대 컬렉션 상호 매핑표 (Cross-Taxonomy Bridge)

작가 등록 위저드에서 11대 공예 카테고리를 선택하고 주소재/세부형태를 정하면, **시스템이 쇼피파이 3대 유형 및 8대 컬렉션으로 0.01초 만에 100% 자동 배정**합니다:

| 작가 위저드 11대 카테고리 | 대표 공예품 예시 | 세부 형태 / 소재 분기 | 쇼피파이 Product Type | 쇼피파이 Collections (`subCategory`) |
| :--- | :--- | :--- | :---: | :--- |
| **도자기 & 다기**<br>(`ceramics_dining`) | 백자 찻잔, 다관, 접시, 달항아리, 화병 | 찻잔/머그/다기세트/접시 (식기류) | `Home & Living` | **`Tea & Dining`** |
| | | 달항아리, 화병, 조형 오브제 (장식품) | `Home & Living` | **`Home Decor & Doorbells`** |
| | | 인센스 홀더, 수저받침, 테이블 소품 | `Home & Living` | **`Home Decor & Doorbells`** |
| **목공예 & 나전칠기**<br>(`woodcraft_najeon`) | 나전 보석함, 명함함, 원목 인센스 트레이 | 보석함 / 인센스 트레이 | `Home & Living` | **`Home Decor & Doorbells`** |
| | 전통 소반(미니어처), 천연 옻칠 수저세트 | 다이닝 / 테이블웨어 | `Home & Living` | **`Tea & Dining`** |
| **가방 & 파우치**<br>(`bags_pouches`) | 양단 복주머니, 자수 손목 파우치 | 조주머니 / 파우치 | `Bags & Pouches` | **`Pouches & Wristlets`** |
| | 보부상 숄더백, 댕기 토트백, 3way 가방 | 토트백 / 숄더백 | `Bags & Pouches` | **`Hobo & Shoulder Bags`** |
| | 전통 비단 카드지갑, 누비 여권케이스 | 지갑 / 여권케이스 | `Bags & Pouches` | **`Wallets & Passport Cases`** |
| **장신구 & 키링**<br>(`jewelry_charms`) | 자개 키링, 황동 백참, 전통 실크 매듭 노리개 | 키링 / 백참 / 노리개술 | `Accessories & Charms` | **`Keyrings & Bag Charms`** |
| | 순은 925 초커, 매듭 목걸이 | 초커 / 목걸이 | `Accessories & Charms` | **`Necklaces & Headbands`** |
| **헤어웨어 & 비녀**<br>(`hair_wear`) | 흑단 비녀, 은비녀, 배씨댕기, 한복 스크런치 | 비녀 / 뒤꽂이 / 스크런치 | `Accessories & Charms` | **`Hair Scrunchies & Binyeo`** |
| **금속 데코 & 오브제**<br>(`metal_decor`) | 황동 물고기 풍경, 액막이 도어벨, 핀뱃지 | 도어벨 / 오브제 / 인센스홀더 | `Home & Living` | **`Home Decor & Doorbells`** |
| **패브릭 & 리빙**<br>(`fabric_living`) | 일월오봉 티코스터, 패브릭 식탁 매트 | 티코스터 / 플레이스매트 | `Home & Living` | **`Tea & Dining`** |
| | 조각보 창문 가리개, 누비 방석 | 가리개 / 패브릭 소품 | `Home & Living` | **`Home Decor & Doorbells`** |
| **생활한복 & 의류**<br>(`modern_hanbok`) | 명주 허리치마, 린넨 철릭 원피스 | 한복 치마 / 외투류 | `Home & Living` | **`Home Decor & Doorbells`** |
| | 천연 실크 스카프, 모시 머플러 | 스카프 / 머플러 | `Accessories & Charms` | **`Necklaces & Headbands`** |
| **한지 조명 & 무드등**<br>(`lighting_mood`) | 한지 단스탠드, 도자기 무드등, 전통 등잔 | 한지 / 도자기 유선 조명, 등잔 | `Home & Living` | **`Home Decor & Doorbells`** |
| **향 & 인센스**<br>(`incense_wellness`) | 침향 선향(스틱), 삼각뿔향, 명주실 향낭 | 천연 선향 / 사쉐 | `Home & Living` | **`Home Decor & Doorbells`** |
| **한지 문구 & 부채**<br>(`hanji_stationery`) | 합죽선 전통 부채, 닥나무 한지노트, 금속 책갈피 | 합죽선 / 한지노트 / 문진·책갈피 | `Home & Living` | **`Home Decor & Doorbells`** |

---

## 📌 4. 카테고리 운영 및 유지보수 규칙 (Operation Rules)

1. **신규 작품 등록 시 (Zero Friction):**
   * 작가는 복잡한 쇼피파이 컬렉션 구조를 고민할 필요 없이, 위저드에서 **본인 작품의 공예 분야(11대)만 직관적으로 선택**하면 됩니다.
   * 위저드 엔진이 통관 데이터(`hs_code`, `customs_title_en`)와 함께 **쇼피파이 `category` 및 `sub_category`를 100% 자동 주입**합니다.
2. **쇼피파이 어드민 직접 등록/수정 시:**
   * 어드민 [Products]에서 직접 등록할 경우 `Product Type`에 3대 대분류 중 1개, `Collections`에서 8대 세부 컬렉션 중 1개를 지정합니다.
3. **자동 양방향 동기화 및 캐시 무효화:**
   * 쇼피파이 어드민 또는 DB에서 카테고리가 변경되면 웹훅 파이프라인이 작동하여 Supabase DB 및 스토어프런트 캐시가 0.1초 만에 자동 최신화됩니다.

---

## 🍵 5. 11대 공예 카테고리별 Care & Safety Standards 1:1 표준화 및 운영 원칙 (SOP-CMP-2026-04)

블랭크서울 스토어프론트([`lib/config/categoryMaster.ts`](file:///Users/junseoha/Downloads/blank-seoul-storefront/lib/config/categoryMaster.ts))는 상품 상세페이지의 취급 및 안전 기준을 **어드민 공식 11대 공예 카테고리에 기반하여 1:1 표준화**하여 제공합니다.

### 🏛️ 4대 핵심 운영 원칙
1. **단일 진실 공급원 (Single Source of Truth):**
   * 개별 상품마다 제각각 관리법을 작성하지 않고, 공예의 물리적 본질과 소재를 결정하는 **11대 공예 카테고리별 공통 표준(Care & Safety Standards)**을 100% 일괄 적용합니다.
   * 작가나 관리자의 기재 누락 및 오기재로 인한 글로벌 법적 리스크(US FDA, EU GPSR)를 원천 차단합니다.
2. **영문 상품명 파싱 완전 배제 (Pure Category-Driven):**
   * 영문 단어 긁기(`cup`, `mug`, `spoon`, `norigae` 등)를 일절 사용하지 않습니다.
   * 작가가 시적인 영문명(`"Dawn Whispers"`)이나 한글명(`"백자 달항아리"`)으로 등록해도, **작품의 공식 카테고리 ID에 의해 100% 명시적으로 정확한 기준**이 뜹니다.
3. **상업용 진열대(컬렉션)와 공예 신분증(카테고리)의 관계:**
   * 패브릭 티코스터가 고객 쇼핑 진열대인 `Tea & Dining` 컬렉션에 진열되어 있어도, 작품 본질 신분증인 `category:fabric_living` 태그가 1순위로 적용되어 **100% 패브릭/티코스터 기준이 노출**됩니다.
4. **보수적 안전 기본값 (Safe-by-Default):**
   * 미분류 상품이나 예외 상품 유입 시, 허위 표기 없이 `general_craft` (공식 인증 서울 장인 공방 헤리티지 보증서)로 안전하게 안착합니다.
   * US FDA 21 CFR (1,250°C/2,282°F 식품접촉 안전), EU REACH (무니켈) 규정을 보수적으로 인가합니다.

---

## 🔗 6. 관련 상세 가이드

* **스토어프론트 단일 카테고리 마스터 소스코드:** [`lib/config/categoryMaster.ts`](../lib/config/categoryMaster.ts)
* **글로벌 D2C 공예품 안전·취급 표준 정책서:** [`docs/Craft_Care_and_Safety_Standards_Policy.md`](./Craft_Care_and_Safety_Standards_Policy.md)
* **세관 통관 & HS 코드 통합 총괄 가이드 (Control Tower):** `blank-seoul-admin/doc/hscode/README.md`
* **작가 친화형 3단계 HS CODE 선택 시스템 및 34개 세번 명세서:** `blank-seoul-admin/doc/hscode/HSCODE_Step_By_Step_Selection_Guide.md`
* **11대 마스터 카테고리 선택 및 스마트 안내 명시 원칙:** `blank-seoul-admin/doc/hscode/Category_Selection_and_Notice_Policy.md`
