# 🏛️ 미국/글로벌 D2C 상품 상세페이지(PDP) 고지사항 마스터 가이드
> **문서 버전:** 2026.08.30 v2.1 (Etsy 표준 2단 아코디언 및 글로벌 클린 스펙 반영)  
> **관리 폴더:** `docs/product-detail-layout/`  
> **적용 대상:** Blank Seoul Storefront (`blank-seoul-storefront`) 및 백오피스 (`blank-seoul-admin`)  
> **관련 규정:** 미국 연방거래위원회(FTC), 미국 세관국경보호국(CBP), 국제 카드사(Visa/Mastercard/Stripe) 가이드라인

---

## 📌 문서 개요 (Overview)

본 문서는 상품 상세페이지(PDP)에 표기되는 모든 안내 사항을 **[PART 1: 법적 의무 고지]**와 **[PART 2: 글로벌 판매율(전환율) 증대 고지]**로 명확히 분리하여 체계적으로 관리하기 위한 표준 운영 가이드입니다.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [ PART 1 ] ⚖️ 법적 의무 고지 (Legal Mandates)                           │
│   • 미고지 시 법률 위반, 세관 통관 보류, 카드사 분쟁(Chargeback) 패소    │
│   • 필수 5대 항목: 제조국, 소재 성분, 통화/가격, 배송기간, 반품규정    │
├────────────────────────────────────────────────────────────────────────┤
│ [ PART 2 ] 🚀 판매율(전환율) 증대 고지 (Conversion & Trust Boosters)   │
│   • 법적 강제는 아니지만 해외 직구 고객의 결제 불안(Friction)을 해소   │
│   • 핵심 5대 항목: 동적 도착일, 서울 직배송, 수공예 개체차,           │
│                    실측 치수(인치), 세탁관리법, 한지 선물 포장         │
│   (※ 국가별 상이한 관부가세 정책은 PDP에서 제외하고 글로벌 표준 유지)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

# [PART 1] ⚖️ 법적 의무 고지사항 (Mandatory Legal Compliance)
> **중요:** 아래 5가지 항목은 미국 법률(FTC/CBP) 및 결제사 가맹점 규정상 **결제 전 소비자가 반드시 확인할 수 있어야 하는 필수 법적 요건**입니다.

---

### ① 🇰🇷 제조국 및 원산지 표기 (Country of Origin)
* **법적 근거:** 미국 관세법 제304조 (19 U.S.C. § 1304) 및 FTC 무역 식별 규정
* **필수 이유:** 미국으로 수입·통관되는 모든 제품은 온라인 상품 페이지 및 실물에 제조국을 명시해야 함. (미고지 시 세관 통관 거부 대상)
* **표기 표준:** `Made in Korea` / `100% Made in Korea`
* **현재 상태:** ✅ 상단 구매 박스 및 룩북 헤더에 완벽 반영 완료.

---

### ② 🧵 섬유 혼용율 및 원자재 소재 표기 (Fiber & Material Content)
* **법적 근거:** 
  * 미국 섬유제품식별법 (Textile Fiber Products Identification Act - 16 CFR Part 303)
  * 미국 FTC 주얼리 및 귀금속 가이드 (16 CFR Part 23)
* **필수 이유:**
  * **가방, 파우치, 스크런치 등 섬유 제품:** 주 원단 섬유의 일반 명칭(Generic Name)을 사실대로 표기할 의무.
  * **키링, 노리개, 비녀 등 금속/원석 부속품:** 오해 소지가 없도록 정확한 소재(황동 합금, 천연 자개 등)를 사실대로 표기할 의무.
* **표기 템플릿:**
  * 가방/원단: `Material: 100% Cotton Canvas (or Silk Blend)`
  * 키링/액세서리: `Material: Natural Mother-of-Pearl, Brass Alloy, Silk Knot`
  * 패브릭 잡화: `Material: 100% Korean Cotton Fabric`

---

### ③ ⏱️ 예상 배송 및 발송 소요 기한 고지 (Delivery Timeframe)
* **법적 근거:** 미국 FTC 통신/인터넷 판매 배송 규칙 (16 CFR Part 435 - Mail Order Rule)
* **필수 이유:** 결제 시점으로부터 며칠 내에 발송되고 도착하는지 명시하지 않고 30일이 경과하면 판매자에게 전액 강제 환불 의무가 발생함.
* **표기 표준:** `Tracked shipping (7–14 business days)`
* **현재 상태:** ✅ 상단 혜택 바에 반영 완료.

