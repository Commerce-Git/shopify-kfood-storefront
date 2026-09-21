# 🌐 Blank Seoul: SEO · AEO · GEO 통합 전략 & AI 상품 파이프라인 가이드 (2026 판)

본 문서는 한국 독립 공방 수공예품 D2C 헤드리스 커머스 **Blank Seoul**의 **검색 엔진 최적화(SEO)**, **답변 엔진 최적화(AEO)**, **생성형 AI 추천 최적화(GEO)** 전략과, 작가 입점 마찰을 0으로 유지하면서 플랫폼 AI 파이프라인을 통해 초고밀도 영문 상품 데이터를 자동 생성하는 공식 엔터프라이즈 운영 가이드라인을 정의합니다.

---

## 📌 1. 3대 디스커버리 프레임워크 비교

| 구분 | **SEO (Search Engine Optimization)** | **AEO (Answer Engine Optimization)** | **GEO (Generative Engine Optimization)** |
| :--- | :--- | :--- | :--- |
| **정의** | 구글/빙 등의 검색 결과(SERP) 상위 노출 | 질문 검색 시 **단 하나의 직답(Position 0)** 선정 | ChatGPT, Perplexity 등 **AI 답변 내 브랜드 추천 및 인용** |
| **타겟 플랫폼** | Google, Bing, Naver, Google Lens | Google Featured Snippets, Siri, Alexa | ChatGPT (Search), Perplexity, Gemini, Claude |
| **사용자 행동** | 검색 ➔ 링크 스캔 ➔ **클릭 방문** | 구체적 의문형 질문 ➔ **즉시 정답 확인 (Zero-Click)** | 복합적 추천 요청 ➔ **AI가 비교·추천한 제품 검토** |
| **핵심 성공 요인** | 키워드 매칭, 백링크, 기술적 SEO, JSON-LD | Q&A 구조, 40~50단어 단문 직답, 명확한 수치 | **엔티티 권위성, 정보 밀도(Information Density), 실사용 UGC** |
| **2026 최신 트렌드** | 구글 렌즈(Visual Search) 비중 25% 돌파 | 역피라미드 답변(BLUF) 구조화 필수 | 팩트 밀도(숫자/지명/기법) 기반 LLM 가중치 부여 |

---

## 🏛️ 2. 플랫폼 운영 철학: "공급자 마찰 제로(0-Friction) 원칙"

### 2.1. 작가에게 영어나 복잡한 스펙 작성을 요구하지 않는 이유
* **공급자 온보딩 이탈(Drop-off) 방지**: 한국의 전통 장인 및 독립 공예가들은 제작에만 몰두하는 분들로, 복잡한 영문 리스팅 양식을 요구하는 순간 입점을 포기합니다.
* **플랫폼의 핵심 가치 제안(Platform Moat)**:
  > *"선생님은 평소처럼 한글 제목, 사진, 가격, 무게만 1분 만에 등록해 주세요. 영문 브랜딩, 글로벌 SEO, 달러 결제, 미국 배송은 Blank Seoul이 100% 알아서 해드립니다."*

### 2.2. 20/80 스마트 듀얼 프레임워크
* **작가의 입력 (20%)**: 한글 상품명, 사진 1장, 무게, 가격, 카테고리 (최소 입력 유지)
* **플랫폼 AI의 자동 증폭 (80%)**: 플랫폼의 AI 비전 및 데이터 결합 파이프라인이 SEO/AEO/GEO에 완벽히 부합하는 4단 고밀도 영문 설명, Shopify Tags, Image Alt 텍스트를 일괄 자동 생성.

```text
[1. 작가 입력 (0-Friction)]
  한글 제목: "달항아리 백자 인센스 홀더"
  사진: 백자 달항아리 형태 오브제 사진 1장
  무게: 250g / 카테고리: 홈 & 세라믹
       ↓
[2. 플랫폼 AI 파이프라인 (Enrichment Engine)]
  • Vision AI: 썸네일 분석 (아이보리 화이트, 매트 무광 유약, 미니 달항아리 곡선 실루엣)
  • Category Master: 세라믹 취급 기준 자동 바인딩 (수세미 금지, 부드러운 천 세척)
  • Artist Master: 입점 작가 프로필(Soyo Studio)의 가마 철학 자동 인용
  • Legal Guardrail: 미검증 안전성 단정 금지 및 표준 관리 가이드 주입
       ↓
[3. 최종 생성된 고밀도 데이터 (Shopify DB 저장)]
  ① descriptionHtml: 4단 고밀도 설명 + 마이크로 Q&A 2문항
  ② shopifyTags: ["material:porcelain clay", "finish:matte white", "room:meditation"]
  ③ imageAlt: "Soyo Studio Handmade White Porcelain Incense Holder — Authentic Korean Craft"
```

