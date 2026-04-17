# Seoul Snack Box — Sales Funnel Playbook v2.0

> Russell Brunson의 DotCom Secrets + Tripwire Funnel 프레임워크를
> **Seoul Snack Box** 브랜드에 최적화하여 적용한 마케팅 전략 문서입니다.

---

## 0. 경쟁사 분석 (Competitive Landscape)

| 경쟁사 | 가격대 | 특징 | 약점 |
|---|---|---|---|
| **Seoulbox** | $35~62 + 배송 $12 | K-Pop 굿즈 + 뷰티 + 스낵 혼합 | 스낵에 집중 X, 비쌈 |
| **SnackFever** | $37~40 | 스낵 전문, 브랜드 인지도 높음 | 디자인 올드, UX 평범 |
| **Korea Crate** | $35~40 | 한국 직배송 | 마케팅 퍼널 없음 |
| **MunchAddict** | $30~45 | 다국적 스낵 박스 | 한국 특화 아님 |
| **Bokksu** | $40~50 | 일본 스낵 (비교 대상) | 한국 아님, 고급감은 참고 |

### 우리의 차별점 (USP - Unique Selling Proposition)
1. **한국 직배송** — 미국 창고 재고가 아닌 서울에서 직배송 (신선도)
2. **Gen Z 트렌드** — 한인마트 스낵이 아닌 "지금 서울 편의점에서 유행하는" 스낵
3. **FDA 클리어** — 합법적 통관 (경쟁사 일부는 비공식 직구)
4. **One-Time 구매 가능** — 구독 압박 없음 (진입 장벽 ↓)

---

## 1. Value Ladder (가치 사다리)

```
                                 ┌──────────────────┐
                         $150    │ Premium Set      │ ← Back-End
                                 │ (명절 한정판)      │
                              ┌──┴──────────────────┴──┐
                      $89     │ K-Ramen Master Box     │ ← Middle
                              │ (라면 특화 대용량)       │
                           ┌──┴────────────────────────┴──┐
                   $39.99  │ Seoul Snack Box              │ ← Front-End (현재)
                           │ (10종 큐레이션 박스)           │
                        ┌──┴──────────────────────────────┴──┐
                 FREE   │ K-Snack Guide PDF                  │ ← Bait (Lead Magnet)
                        │ (이메일 수집용 무료 가이드)           │
                        └────────────────────────────────────┘
```

### 현재 집중: Front-End Offer ($39.99)
- 목표: 첫 구매자 확보 (고객 획득 비용 회수)
- 마진을 극대화하지 말고, **고객 데이터를 획보**하는 데 집중
- 이후 이메일/SMS로 Middle → Back-End 상품 제안

---

## 2. Tripwire Funnel 구조 (페이지 단위)

```
[광고/SNS] → [랜딩 페이지] → [체크아웃] → [OTO] → [Thank You]
              (현재 page)    (Shopify)   (미구현)   (미구현)
```

### Page 1: 랜딩 페이지 (현재 홈페이지 = 세일즈 페이지)

**트래픽 온도별 전략:**
| 온도 | 정의 | 랜딩 페이지 접근법 |
|---|---|---|
| 🔴 Cold | 브랜드를 모름 (광고 유입) | Hook + Story에 시간 투자. "왜 이 박스가 필요한지" 설득 |
| 🟡 Warm | 브랜드는 알지만 미구매 (SNS 팔로워) | Story 축약. Offer와 Social Proof에 집중 |
| 🟢 Hot | 구매 의도 있음 (리타겟팅) | Hook + Offer만. 바로 CTA |

→ 현재 Cold Traffic 기준으로 설계 (광고 유입 가정)

---

## 3. 섹션별 상세 설계 (Hook → Story → Offer)

### 📍 Section 1: Hero (Hook)

| 요소 | 현재 | 개선 방향 |
|---|---|---|
| **헤드라인** | "Stop Watching K-Dramas. Start Tasting Them." | ✅ 유지 (강력한 Pattern Interrupt) |
| **서브 카피** | 편의점 스낵 큐레이션 설명 | 결과 중심으로 변경: "10+ viral snacks. 1 curated box. 5 days to your door." |
| **CTA** | "Yes! Send Me The Snack Box 🎁" | ✅ 유지 (1인칭 행동 촉구) |
| **가격** | $39.99 표시 | ✅ 유지 (할인 강조와 함께) |
| **이미지** | 열린 박스 목업 | ✅ 유지 (상품 가시성 최우선) |
| **미싱** | — | 📌 **"As seen on TikTok" 배지** 또는 리뷰 수 표시 추가 |

### 📍 Section 2: Social Proof Bar (신규 추가 권장)

Hero 바로 아래에 **1줄짜리 신뢰 바** 삽입:
```
⭐⭐⭐⭐⭐ "Rated 4.9/5 by 500+ K-Snack lovers"  |  📦 "10,000+ boxes shipped"  |  🇺🇸 "Free US Shipping"
```
→ 별도 컴포넌트 `SocialProofBar.tsx` 생성

### 📍 Section 3: Epiphany Story

| 요소 | 현재 | 개선 방향 |
|---|---|---|
| **구조** | "We had a problem" 편지 형태 | ✅ 유지 |
| **길이** | 4단락 | 축약 가능 → Cold Traffic엔 유지, 향후 A/B 테스트 |
| **CTA** | 없음 | 📌 **스토리 끝에 미니 CTA 추가**: "Ready to taste Seoul? →" |

