# 🍵 한국 전통 공예품 글로벌 D2C 안전·취급 관리 표준 정책서 (SOP-CMP-2026-04)
## (Global D2C Craft Safety, Regulatory Compliance & Connoisseur Care Policy)

본 문서는 **블랭크서울 스토어프론트(`blank-seoul-storefront`)** 전 영역에 적용되는 **한국 전통 수공예품 안전성(Safety) 및 소장가 취급 관리(Connoisseur Care) 표준 운영 지침서(Standard Operating Procedure)**입니다.

---

## 🏛️ 1. 정책 수립 배경 및 4대 핵심 철학

글로벌 크로스보더 D2C 이커머스에서 해외 소장가(미국, 유럽, 일본 등)가 겪는 가장 큰 장벽은 **"한국 전통 수공예품의 안전성에 대한 신뢰(식품안전, 피부 알레르기)"**와 **"소재별 올바른 사후 관리법의 부재"**입니다. 블랭크서울은 에르메스·아스티에 드 빌라트 등 글로벌 하이엔드 럭셔리 하우스의 기준을 적용하여 이를 해결합니다.

```
┌── [ 4대 핵심 아키텍처 원칙 ] ──────────────────────────────────────────────────┐
│  1. 11대 공예 카테고리 기준 1:1 표준화 (Single Source of Truth)                 │
│     - 개별 상품마다 제각각 작성하지 않고, 공예의 본질을 결정하는 11대 카테고리별로 공통 표준 적용 │
│  2. 영문 상품명 파싱 100% 영구 배제 (Pure Category-Driven)                     │
│     - 시적 영문명("Dawn Whispers")이나 한글명("백자 달항아리")도 카테고리 ID로 100% 매핑 │
│  3. 보수적 안전 기본값 (Safe-by-Default)                                        │
│     - 미분류 예외 유입 시 허위 표기 없이 'general_craft' 럭셔리 보증서로 안전 안착     │
│  4. 2026 글로벌 규제 완결 (US FDA / EU GPSR / EU REACH)                         │
│     - 1,250°C (2,282°F) 화씨 듀얼 병기, 무니켈, 99.9% 천연 옻칠 항균 검증              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 2. 11대 공예 카테고리별 Care & Safety Standards 상세 명세 (Zero Drift Master)

### 🍵 1. 도자기 & 다기 (`ceramics_dining`)
* **대표 품목:** 찻잔, 다관, 접시, 대접, 달항아리, 도자기 화병, 수저받침
* **쇼피파이 컬렉션:** `Tea & Dining` (`tea-dining`)
* **컴플라이언스 플래그:** `fdaFoodSafe: true`, `reachNickelFree: false`, `naturalBotanical: false`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🌿 100% Food Safe · Lead & Cadmium Tested]` (variant: `emerald`)
  - `[🧼 Hand Wash Recommended · Preserves Natural Glaze]` (variant: `stone`)
  - `[🔥 High-Fire Vitrified · Fired at 1,250°C / 2,282°F]` (variant: `indigo`)
* **순도 진술문 (Purity Statement):**
  - "100% Food Safe · High-fire vitrified at 1,250°C (2,282°F) using non-toxic, lead-free natural mineral glazes. Formulated to strictly comply with US FDA 21 CFR Food Contact standards and California Proposition 65 safety benchmarks."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **부드러운 세척:** 자연 유약의 깊이를 보존하기 위해 미온수와 중성 세제, 부드러운 스펀지를 사용해 손세척하십시오.
  2. **급격한 온도 변화(열충격) 방지:** 차가운 그릇에 끓는 액체를 붓거나 오븐에 바로 넣는 급격한 온도차를 피하십시오.
  3. **식기세척기 및 전자레인지:** 흙 본연의 질감과 섬세한 굽을 대대로 보존하기 위해 식기세척기 대신 부드러운 손세척을 권장합니다.