---

### ④ 💵 결제 통화 및 최종 가격 명시 (Clear Pricing & Currency)
* **법적 근거:** 미국 FTC Act Section 5 (기만적 가격 표기 방지)
* **필수 이유:** 결제되는 정확한 통화(USD)와 상품 가격을 투명하게 고지할 의무.
* **표기 표준:** `$XX.XX USD`
* **현재 상태:** ✅ 상품명 하단 가격 영역에 완벽 반영 완료.

---

### ⑤ 🔄 반품 및 교환 조건 사전 고지 (Returns & Exchanges Terms)
* **법적 근거:** 미국 각 주 소비자보호법 및 Stripe/Shopify Payments 가맹점 규약
* **필수 이유:** 반품 가능 기한, 반품 배송비 부담 조건 등을 결제 전에 고지하지 않으면, 고객이 카드사에 분쟁(Chargeback) 제기 시 **판매자가 100% 패소하고 강제 환불 + 페널티 수수료($15)**를 부담하게 됨.
* **표준 고지 카피 (Etsy/글로벌 공인 표준):**
  > **Returns & exchanges accepted within 30 days**  
  > *Buyers are responsible for return shipping costs. If the item is not returned in its original condition, the buyer is responsible for any loss in value.*  
  > *(Items damaged in transit are 100% covered with free replacement or full refund.)*

---

# [PART 2] 🚀 판매율(전환율) 증대를 위한 전략적 신뢰 고지사항 (Conversion & Trust Boosters)
> **목적:** 법적 강제는 아니지만, 해외 직구 고객의 결제 불안(Friction)을 없애고 **구매 전환율(CRO)을 15% 이상 끌어올리는 세일즈 퍼널 전략 항목**입니다.

---

### ① 📅 동적 예상 수령일 표기 (Dynamic Estimated Delivery Window)
* **전략적 가치:** 단순히 "7~14일"보다 오늘 날짜 기준 도착 예정일(예: `Sep 6–13`)을 명확한 날짜 범위로 보여주어 고객의 배송 불안 90% 해소.
* **권장 카피:**
  > *"Order today to get by **[Estimated Date Range]** (Dispatched within 24–48 hrs from Seoul)"*

---

### ② ✈️ 서울 허브 직배송 및 실시간 송장 추적 (Direct Seoul Dispatch & Tracking)
* **전략적 가치:** 저가 중국산 드랍쉬핑(Temu, AliExpress)과 완벽히 차별화되는 **"한국 오리지널 장인 작품의 정통성(Authenticity)"**을 각인시키고 배송 분실 불안 해소.
* **권장 카피:**
  > *"Dispatched direct from Seoul Hub, South Korea · Real-time tracking number provided via email upon dispatch."*

---

### ③ 🌿 수공예 자연 개체차 사전 고지 (Handcrafted Natural Variations)
* **전략적 가치:** 천연 자개 결이나 손바느질 위치가 사진과 미세하게 다르다는 이유로 발생하는 **주관적 반품/환불 클레임을 원천 차단**하고, 세상에 단 하나뿐인 공예품의 가치로 승화.
* **권장 카피:**
  > *"Because each piece is individually handcrafted in Seoul ateliers, subtle natural variations in grain, stitching, and mother-of-pearl luminescence are natural hallmarks of authentic craftsmanship."*

---

### ④ 📏 실측 규격 인치(Inch) 병기 (Dimensions in Metric & Imperial)
* **전략적 가치:** 센티미터(cm)에 익숙하지 않은 미국 고객에게 인치(inch)를 함께 제공하여 **"생각보다 작다/크다"는 사이즈 오인 반품을 80% 이상 방어**.
* **표기 템플릿:** `Dimensions: 20cm x 15cm (7.8" x 5.9") · Strap: 12cm (4.7")`

---