---

## ⚖️ 3. 법적 리스크 방어 가드레일 (FDA / California Prop 65)

AI가 상품 설명을 작성할 때 가장 주의해야 할 점은 **입증되지 않은 안전성이나 소재의 환각(Hallucination)**입니다.

| 분류 | 대상 품목 | AI 작성 금지 사항 (Hallucination Risks) | AI 필수 표준 표현 (Safe Guardrails) |
|---|---|---|---|
| **식품 접촉 품목<br>(Food Contact)** | 찻잔, 다기, 접시, 볼, 숟가락 | • "100% Lead-free Food Safe"<br>• "FDA Certified Non-toxic"<br>(공식 시험성적서 없이 임의 단정 금지) | • *"Hand-crafted for tea rituals and mindful gatherings."*<br>• *"Gentle hand-wash with mild soap recommended."* |
| **비접촉 공예품<br>(Non-Contact)** | 인센스 홀더, 화병, 오브제, 키링 | • "Pure 24K Gold Plated" (금속 함량 허위 기재)<br>• "Hypoallergenic Nickel-free" | • *"Aesthetic interior object."*<br>• *"Finished with artisanal brass alloy hardware."* |

---

## ✍️ 4. 카피라이팅 품질: 안티-AI(Anti-AI Fluff) 스타일 가이드

구글의 헬프풀 컨텐트 알고리즘과 고급 AI 검색 엔진은 상투적인 'ChatGPT 전형적 미사여구'를 저품질 콘텐츠로 분류합니다. **해외 하이엔드 갤러리의 큐레이터 톤(Quiet Luxury Voice)**을 유지합니다.

* ❌ **절대 금지 어휘 (Banned Clichés)**:
  `delve into`, `testament to`, `tapestry of`, `symphony`, `nestled`, `elevate your space`, `embark on a journey`, `breathtaking masterpiece`
* ⭕ **권장하는 사실 중심 표현 (High-Density Factual Verbs)**:
  `hand-thrown on the wheel`, `fired at 1260°C`, `woven with traditional looms`, `finished with natural plant-based lacquer`, `inspected across 3 quality checkpoints in Seoul`

---

## 🤖 5. 어드민 AI 파이프라인 공식 프롬프트 (Enterprise JSON Spec)

어드민 일괄 덤프(`blank-seoul-admin/doc/filtered_dump/INPUT_GUIDE.md`) 또는 자동 생성 API에서 사용하는 공식 프롬프트입니다. **HTML 본문뿐만 아니라 스토어프론트 연동 태그(`tags`)와 시각 검색 Alt 텍스트(`imageAlt`)를 함께 출력**합니다:

