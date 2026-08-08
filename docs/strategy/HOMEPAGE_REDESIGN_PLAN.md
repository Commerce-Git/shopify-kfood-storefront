# 📋 Marketory 8대 마스터 단품 & 4대 번들 Multi-Add 홈페이지 전면 개편 계획서

본 문서는 **Marketory / Blank Seoul** 스토어프론트의 8대 순수 마스터 단품 및 1클릭 Multi-Add 4대 큐레이션 번들 구현을 위한 최종 계획서입니다.

---

## 🏛️ 4대 핵심 섹션 구조 및 컴포넌트 매핑

| # | 섹션 이름 | 컴포넌트 파일 | 주요 역할 및 상세 내용 |
|---|---|---|---|
| 1 | **Hero Banner** | `app/components/Hero.tsx` | 시네마틱 룩북 비주얼 + *"Artisan Heritage, Reimagined for Modern Life"* 슬로건 |
| 2 | **Curated Bundles** | `app/components/CuratedBundlesSection.tsx` | [신규] 4-Column 번들 카드 (Set A, Set B, Set C, Set D) + 1-Click Multi-Add 장바구니 담기 |
| 3 | **Masterpiece Gallery** | `app/components/MasterpieceGallerySection.tsx` | [신규] 순수 마스터 단품 8종 4-Column 그리드 + 호버 롤오버 이미지 애니메이션 + Quick Add |
| 4 | **Trust & Guarantee** | `app/components/TrustBar.tsx` | 3대 보증 배지 (100% Handcrafted / Express Global Shipping / Signature Gift Wrapping) |

---

## 🎁 4대 큐레이션 번들 세트 매핑 (Set A, Set B, Set C, Set D)

1. **Set A: Korean Heritage Pouch & Wallet Duo** ($59.00 / $8 할인)
   - 구성: `MIY-01` (다복백 파우치) + `BNK-01` (카드지갑) [2종 컴팩트 듀오]
2. **Set B: Heritage Charm & Keyring Trio Collection** ($72.00 / $8 할인)
   - 구성: `KMG-01` (갓 자개키링) + `DSN-01` (조랑이키링) + `SHM-01` (노리개키링) [3종 참 트리오]
3. **Set C: Joseon Classic Home & Beauty Duo** ($54.00 / $6 할인)
   - 구성: `GOM-01` (일월오봉 코스터) + `MET-01` (흑단 꽃비녀) [2종 홈&뷰티 듀오]
4. **Set D: Mini Bobusang Heritage Tote Combo** ($89.00 / $12 할인)
   - 구성: `HSR-01` (미니 보부상 한복가방) + `SHM-01` (노리개키링) + `BNK-01` (카드지갑) [3종 토트 풀세트]

---

## 🛠️ 개발 파일 및 변경 계획

- `lib/master-products.ts`: 8대 마스터 단품 및 4대 큐레이션 번들 모듈 정의
- `app/components/CartProvider.tsx`: `addBundleToCart` 배치 장바구니 담기 기능 추가
- `app/components/CuratedBundlesSection.tsx`: 4대 번들 1클릭 Multi-Add 컴포넌트 구축
- `app/components/MasterpieceGallerySection.tsx`: 8개 단품 4-Column 그리드 & 호버 롤오버 컴포넌트 구축
- `app/components/Hero.tsx`: Marketory 시네마틱 룩북 비주얼 및 슬로건 업데이트
- `app/components/TrustBar.tsx`: 3대 품질 보증 배지 업데이트
- `app/page.tsx`: 4대 섹션 레이아웃 조립