### ⑤ 🧼 소재별 세탁 및 취급 주의사항 (Care Instructions)
* **전략적 가치:** 세탁기 사용으로 인한 원단 수축, 자개 손상 등 **소비자 과실에 의한 제품 손상 클레임 방어** 및 제품 수명 연장.
* **표기 템플릿:** `Care: Spot clean with damp cloth · Avoid prolonged water immersion for silk knots`

---

### ⑥ 🎁 정통 한지 선물 포장 안내 (Authentic Hanji Gift Packaging)
* **전략적 가치:** 고객의 60% 이상이 선물용(Gift)으로 구매하므로, **추가 포장 없이 바로 선물할 수 있는 프리미엄 패키징 가치**를 전달하여 객단가(AOV) 상승 유도.
* **권장 카피:**
  > *"Arrives carefully wrapped in traditional Korean Hanji paper with atelier seal, ready for gifting."*

---

# 📐 2026 최신 글로벌 D2C UI 배치 설계 (Etsy 표준 2단 클린 아코디언)

상세페이지 바이박스 하단에 **[Etsy 스타일 2단 드롭다운 아코디언 (Item details + Shipping & return policies)]**으로 구성하며, **DB에 없는 가짜 더미 텍스트(임의 소재, 임의 세탁법)는 일절 배제하고 100% 실데이터와 플랫폼 공식 정책만 수록**합니다.

```text
[ 바이박스 Add to Cart 버튼 바로 아래 ]

┌────────────────────────────────────────────────────────────────────────┐
│  ▼ 🌿 [Accordion 1] Item Details & Story (100% DB 실데이터 & 작가 스토리)│
│    • 🇰🇷 Origin: Made in Korea (공통 팩트)                               │
│    • 🏛️ Studio: [Shopify DB 실제 작가명 연동 및 작가 링크]              │
│    • 📜 Craft Story: [Shopify DB 실제 상세 본문(descriptionHtml)]      │
│                                                                        │
│  ▲ 📦 [Accordion 2] Shipping & return policies (플랫폼 공식 정책)       │
│    • 📅 Order today to get by Sep 6–13 (실시간 한국 발송 동적 계산)     │
│    • ✈️ Tracked Express Dispatch: Ships direct from South Korea         │
│    • 🇰🇷 Ships From: South Korea                                        │
│    • 🛡️ Returns & exchanges accepted within 30 days (점선 밑줄 팝오버)  │
│         └ [하단 플로팅 팝오버]: "Buyers are responsible for return      │
│            shipping costs. If the item is not returned in its original  │
│            condition, the buyer is responsible for any loss in value."  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 종합 요약 비교표

| 구분 | 고지 항목 | 성격 | 미고지 시 영향 |
| :--- | :--- | :---: | :--- |
| **PART 1** | **제조국 (Made in Korea)** | ⚖️ 법적 의무 | 세관 통관 거부 및 관세법 위반 |
| **PART 1** | **소재 성분 (Material/Fiber)** | ⚖️ 법적 의무 | FTC 섬유법 위반 및 성분 분쟁 패소 |
| **PART 1** | **배송 기간 (7–14 days)** | ⚖️ 법적 의무 | 30일 경과 시 전액 강제 환불 의무 |
| **PART 1** | **결제 통화 ($ USD Price)** | ⚖️ 법적 의무 | 기만적 가격 표기 위반 |
| **PART 1** | **반품 규정 (30-Day Returns)** | ⚖️ 법적 의무 | 카드사 Chargeback 분쟁 시 100% 패소 |
| **PART 2** | **동적 도착 예정일** | 🚀 전환율 증대 | 배송 일정 불안으로 인한 이탈 |
| **PART 2** | **서울 직배송 & 송장 추적** | 🚀 전환율 증대 | 저가 중국산 드랍쉬핑 오인 |
| **PART 2** | **수공예 개체차 안내** | 🚀 전환율 증대 | 미세한 결 차이로 인한 반품 요청 |
| **PART 2** | **실측 치수 (cm & inch)** | 🚀 전환율 증대 | 사이즈 오인 반품 증가 |
| **PART 2** | **세탁/보관 관리법** | 🚀 전환율 증대 | 소비자 과실 손상 클레임 발생 |
| **PART 2** | **한지 선물 포장 안내** | 🚀 전환율 증대 | 선물용 구매 기회 손실 |