```markdown
You are the Lead English Curator & Technical Commerce Specialist for Blank Seoul (blankseoul.com).
Transform minimal Korean artisan input into high-information-density, legally compliant data optimized for Google SEO, Answer Engines (AEO), and Generative AI (GEO).

### INPUT DATA:
- Korean Title: {{korean_title}}
- Category: {{category_name}}
- Weight: {{weight_grams}}g
- Product Image: {{image_url}}
- Artist Studio: {{artist_name_en}} (Discipline: {{artist_discipline}})

### COMPLIANCE & TONE RULES:
1. NO AI Clichés (Banned: delve, tapestry, testament, symphony, nestled, elevate, embark on a journey).
2. NO unverified dimensions or capacities (Do NOT invent cm, ml, or g unless provided in INPUT DATA; describe utility and form factor instead).
3. NO unverified medical or food-safe claims (Do NOT claim "FDA approved", "healing", or "lead-free" unless explicitly stated).
4. Always maintain a quiet, artisanal, museum-grade Quiet Luxury curation voice.

### OUTPUT SPECIFICATION (Valid JSON):
Return a single JSON object with the following keys:

{
  "title": "Clean, descriptive English product title (e.g., 'Joseon Silhouette White Porcelain Incense Holder')",
  "shopifyTags": [
    "material:extracted-raw-material",
    "finish:visual-texture",
    "usage:lifestyle-category"
  ],
  "imageAlt": "Descriptive visual alt text for Google Lens (e.g., '{{artist_name_en}} Handcrafted Ivory White Porcelain Incense Holder Made in Seoul')",
  "descriptionHtml": "<div class=\"artisan-product-story space-y-4\">\n  <div class=\"story-block\">\n    <h4 class=\"text-sm font-bold text-[#18181B]\">Visual Motif & Story</h4>\n    <p class=\"text-xs text-[#52525B] leading-relaxed\">[1-2 sentences on visual impression, heritage motif, and studio provenance]</p>\n  </div>\n  <div class=\"material-block\">\n    <h4 class=\"text-sm font-bold text-[#18181B]\">Craft & Material</h4>\n    <p class=\"text-xs text-[#52525B] leading-relaxed\">[1-2 sentences on tactile texture, authentic materials, and artisanal finish]</p>\n  </div>\n  <div class=\"usage-block\">\n    <h4 class=\"text-sm font-bold text-[#18181B]\">Styling & Life Match</h4>\n    <p class=\"text-xs text-[#52525B] leading-relaxed\">[1 sentence on practical styling, daily utility, or curated gifting context]</p>\n  </div>\n  <div class=\"faq-block pt-2 border-t border-[#E8DFC8]/60\">\n    <h4 class=\"text-sm font-bold text-[#18181B] mb-1.5\">Care & Longevity</h4>\n    <p class=\"text-xs text-[#52525B] leading-relaxed\">Gently wipe clean with a soft dry cloth. Store away from direct sunlight and moisture.</p>\n  </div>\n</div>"
}
```

---

## 🔄 6. 디스커버리-리뷰 플라이휠 연동 (`docs/review/` 시너지)

AI가 생성한 고밀도 팩트는 고객 리뷰 수집 전략([docs/review/REVIEW_COLLECTION_STRATEGY_2026.md](file:///Users/junseoha/Downloads/blank-seoul-storefront/docs/review/REVIEW_COLLECTION_STRATEGY_2026.md))과 결합되어 강력한 폐쇄형 신뢰 루프(Closed-Loop Trust Flywheel)를 형성합니다:

```text
[1. AI 파이프라인 (Claims)]
  초고밀도 팩트 생성 ("Hand-thrown coarse clay, 1260°C kiln, 250g")
       ↓
[2. 고객 실사용 & 리뷰 수집 (Proof)]
  배송 완료 5일 후 포토 UGC 수집 ("The texture is genuinely tactile and heavy in hand!")
       ↓
[3. Schema.org & GEO 피딩 (Synergy)]
  Product JSON-LD + Verified AggregateRating 결합
       ↓
[4. 구글 및 ChatGPT 추천 점유]
  • Google: 황금색 별점 리치 스니펫 독점 (CTR 35% 상승)
  • ChatGPT/Perplexity: "미국인 실구매자 검증 평점 4.9의 한국 장인 셀렉트숍" 1순위 추천
```

---

## 🛠️ 7. 스토어프론트 프론트엔드 테크니컬 체크리스트

1. **홈페이지 H1 태그 복원**: 라이브 모드에서도 메인 훅 H1(`<h1>Authentic Korean Craft & Lifestyle — Curated in Seoul</h1>`)을 보장하여 토픽 명확성 확보.
2. **동적 사이트맵 & 로봇 설정**: Next.js App Router 표준 `app/sitemap.ts` 및 `app/robots.ts` 구현으로 구글봇 크롤링 예산(Crawl Budget) 최적화.
3. **구조화 데이터(JSON-LD)**:
   - 메인 홈페이지: `Organization`, `WebSite`
   - 상품 상세 페이지: `Product`, `AggregateRating`, `MerchantReturnPolicy`
4. **시각 검색 최적화**: 상품 썸네일 이미지에 AI가 생성한 고유 `imageAlt` 속성을 바인딩하여 Google Lens 시각 검색 유입 극대화.