### 📍 Section 4: Product Showcase (Offer의 핵심)

현재 `ProductShowcase`를 **Value Stack** 구조로 강화:

```
┌─────────────────────────────────────────────┐
│  여기에 담긴 가치:                             │
│                                             │
│  ✅ 10+ trending Korean snacks    value: $25 │
│  ✅ Exclusive flavor guide        value: $10 │
│  ✅ Spicy level chart             value: $5  │
│  ✅ EMS shipping from Seoul       value: $15 │
│  ─────────────────────────────────────────── │
│  Total Value:              ~~$55~~           │
│  YOUR PRICE TODAY:         $39.99            │
│                                             │
│  [🎁 Yes! Claim My Seoul Snack Box]         │
│                                             │
│  💰 100% Money-Back Guarantee               │
│  🔒 Secure checkout powered by Shopify      │
└─────────────────────────────────────────────┘
```

### 📍 Section 5: What's Inside (구성품 시각화)

| 요소 | 현재 | 개선 방향 |
|---|---|---|
| **레이아웃** | 6개 카드 그리드 | ✅ 유지 (시각적으로 좋음) |
| **데이터** | 하드코딩 mock | 📌 실제 상품 기반으로 변경 필요 |
| **카피** | 개별 설명 | "이달의 박스 미리보기" 프레이밍으로 변경 |

### 📍 Section 6: Trust Badges

✅ 현재 적절. 변경 불필요.

### 📍 Section 7: Reviews (Social Proof)

| 요소 | 현재 | 개선 방향 |
|---|---|---|
| **제목** | "Loved by Snack Fans" | "Join 2,000+ Happy Snack Lovers" |
| **데이터** | Mock 리뷰 6개 | 📌 구매 후 실제 리뷰 수집 체계 필요 |
| **형태** | 텍스트 카드 | 📌 향후 UGC (고객 사진) 포맷 추가 |

### 📍 Section 8: FAQ (Objection Handling)

질문 내용을 **구매 저항 해소** 관점으로 재구성:
1. "배송 얼마나 걸려?" → 안심 (5-10일)
2. "관세 내야 해?" → 안심 (FDA 통관 완료)
3. "알레르기 있으면?" → 안심 (원료 목록 제공)
4. "마음에 안 들면?" → 안심 (환불 보장)
5. "구독이야?" → 안심 (ONE-TIME 구매)

### 📍 Section 9: Sticky Buy Bar

✅ 현재 적절. CTA 이미 "Claim My Box 🎁"로 변경 완료.

---

## 4. 향후 구현 로드맵 (우선순위)

### Phase 1 — 즉시 (현재 세션)
- [x] Hero 2-column 레이아웃 + 박스 이미지
- [x] Epiphany Story 섹션
- [x] CTA 1인칭 행동 촉구형 전환
- [ ] SocialProofBar 컴포넌트 추가
- [ ] ProductShowcase → Value Stack 스타일로 리디자인

### Phase 2 — shopify-git 연동 후
- [ ] Seoul Snack Box 상품 등록 (가격, 이미지, 설명)
- [ ] 실제 Shopify 상품 데이터로 fallback 교체
- [ ] 체크아웃 → Shopify 결제 플로우 테스트

### Phase 3 — 런칭 후 최적화
- [ ] Google Analytics / Hotjar 히트맵 설치
- [ ] 이메일 수집 (Lead Magnet: K-Snack Guide PDF)
- [ ] A/B 테스트: 헤드라인, CTA 버튼 색상, 가격 표시 방식
- [ ] OTO (One-Time Offer) 페이지 구현

---

## 5. 카피라이팅 스와이프 파일 (Swipe File)

### Headlines (Hook 후보)
1. "Stop Watching K-Dramas. Start Tasting Them." ← **현재 채택**
2. "Seoul's Convenience Store Snacks. Now at Your Door."
3. "The Snacks You Keep Seeing in K-Dramas? We Ship Them."
4. "10 Korean Snacks. 0 Korean Required."
5. "Your K-Drama Marathon Deserves Better Snacks."

### CTAs (행동 촉구 버튼)
1. "Yes! Send Me The Snack Box 🎁" ← **현재 Hero**
2. "Claim My Seoul Snack Box" ← **현재 Sticky Bar**
3. "Get My Box Before They're Gone"
4. "I Want to Taste Seoul!"
5. "Ship My Snacks Now →"

### Urgency/Scarcity 문구
1. "⏰ Only 47 boxes left this month"
2. "🔥 This month's box sells out by the 20th"
3. "📦 Next batch ships [날짜] — order by [날짜] to make it"

---

> 💡 **AI 주의사항**: 이 문서를 기반으로 컴포넌트를 설계할 때:
> 1. **"얼마나 예쁜가"보다 "얼마나 잘 팔리는가"를 최우선**
> 2. 모든 CTA는 **1인칭 행동 촉구형**
> 3. 네비게이션 링크로 사용자를 다른 페이지로 **빼지 마세요**
> 4. 가격은 항상 **할인 전 가격과 함께** 표시
> 5. 리스크 제거(환불 보증)를 **CTA 근처에** 배치