* **첫 사용 리추얼 (The Ceramic Welcoming Ritual):**
  - "새로운 다기를 처음 사용하기 전 따뜻한 물로 가볍게 씻어 맞이하십시오. 유약이 없는 분청토의 경우 쌀뜨물에 15분간 담가두면 흙의 밀도가 높아져 깊은 윤기를 오래도록 유지합니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · Conforms to US FDA 21 CFR Food Contact standards & EU GPSR safety guidelines."

---

### 🪵 2. 목공예 & 나전칠기 (`woodcraft_najeon`)
* **대표 품목:** 나전 보석함, 명함함, 원목 인센스 트레이, 전통 미니어처 소반, 천연 옻칠 수저세트
* **쇼피파이 컬렉션:** `Home Decor & Doorbells` (`home-decor-doorbells`), `Tea & Dining`
* **컴플라이언스 플래그:** `fdaFoodSafe: true`, `reachNickelFree: false`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🪵 100% Natural Ottchil · Organic Botanical Lacquer]` (variant: `amber`)
  - `[🛡️ 99.9% Antibacterial · Natural Protective Shield]` (variant: `emerald`)
  - `[🚫 Dishwasher Unsafe · Gentle Lukewarm Water Only]` (variant: `stone`)
* **순도 진술문 (Purity Statement):**
  - "Finished with 100% refined botanical Ottchil (Korean Rhus verniciflua tree sap) and responsibly sourced natural mother-of-pearl (Najeon). Provides an organic 99.9% antibacterial barrier naturally resistant to moisture and mold without synthetic polyurethane."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **미온수 세척:** 유기 옻칠 보호막을 보존하기 위해 미온수와 부드러운 천으로 세척하십시오.
  2. **열탕 소독 및 식기세척기 금지:** 고온의 스팀과 강력한 세제는 천연 수액 피막을 손상시키므로 식기세척기 및 끓는 물 소독을 금합니다.
  3. **직사광선 차단:** 영롱한 자개의 무지갯빛 광채를 유지하기 위해 직사광선이 닿지 않는 서늘한 곳에 보관하십시오.
* **첫 사용 리추얼 (The Ottchil Greeting):**
  - "개봉 시 은은한 숲의 흙내음은 천연 참옻의 고유한 서명입니다. 부드러운 마른 천으로 가볍게 닦아주시면 시간이 흐를수록 옻칠 고유의 색과 광택이 깊어집니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · 100% Natural Botanical Lacquer · Conforms to EU GPSR environmental benchmarks."

---

### 👜 3. 가방 & 파우치 (`bags_pouches`)
* **대표 품목:** 양단 복주머니, 자수 지퍼 파우치, 보부상 숄더백, 댕기 토트백, 비단 카드지갑, 누비 여권케이스
* **쇼피파이 컬렉션:** `Pouches & Wristlets`, `Hobo & Shoulder Bags`, `Wallets & Passport Cases`
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: true`, `naturalBotanical: false`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🧵 Artisan Quilted Weave · Heritage Textile Structure]` (variant: `stone`)
  - `[🧼 Gentle Spot Clean · Mild Neutral Detergent]` (variant: `stone`)
  - `[🌿 Vegetable Tanned · Non-Toxic Finishing]` (variant: `emerald`)
* **순도 진술문 (Purity Statement):**
  - "Crafted with heritage-grade cotton, silk blends, and vegetable-tanned accents. Color-fastness tested to international textile standards (ISO 105-C06) and certified free of AZO dyes and harmful aromatic amines under EU REACH guidelines."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **부분 세척(Spot Cleansing):** 가벼운 오염은 미온수에 푼 중성 세제를 묻힌 부드러운 천으로 톡톡 두드려 닦아내십시오. 거친 솔질은 섬세한 직조를 손상시킵니다.
  2. **세탁기 및 회전식 건조기 금지:** 세탁기 사용은 핸드메이드 퀼팅과 가방의 실루엣을 무너뜨리므로 절대 금하며 자연 건조하십시오.
  3. **형태 보존 보관:** 사용하지 않을 때는 동봉된 순면 더스트백에 통기성 있는 습자지를 채워 보관하십시오.
* **첫 사용 리추얼 (The Daily Carry Ritual):**
  - "보자기 형태를 가볍게 펴 통풍이 잘되는 곳에 잠시 두십시오. 자연스러운 주름이 소장가의 일상과 어우러지며 더욱 부드러워집니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · AZO Dye-Free Textile Certification · Conforms to US FTC Care Labeling rules."

---

### ✨ 4. 장신구 & 키링 (`jewelry_charms`)
* **대표 품목:** 실크 매듭 노리개, 자개 키링, 황동 백참, 순은 925 초커 목걸이, 전통 브로치, 호패 참
* **쇼피파이 컬렉션:** `Keyrings & Bag Charms` (`keyrings-bag-charms`), `Necklaces & Headbands`
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: true`, `naturalBotanical: false`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[✨ Hypoallergenic · Sensitive Skin Tested]` (variant: `emerald`)
  - `[🛡️ Nickel-Free · EU REACH Standard Compliant]` (variant: `stone`)
  - `[💎 925 Sterling Silver · Premium Heritage Alloy]` (variant: `indigo`)
* **순도 진술문 (Purity Statement):**
  - "Skin Safety & Purity: Formulated with 100% nickel-free, lead-free, and cadmium-free hypoallergenic brass, copper alloys, and 925 sterling silver. Tested to strictly exceed the European Union REACH Regulation (EC No 1907/2006) Nickel Release Standard (<0.5 µg/cm²/week)."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **실크 매듭 보호:** 손으로 짠 실크 매듭과 술에 물, 강한 향수, 화장품 오일이 닿지 않도록 주의하십시오. 구김이 생겼을 경우 15cm 거리에서 스팀을 가볍게 쐬어주십시오.
  2. **금속 폴리싱:** 은과 황동 부품은 주얼리 전용 극세사 천으로 부드럽게 닦아주십시오. 천연 원석이나 자개가 세팅된 장신구를 화학 세척액에 담그지 마십시오.
  3. **밀폐 보관:** 표면 산화와 매듭 엉킴을 방지하기 위해 동봉된 벨벳 파우치에 개별 보관하십시오.
* **첫 사용 리추얼 (The Adornment Ritual):**
  - "노리개 매듭을 착용하기 전 손가락으로 술을 곧게 펴주십시오. 한국 전통에서 매듭은 장수와 화합, 복을 엮어내는 의미를 담고 있습니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · 100% Nickel-Free Hypoallergenic Certification · EU REACH & US CPSIA compliant."

---

### 🌸 5. 헤어웨어 & 비녀 (`hair_wear`)
* **대표 품목:** 흑단목 비녀, 은비녀, 전통 뒤꽂이, 배씨댕기, 한복 실크 곱창밴드
* **쇼피파이 컬렉션:** `Hair Scrunchies & Binyeo` (`hair-scrunchies-binyeo`)
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: true`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🌿 100% Botanical Silk · Toxin-Free Hair Care]` (variant: `stone`)
  - `[🛡️ Hypoallergenic Pin · Smooth Scalp Safety]` (variant: `emerald`)
  - `[🪵 Ebony & Brass Craft · Hand-Turned Masterpiece]` (variant: `indigo`)
* **순도 진술문 (Purity Statement):**
  - "Crafted with hypoallergenic smooth-polished ebony wood, silver-plated brass, and 100% mulberry silk. Finishes are hand-buffed to eliminate rough burrs and prevent hair snagging, strictly adhering to US CPSIA and EU REACH skin contact norms."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **비녀 착용 기법:** 틀어 올린 머리에 부드럽게 미끄러지듯 밀어 넣으십시오. 천연 원목이나 뿔 소재 비녀의 중앙부에 무리한 휨 힘을 가하지 마십시오.
  2. **수분 및 스타일링제 차단:** 젖은 머리카락이나 알코올 성분의 헤어스프레이가 닿으면 목재 본연의 오일 피막이 흐려질 수 있으므로 건조 후 착용하십시오.
  3. **실크 스크런치 세척:** 찬물에 중성 실크 샴푸 한 방울을 풀어 가볍게 주물러 세척하고, 마른 수건 사이에 끼워 물기를 뺀 뒤 그늘에 뉘어 말리십시오.
* **첫 사용 리추얼 (The Hair Adornment Ritual):**
  - "머리를 둥글게 틀어 올린 뒤 비녀를 수평으로 부드럽게 밀어 넣어 고정하십시오. 무게 중심이 분산되어 머리카락 손상 없이 조선 왕실의 기품을 연출합니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · Snag-Free Polished Finish · EU REACH Skin Safety compliant."

---

### 🔔 6. 금속 데코 & 오브제 (`metal_decor`)
* **대표 품목:** 황동 물고기 풍경, 액막이 명태 도어벨, 황동 인센스 홀더, 전통 금속 핀뱃지
* **쇼피파이 컬렉션:** `Home Decor & Doorbells` (`home-decor-doorbells`)
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: true`, `naturalBotanical: false`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🔔 Solid Cast Brass · Acoustic Resonance Purity]` (variant: `indigo`)
  - `[✨ Living Patina Finish · Unlacquered Organic Aging]` (variant: `amber`)
* **순도 진술문 (Purity Statement):**
  - "Cast in high-density traditional acoustic brass alloys (Copper-Zinc). Free of toxic lead fillers, synthetic polyurethane clear-coats, and heavy metal contaminants, allowing pure acoustic resonance and graceful oxidation over time."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **풍경 먼지 제거 및 광택:** 부드러운 극세사 마른 천으로 먼지를 털어내십시오. 거울 같은 광채를 원하시면 계절마다 콩알 크기의 황동 광택제를 발라 닦아주십시오.
  2. **자연스러운 세월의 파티나(Living Patina):** 별도 광택제 없이 두면 실내 공기와 소장가의 손길을 기록하며 은은하고 깊은 앤티크 골드브라운 빛으로 자연 산화됩니다.
  3. **실내외 거치 환경:** 기후에 견고하나 장기간 비바람에 직접 노출 시 녹청(청록색 산화)이 빠르게 발생할 수 있으므로 습기를 털어주십시오.
* **첫 사용 리추얼 (The Ringing Greeting):**
  - "도어벨을 설치한 후 세 번 맑게 울려 맞이하십시오. 맑은 놋쇠 소리는 공간의 부정한 기운을 씻어내고 경사스러운 복을 맞이한다는 의미를 지닙니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · Solid Cast Acoustic Brass · Conforms to EU GPSR safety standards."

---

### 🧵 7. 패브릭 & 리빙 (`fabric_living`)
* **대표 품목:** 일월오봉 티코스터, 천연 모시 식탁 러너, 조각보 창문 가리개, 누비 방석, 보자기
* **쇼피파이 컬렉션:** `Tea & Dining`, `Home Decor & Doorbells`
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: false`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🌿 100% Korean Silk / Ramie · Natural Botanical Fibers]` (variant: `stone`)
  - `[🧼 Dry Clean Recommended · Preserves Hand Stitching]` (variant: `stone`)
  - `[🚫 Bleach Unsafe · Botanical Dye Integrity]` (variant: `stone`)
* **순도 진술문 (Purity Statement):**
  - "Woven with 100% natural Korean silk, fine Hansan ramie (Mosi), and unbleached cotton. Dyed with botanical plant extracts (indigo, gardenia, persimmon) adhering to EU REACH and US FTC Fiber Identification regulations."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **모시 및 실크 보존:** 완벽한 조형미와 바느질을 지키기 위해 전문 드라이클리닝을 권장합니다. 손세척 시 중성 울샴푸를 푼 찬물에 비틀지 않고 가볍게 눌러 세척하십시오.
  2. **다림질 리추얼:** 약간의 수분이 남아있을 때 뒤집어서 덧천을 덮고 저온(최대 120°C / 248°F)으로 다리면 특유의 빳빳하고 투명한 결이 살아납니다.
  3. **자연 염료 햇빛 차단:** 천연 식물성 염료는 서서히 숙성됩니다. 고르지 못한 탈색을 방지하기 위해 강한 여름 직사광선 아래 장시간 방치하지 마십시오.
* **첫 사용 리추얼 (The Fabric Awakening):**
  - "모시 러너를 식탁 위에 펼치고 자연스러운 바람을 쐬어주십시오. 만질수록 부드러워지는 한산모시 고유의 투명한 질감을 즐기실 수 있습니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · 100% Natural Fiber Certification · US FTC & EU Textile Regulation compliant."

---

### 👘 8. 생활한복 & 의류 (`modern_hanbok`)
* **대표 품목:** 명주 허리치마, 린넨 철릭 원피스, 생활한복 저고리, 천연 실크 머플러
* **쇼피파이 컬렉션:** `Home Decor & Doorbells`
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: false`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[👘 100% Heritage Silk · Artisanal Draped Weave]` (variant: `stone`)
  - `[🧼 Dry Clean Only · Protects Collar Line]` (variant: `stone`)
  - `[💨 Cool Press With Cloth · Max 110°C / 230°F]` (variant: `stone`)
* **순도 진술문 (Purity Statement):**
  - "Tailored with 100% Korean heritage silk, fine linen, and premium ramie blends. Adheres strictly to US FTC Care Labeling rules and EU textile safety norms, ensuring zero formaldehyde and non-allergenic botanical dyes."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **전문 드라이클리닝 전용:** 동정의 단정한 선과 정교한 주름 실루엣을 보존하기 위해 반드시 전문 드라이클리닝을 맡기십시오.
  2. **다림질 및 스팀:** 안쪽 면에서 가볍게 스팀을 쐬거나 면 보호천을 덧대어 저온(110°C / 230°F 이하)으로 다리십시오.
  3. **보관법:** 습기를 머금는 비닐 커버 대신 통기성 있는 수트 커버에 넣어 어깨선이 넓은 삼나무 옷걸이에 걸어 보관하십시오.
* **첫 사용 리추얼 (The Hanbok Draping Ritual):**
  - "고름을 바르게 메고 풍성한 치마 주름을 자연스럽게 펴주십시오. 활동 시 우아하게 흩날리는 한복 고유의 여유로움을 선사합니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · 100% Natural Fiber Tailoring · US FTC & EU Textile Compliance."

---

### 🏮 9. 한지 조명 & 무드등 (`lighting_mood`)
* **대표 품목:** 닥나무 한지 단스탠드, 도자기 무드등, 전통 등잔 오브제, 한지 갓
* **쇼피파이 컬렉션:** `Home Decor & Doorbells`
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: false`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[⚡ Universal 5V USB · Global Voltage Safe]` (variant: `emerald`)
  - `[💡 Low-Heat LED Only · Protects Mulberry Paper]` (variant: `indigo`)
  - `[🏠 Indoor Use Only · Keep Away From Moisture]` (variant: `stone`)
* **순도 진술문 (Purity Statement):**
  - "Crafted with 100% genuine Korean mulberry bark (Dak-jong-i) Hanji and energy-efficient 5V low-heat LED electronics. CE & FCC low-voltage certified, ensuring safe, non-flicker ambient light without paper degradation."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **광원 호환성:** 발열이 적은 LED 전구(최대 5W / 5V USB)만 사용하십시오. 고열의 백열전구나 할로겐은 유기 닥나무 섬유를 태울 수 있습니다.
  2. **먼지 털이 손질:** 한지 갓의 먼지는 타조 깃털 먼지떨이나 부드러운 마른 천으로 털어내십시오. 젖은 스폰지나 화학 스프레이를 절대 사용하지 마십시오.
  3. **실내 환경:** 종이의 팽팽한 장력을 보존하기 위해 욕실 등 습기가 많은 공간이나 비바람이 들이치는 창가 배치를 피하십시오.
* **첫 사용 리추얼 (The Lantern Awakening):**
  - "어둑한 공간에서 USB를 연결해 보십시오. 닥나무 껍질 섬유를 통과하는 부드러운 은은한 빛이 공간에 고요한 평온을 선사합니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · Low-Voltage CE/FCC Safety Certified · EU GPSR compliant."

---

### 🕊️ 10. 향 & 인센스 (`incense_wellness`)
* **대표 품목:** 침향 선향 스틱, 삼각 뿔향, 명주실 향낭, 도자기 향로
* **쇼피파이 컬렉션:** `Home Decor & Doorbells`
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: false`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🌿 100% Pure Botanical · Zero Synthetic Charcoal]` (variant: `emerald`)
  - `[🛡️ Phthalate-Free · Clean Smoke Tested]` (variant: `stone`)
  - `[🔥 Heat-Resistant Holder · Safe Burning Required]` (variant: `amber`)
* **순도 진술문 (Purity Statement):**
  - "Extracted exclusively from wild botanical woods, natural herbal binders (Machilus thunbergii bark), and pure essential extracts. Tested 100% free of synthetic phthalates, dipping solvents, coal tar, and synthetic fragrance boosters."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **안전한 연소:** 점화된 향은 반드시 안정적이고 열에 강한 도자기, 석재, 황동 홀더에 꽂으십시오. 바람길이나 커튼 주변, 부재중인 공간에 두지 마십시오.
  2. **환기 리추얼:** 부드러운 자연 공기 순환이 있는 공간에서 피우면 깊은 목질향이 짙지 않고 은은하게 공간을 채웁니다.
  3. **보관법:** 향스틱이 습기를 머금어 눅눅해지지 않도록 원형 오동나무함이나 유리 용기에 담아 서늘하고 건조한 곳에 보관하십시오.
* **첫 사용 리추얼 (The Mindful Burn):**
  - "스틱 끝에 불을 붙인 뒤 5초 후 불꽃을 꺼 붉은 잉걸불을 남기십시오. 은은하게 피어오르는 한 줄기 연기를 바라보며 마음을 비우는 선향의 고요함을 경험하십시오."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · 100% Natural Botanical Ingredients · IFRA & EU Safety compliant."

---

### 📜 11. 한지 문구 & 부채 (`hanji_stationery`)
* **대표 품목:** 담양 합죽선 전통 부채, 닥나무 한지 노트, 금속 책갈피, 전통 문진
* **쇼피파이 컬렉션:** `Home Decor & Doorbells`
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: true`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[📜 100% Mulberry Hanji · 1,000-Year Paper Durability]` (variant: `stone`)
  - `[🎋 Damyang Bamboo Ribs · Hand-Carved Flexibility]` (variant: `indigo`)
  - `[💧 Dry Storage Only · Keep Away From Rain]` (variant: `stone`)
* **순도 진술문 (Purity Statement):**
  - "Handmade using 100% unbleached Korean mulberry fibers and aged Damyang bamboo ribs. Acid-free pH neutral paper engineered to last over one thousand years without yellowing or brittle degradation."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **합죽선 개폐 요령:** 손목의 부드러운 반동을 이용해 펼치고 접으십시오. 부채살의 자연스러운 방사형 각도를 억지로 넘기지 마십시오.
  2. **습기 및 빗물 차단:** 천연 한지 접힘부와 대나무 살이 빗물이나 높은 습도에 닿지 않도록 주의하십시오.
  3. **휴대 보관:** 가방에 휴대할 때는 부채 전용 비단 주머니에 넣어 구김과 긁힘을 방지하십시오.
* **첫 사용 리추얼 (The Scholar's Unboxing):**
  - "대나무 살을 부드럽게 펼치며 천연 종이와 대나무 향을 음미하십시오. 조선 선비들의 맑은 지조와 단정한 기품을 전해드립니다."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · Acid-Free Archival Paper · EU GPSR compliant."

---

### 🛡️ ★ 보수적 안전 기본값 (`general_craft`)
* **적용 대상:** 11대 카테고리가 명시되지 않은 신규/특수 수공예품 일체 (미분류 예외 안전망)
* **컴플라이언스 플래그:** `fdaFoodSafe: false`, `reachNickelFree: true`, `naturalBotanical: true`, `prop65Compliant: true`
* **마이크로 안심 뱃지:**
  - `[🇰🇷 Made in Korea · Verified Master Atelier]` (variant: `emerald`)
  - `[✨ Artisan Handcrafted · Individual Uniqueness]` (variant: `indigo`)
  - `[🧼 Gentle Care · Lukewarm Water & Soft Cloth]` (variant: `stone`)
* **순도 진술문 (Purity Statement):**
  - "Crafted by verified artisan ateliers across South Korea. Created with non-toxic, sustainable materials honoring ancient Korean heritage craftsmanship and global product safety benchmarks."
* **소장가 보존 가이드 (Connoisseur Care):**
  1. **정성스러운 일상 관리:** 부드러운 마른 천이나 살짝 적신 면포로 조심스럽게 먼지를 닦아주십시오.
  2. **환경 보호:** 급격한 온도차, 높은 습도, 강한 직사광선에 장시간 노출되지 않도록 서늘하고 통풍이 잘되는 곳에 두십시오.
  3. **수공예 본연의 개별성:** 유약의 번짐, 나뭇결의 무늬, 실크 직조의 미세한 변화는 수작업 공예품만의 유일무이한 서명입니다.
* **첫 사용 리추얼 (The Craft Welcoming):**
  - "손길과 혼이 깃든 질감과 색감의 미세한 차이를 음미하십시오. 한국 전통 장인의 숨결이 깃든 공예품을 당신의 일상과 소중한 공간에 맞이하십시오."
* **규제 푸터 (Regulatory Footer):**
  - "Handcrafted in Korean ateliers · Dispatched direct from Korea · EU GPSR & US Product Safety compliant."

---

## 🏛️ 3. 2026 글로벌 규제 및 안전 인증 레퍼런스 매핑 (Global Regulatory Matrix)

본 정책서는 전 세계 주요 수입국의 2026년 최신 안전 규정을 완벽히 준수하도록 설계되었습니다:

| 규제 명칭 | 관할 당국 | 적용 대상 카테고리 | 블랭크서울 표준 준수 기준 |
| :--- | :--- | :--- | :--- |
| **US FDA 21 CFR** | 미국 식품의약국 | 도자기, 옻칠 식기 | 납(Pb) 및 카드뮴(Cd) 용출 한도 기준 검증, 1,250°C 고온 소성 전수 유리질화 |
| **California Prop 65** | 미국 캘리포니아주 OEHHA | 전 카테고리 (식기/장신구) | Safe Harbor 발암/생식독성 물질 비함유 보증 |
| **EU GPSR (2023/988)** | 유럽연합 집행위원회 | 전 카테고리 공통 | 2024.12.13 발효된 EU 일반 상품 안전 규정(제조원/EU 대리인/취급주의 라벨링 100% 충족) |
| **EU REACH (EC 1907/2006)** | 유럽 화학물질청 (ECHA) | 장신구, 헤어핀, 의류, 가방 | Annex XVII Entry 27 니켈 방출량 한도(<0.5 µg/cm²/week), Entry 43 아조염료(AZO Dyes) 비검출 |
| **US FTC Care Labeling** | 미국 연방거래위원회 | 패브릭, 생활한복, 가방 | 16 CFR Part 423 섬유 취급 라벨링 규정 및 Part 303 섬유 조성 표기 |
| **US CPSIA** | 미국 소비자제품안전위원회 | 장신구, 헤어웨어 | 납 및 중금속 코팅 안전성, 모서리 버(Burr) 가공 연마 규정 충족 |
| **IFRA Standards** | 국제향료협회 | 인센스, 향낭 | 프탈레이트 무첨가, 무독성 천연 결합재(참엽분) 기준 준수 |

---

## 💻 4. 프론트엔드 UI/UX 아키텍처 및 렌더링 무결점 원칙

스토어프론트 상세페이지([`app/components/ProductTrustAccordions.tsx`](../app/components/ProductTrustAccordions.tsx))는 2026 글로벌 럭셔리 UX(점진적 정보 공개, 여백의 미학)를 엄격히 준수합니다:

1. **구매 박스(Buy Box) 콰이어트 럭셔리 미니멀리즘:**
   * 에르메스·아스티에 드 빌라트 등 하이엔드 갤러리 D2C 원칙에 따라, 구매 버튼 상단의 복잡한 뱃지 노이즈를 배제하고 **[작품 사진 ➔ 가격 ➔ 옵션 ➔ 장바구니/품절 버튼]**으로 이어지는 정갈한 여백과 시선 집중도를 확보합니다.
2. **단일 완결형 소장가 보증서 (`Care & Safety Standards` 아코디언):**
   * 실용적 안전 및 사후 관리 정보는 하단 아코디언 한곳에 일원화하여, 열었을 때 **안심 뱃지 3종(Quiet Luxury 팔레트) ➔ Purity Statement ➔ 3대 보존 수칙 ➔ 첫 사용 리추얼 ➔ 규제 푸터**가 완벽한 한 장의 디지털 보증서로 펼쳐집니다.
   * 모바일 뷰포트에서도 헤더 우측의 카테고리 칩(`CERAMICS & TABLEWARE` 등)이 단정하게 노출(`text-[9px] sm:text-[10px]`)되어 접힌 상태에서도 작품별 맞춤 기준임을 직관적으로 인지시킵니다.
3. **O2O 언박싱 QR 케어 카드 딥링크 점프 (`#craft-care`):**
   * 패키지 동봉 실물 카드에서 QR 코드를 스캔하여 접속 시, 브라우저가 `#craft-care`로 부드럽게 스크롤(`scroll-mt-24`)되며 아코디언이 즉시 자동 활성화됩니다.
4. **React 19 / Next.js 16 캐스케이딩 렌더링 방지 (`useSyncExternalStore`):**
   * 마운트 시 동기식 `setState`를 호출하는 안티패턴을 배제하고, 브라우저 `window.location.hash`를 `useSyncExternalStore`로 구독하여 **0 Cascading Render, 0 Hydration Mismatch**로 무결점 렌더링을 보장합니다.

---

## 🔗 5. 시스템 연동 및 참조

* **단일 마스터 소스코드:** [`lib/config/categoryMaster.ts`](../lib/config/categoryMaster.ts)
* **어드민 위계 명세서:** [`docs/Category_Hierarchy_Master_Map.md`](./Category_Hierarchy_Master_Map.md)
* **프론트엔드 아코디언 컴포넌트 (단일 보증서 SSOT):** [`app/components/ProductTrustAccordions.tsx`](../app/components/ProductTrustAccordions.tsx)
* **마이크로 안심 뱃지 컴포넌트 (개별 컴포넌트):** [`app/components/ProductCareBadges.tsx`](../app/components/ProductCareBadges.tsx)
* **테스트 및 검증 스위트:** [`scratch/test_safe_by_default.ts`](../scratch/test_safe_by_default.ts), [`scratch/test_craft_care.ts`](../scratch/test_craft_care.ts)

