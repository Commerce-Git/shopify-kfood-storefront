# 한국 제조·한국 출고 표현 검토 — 2026-10-03

**최신 상태: 사용자 후속 진행 요청에 따라 공통 문구와 기본 생성 경로를 로컬 코드에 적용했다.** §1–§8과 증거 JSON은 수정 전 조사 기록이다. 실제 적용 범위·검증·남은 작업은 [§9](#9-후속-구현-및-검증--2026-10-03)를 따른다. 배포와 기존 Shopify 데이터 변경은 수행하지 않았다.

## 1. 판정과 기준

**판정: 홈페이지와 연결된 구매 화면에 핸드메이드 중심 표현이 남아 있으며, 배포된 홈페이지에서도 확인했다.** 헤더·푸터·기본 메타데이터를 바꾼 것만으로 전체 브랜드 표현이 정리되지 않았다.

현재 사용자 결정은 한국에서 제조한 상품을 한국에서 출고하는 플랫폼이다. 핸드메이드는 모든 상품의 공통 속성 또는 입점 조건으로 홍보하지 않는다. 실제 수작업 상품은 존재할 수 있으므로, 개별 상품의 제조 방식에 근거가 있을 때만 상품 설명에서 해당 사실을 표현한다. 목표 원본의 D031을 따른다.

`artisan`, `craft`, `craftsmanship`, `studio`가 모두 핸드메이드라는 뜻은 아니다. 하지만 전체 입점자를 장인·공방으로 한정하거나 모든 상품이 수작업이라고 읽히는 문구는 현재 범위에 맞지 않는다. 실제 공급자의 이름·등록된 작가 정보·상품 고유 사실을 기계적으로 치환하지 않는다.

한국 제조와 한국 출고는 서로 다른 사실이다. 한국 브랜드·한국 디자인·한국 판매자라는 정보만으로 한국 제조가 증명되지는 않는다. 홈페이지 문구의 정합성과 상품 원산지 검증 완료도 구분한다.

## 2. 조사 범위와 증거

- 로컬 storefront: `dev` 브랜치, HEAD `10a4ba7`, 기존 미커밋 고객지원 변경을 포함한 작업 트리.
- `app/`, `lib/`의 TS/TSX/JS/JSX 153개 파일을 조사했다. page/layout/route/manifest 등의 진입점 51개에서 정적 import/export 연결도 추적했다.
- 수작업·장인 관련 검색 결과 133줄, 36개 파일. 이 수치는 주석·기본 ID·자산 이름까지 포함한 조사 후보 수이며, 133개의 화면 결함이라는 뜻이 아니다.
- 후보 파일 27개는 정적 진입점에서 도달 가능하고 9개는 연결이 발견되지 않았다. 모듈의 도달 가능성과 개별 문자열의 실제 사용 여부는 다르므로 아래에서 수동 구분했다.
- 실제 공개 HTML: [홈](https://blankseoul.com/), [preview 분기](https://blankseoul.com/?mode=preview), [live 분기](https://blankseoul.com/?mode=live), [작가 목록](https://blankseoul.com/artists) 모두 HTTP 200을 확인했다. script/style을 제외한 HTML 텍스트·이미지 alt와 메타데이터를 추출했다. 숨겨진 접근성 텍스트도 포함하며 브라우저의 시각적 노출 여부까지 자동 판정한 것은 아니다.
- 로컬 환경파일이 가리키는 Shopify Storefront 읽기 전용 조회: 운영 공개 상품 5개, 개발 공개 상품 1개. 상품 페이지네이션 끝까지 확인했다. 상품 제목·설명·상품 종류·vendor·tags 및 상품별 이미지 alt 최대 20개를 검사했다.
- 기본 OG 이미지 `public/assets/og-image.png`는 직접 시각 확인했다. 심볼 이미지이며 핸드메이드 텍스트가 보이지 않는다.
- [조사 증거 JSON](ORIGIN_COPY_AUDIT_EVIDENCE.json)에 전체 소스 후보, 공개 페이지 확인, 공개 상품 설명의 일치 구간을 보존했다. 환경변수 값과 자격증명은 포함하지 않는다.

공개 HTTP와 Shopify 조회는 데이터 변경 없이 수행했다. 개별 작가 Supabase 소개 전체, 비공개 상품·미등록 상품, 모든 이미지의 글자, 로그인 후 실제 화면, 배포된 모든 하위 페이지와 Admin 템플릿의 발송 결과는 전수 검증하지 않았다.

## 3. 현재 홈페이지에서 확인한 항목

| ID | 위치·근거 | 현재 문구·동작 | 판정 및 개선안 |
| --- | --- | --- | --- |
| H01 | [홈 배너](../../app/components/EtsyEditorialSplitBanner.tsx:74) | preview에서 `Every piece ... crafted by verified Korean artisans`, 양쪽 모드에서 `Verified Korean Workshops`·`master studios` | 전체 상품·공급자를 장인 공방으로 한정한다. `Products made in Korea, curated in Seoul and shipped directly from Korea.`를 기본 소개로 사용한다. 출시 전 배송 개시 안내는 별도로 유지한다. |
| H02 | [홈 카테고리 공급원](../../lib/config/collections.ts:30) → [홈의 선반 렌더링](../../app/page.tsx:48) | Bags & Pouches 소개 `Artisan handcrafted pouches...` | 운영 홈페이지에서 실제 노출 확인. `Bags, pouches and everyday carry, made in Korea.`처럼 제조 국가와 상품 유형으로 바꿀 대상이다. |
| H03 | [장신구 소개](../../lib/config/collections.ts:43) | `hand-woven silk Daenggi knots` | 운영 홈페이지에서 실제 노출 확인. 카테고리 전체의 제조 방식·소재를 미리 확정한다. 범용 소개는 `Jewelry, charms and accessories made in Korea.`를 제안한다. 실제 직조 여부·실크 소재는 개별 상품 정보로 설명한다. |
| H04 | [홈 작가 영역](../../app/components/AtelierSpotlight.tsx:42) | `Meet the Korean Masters`, `authentic Korean craft collection` | 직접 handmade 보장은 아니지만 장인 전용 플랫폼 인상을 강화한다. `Meet Our Korean Makers & Brands` 등으로 제조사·디자이너·작가를 포괄하는 표현을 제안한다. 내부 컴포넌트 이름과 작가 URL 변경은 필요하지 않다. |
| H05 | [홈 접근성 제목](../../app/page.tsx:40) | `Authentic Korean Craft & Modern Lifestyle` | 숨겨진 H1도 브랜드 범위를 공예 중심으로 좁힌다. `Products Made in Korea, Shipped from Korea` 등으로 기준을 맞출 대상이다. |
| H06 | [공통 카테고리 데이터](../../lib/config/collections.ts:197) | wear 소개 `handcrafted daily carry`, ritual 편집 소개 `hand-forged brass bells`, 기본 vendor `Korean Master Artisan` | 슈퍼 카테고리 화면·메타데이터 및 vendor 없는 상품 카드로 전파된다. 특정 공정과 장인 자격을 기본값으로 만들어 내지 않도록 변경할 대상이다. 실제 노출은 카테고리·상품 유무에 따라 달라진다. |

홈의 선반 소개는 관련 상품이 한 개 이상일 때 표시된다. 현재 보이지 않는 카테고리도 상품 등록 후 같은 문제가 발생할 수 있다.

## 4. 구매 화면·검색 정보·사후 화면

| ID | 위치·근거 | 발견 사항 | 영향·제안 |
| --- | --- | --- | --- |
| P01 | [카테고리별 기본 안내](../../lib/config/categoryMaster.ts:160), [상품 관리 안내 렌더러](../../app/components/ProductTrustAccordions.tsx:449) | 11개 카테고리와 일반 기본값, 총 12개 `regulatoryFooter`가 모두 `Handcrafted in Korean ateliers`로 시작 | **우선 수정 대상.** 상품별 제조 방식 확인 없이 상품 상세에 수작업 안내가 붙는다. 분류별 관리법과 제조 방식·인증 사실을 분리한다. |
| P02 | [일반 상품 기본값](../../lib/config/categoryMaster.ts:883) | `Authentic Korean Handcrafted Goods`, `Artisan Handcrafted` 배지, `human hands` 이야기 | 분류가 없을수록 가장 강한 수작업 보장이 붙는다. 제조 방식 불명인 가상 상품으로 함수를 실행해 같은 기본값 반환을 재현했다. 범용 상품·보수적인 관리 안내로 교체할 대상이다. |
| P03 | [카테고리별 상세 문구](../../lib/config/categoryMaster.ts:296) | handmade quilting, hand-woven silk, hand-carved, hand stitching 등 | 카테고리만으로 공정·소재를 일괄 확정한다. 제조 방식은 개별 정보로 제한하고 관리법은 실제 소재·제품 특성에 맞출 필요가 있다. |
| P04 | [추천 API](../../app/api/cart-companions/route.ts:108), [장바구니 추천 영역](../../app/cart/_components/CartUpsellShelf.tsx:78) | API가 `Handcrafted companion piece...`를 만들고 화면도 `Handcrafted companion pieces...`로 소개 | 추천 제품이 모두 수작업이라는 근거가 없다. API 응답과 화면 문구 양쪽을 바꿔야 재발을 막을 수 있다. 같은 작가의 관련 상품이라는 확인 가능한 관계만 설명한다. API pitch의 실제 표시 여부와 별개로 응답에 남아 있다. |
| P05 | [위시리스트 검색 설명](../../app/wishlist/layout.tsx:6), [위시리스트 화면](../../app/wishlist/page.tsx:230) | `Korean handcrafted pieces`, `Korean artisan pieces`, `master craft collections` | 저장된 상품 전체에 수작업·장인 속성을 부여한다. 한국 제조 상품을 저장·팔로우하는 기능으로 설명을 통일한다. |
| P06 | [작가 목록](../../app/artists/page.tsx:23), [작가 상세 검색 설명](../../app/artists/[slug]/page.tsx:30), [기본 프로필](../../lib/artists.ts:128) | `The Korean Artisan Collective`, `Master Craft Guild`, `artisan works`, 비어 있는 소개에 master studio / artisan studio 생성 | 공통 문구·SEO·정보 부족 시 대체 소개까지 함께 검토해야 한다. 실제 DB의 작가 자기소개는 확인된 사실에 따라 판단한다. |
| P07 | [상품 JSON-LD](../../app/product/[handle]/page.tsx:109) | productType 누락 시 `Artisanal Home & Living` | 상품 구조화 데이터에도 공예형 속성이 기본 주입된다. 중립적인 상품 분류를 쓰거나 정보 부족 시 해당 속성을 생략하는 방법을 제안한다. |
| P08 | [FAQ](../../app/components/FAQ.tsx:94), [이용약관](../../app/policies/terms/page.tsx:64), [배송정책](../../app/policies/shipping/page.tsx:62), [반품정책](../../app/policies/returns/page.tsx:112) | hand-finished brass, artisanal craftsmanship, artisan accessories·packaging 등 | 상품 유형을 한정한 설명인지 전체 규칙인지 구분해야 한다. hand-finished는 해당 상품 근거가 있을 때만 쓰며 제조 방식과 무관한 배송·반품 책임은 유지한다. 이번 검토는 정책의 법적 적합성 검증이 아니다. |
| P09 | [주문 조회 화면](../../app/order-lookup/page.tsx:339), [고객용 단계 바](../../app/components/OrderStatusBar.tsx:10), [상태 매핑](../../lib/shopify/order-utils.ts:24) | `master artisans`, `Your Korean artisan box...`, `Live Crafting & Delivery Status`, `Crafting` | 제작 대기·상품 준비를 모두 수작업으로 해석하는 인상이다. 고객 표시 문구를 `Preparing` 등으로 바꾸는 것을 제안한다. 내부 status `crafting`은 데이터 계약이므로 단순 문구 정리로 변경하지 않는다. |
| P10 | [수신거부 화면](../../app/unsubscribe/page.tsx:116), [작가 알림 기본값](../../app/api/artists/broadcast/route.ts:79) | `Korean artisan drops`, `Artisan Studio` | 구매 후 안내·알림에서도 범위가 다시 좁아진다. 중립적인 새 상품·브랜드/작가 표현으로 검토할 대상이다. |
| P11 | [상품 미리보기 기본값](../../lib/shopify/preview-adapter.ts:22) | `Korean Traditional Artisan Craft`, `Korean Handicraft ... master artisans`, `Master Artisan` | 미리보기에서 실제 정보가 없어도 장인·수공예 속성을 생성한다. `Product Preview`, 중립적인 공급자 기본값 등을 제안한다. 실제로 입력된 상품 사실과 기본값은 구분한다. |

`ProductCareBadges.tsx` 역시 categoryMaster를 소비하지만 이번 정적 그래프에서는 외부 사용 연결을 찾지 못했다. 현재 상품 상세의 확인된 렌더링 경로는 `ProductInteractive → ProductTrustAccordions → getCategoryCareStandards`다.

## 5. 이미 기준에 가까운 항목과 별도 판단

- [루트 메타데이터](../../app/layout.tsx:42): 제목·검색 설명·Open Graph·Twitter는 Made in Korea 및 direct dispatch를 중심으로 작성돼 있다. 실제 운영 홈 HTML의 기본 메타데이터에서도 이를 확인했다.
- [푸터](../../app/components/Footer.tsx:109): 한국 국내 브랜드·디자인 스튜디오와 한국 제조·한국 출고를 설명한다.
- [헤더](../../app/components/Header.tsx:177): Made in Korea 문구와 한국 제조 상품 검색 안내가 있다. artisan 관련 검색 결과는 여기서는 주석이므로 화면 결함으로 계산하지 않는다.
- [전체 상품 목록](../../app/collections/page.tsx:7): Made in Korea 중심이다.
- [소개 페이지](../../app/about/page.tsx:23): 한국 제조·한국 출고 중심이며 `craftsmanship`은 품질·마감이라는 의미로도 쓰일 수 있다. 이를 자동으로 handmade로 판정하지 않는다. 다만 designed in Korea, certified, 모든 상품 검사 등의 별도 보장이 실제 확인 범위를 넘는지는 후속 검토 항목이다.
- 이미지 파일 이름의 `artisan`·`craft`, 컴포넌트 이름, 상태 코드, 작가 이름은 고객에게 보이는 홍보 문구와 다르다. 이름 변경과 URL·식별자 마이그레이션을 문구 정리에 포함할 필요는 없다.
- [manifest](../../app/manifest.ts:8)에는 보류된 K-Food가 아직 남아 있다. 수작업 표현과 다른 항목이지만 현재 상품 범위의 일관성 검토에서 함께 발견했다.

## 6. 과거 컴포넌트 — 현재 사용 연결 미발견

다음 파일은 import/export 정적 그래프상 현재 진입점에서 연결을 찾지 못했다. 실제 홈페이지에 모두 표시되는 것으로 보고하지 않는다. 재사용 시 과거 문구가 복원되지 않도록 별도 정리 대상으로 기록한다.

| 파일 | 남아 있는 문구 |
| --- | --- |
| [EtsyHeroBanner](../../app/components/EtsyHeroBanner.tsx:27) | `Every single piece is personally handmade...` |
| [HowItWorks](../../app/components/HowItWorks.tsx:25) | `No factories, no mass production.` |
| [PlatformHero](../../app/components/PlatformHero.tsx:54) | `handcrafted treasures`, personally handmade |
| [ArtisanSpotlight](../../app/components/ArtisanSpotlight.tsx:25) | `Individually handcrafted with care` |
| [Hero](../../app/components/Hero.tsx:104) | `AUTHENTIC HANDCRAFTED MASTERPIECES` |
| [BrandStory](../../app/components/BrandStory.tsx:45) | `We are not a factory`, 모든 상품을 independent artisans 제작으로 설명 |
| [NewsletterCTA](../../app/components/NewsletterCTA.tsx:68) | `new handcrafted collections` |
| [ArtisanRecruitmentCTA](../../app/components/ArtisanRecruitmentCTA.tsx:25) | Korean Heritage Artisan 전용 모집 |
| [PlatformHeroBanners](../../app/components/PlatformHeroBanners.tsx:26) | 특정 아틀리에·장인 강조. 현재 연결 미발견 |

정적 추적은 일반 import/export 연결을 확인한 것이다. 전체 미사용 코드 제거 판정이나 동적 로딩의 완전 검증은 아니다.

## 7. Shopify 데이터와 Admin 생성 경로

### 7.1 실제 공개 상품 설명

| 조회 환경 | 공개 상품 수 | 일치한 상품 설명 | 판단 |
| --- | --- | --- | --- |
| 운영 | 5 | `maedeup-knot-jade-bag-charm`: hand-woven, Handcrafted | 개별 상품 사실이라면 허용 가능하다. 제조 공정 근거는 별도로 확인해야 하며 플랫폼 전체 특성으로 확장하지 않는다. |
| 운영 | 5 | `celadon-bamboo-handle-teaware-set`: artisanal | artisan이라는 표현만으로 수작업 확정은 아니다. 상품 제작 근거와 문맥으로 판단한다. |
| 개발 | 1 | `jade-norigae-knot-bag-charm`: hand-knotted, artisanal | 테스트 상품에도 해당 표현이 있다. 실제 작가 입력인지 자동 생성인지와 근거를 확인할 대상이다. |

상품의 `description`은 SEO·JSON-LD에 사용되고 `descriptionHtml`은 상품 상세에 표시된다. 코드의 고정 문구만 바꾸어도 기존 외부 상품 설명은 그대로 남을 수 있다. 이번 실제 조회는 description을 검사했으며 HTML 원문 내 모든 속성까지 검사하지 않았다.

### 7.2 Admin이 다시 생성할 수 있는 문구

- [상품 게시 기본 설명](../../../blank-seoul-admin/lib/shopify/publishProduct.ts:229): 영문 설명이 없으면 `Authentic Korean Handicraft...`를 생성한다. storefront만 고치면 신규 상품에서 재발할 수 있는 경로다.
- [상담 답변 생성기](../../../blank-seoul-admin/lib/inquiries/replySynthesizer.ts:24): `standard handcrafted editions`, `individually handcrafted`, 배송 안내의 `Your handcrafted pieces`와 준비 중 안내의 `being handcrafted`를 자동 문장에 포함한다. 모든 상품에 맞는지 확인·보완해야 한다. 실제 고객 발송은 수행하지 않았다.
- [컬렉션 재편 API](../../../blank-seoul-admin/app/api/admin/reorganize-collections/route.ts:73): `all ... Korean handcrafted masterpieces`를 컬렉션 설명에 생성하는 코드가 있다. 현재 실행 여부와 기존 Shopify 컬렉션 설명은 확인하지 않았다.
- 분류용 AI 프롬프트, 샘플 상품, 통관명 기본값에도 handicraft 표현이 있다. 분류·통관 계약 변경까지 이번 공개 문구 검토로 자동 실행하지 않는다.

Admin은 관련 생성 경로만 읽기 검토했으며 전수 분석·수정·배포를 하지 않았다.

## 8. 적용 우선순위와 완료 기준

| 순서 | 변경 묶음 | 완료 기준 |
| --- | --- | --- |
| 1 | 홈페이지 배너·카테고리 소개·작가 영역·H1 | preview/live·모바일/데스크톱과 메타데이터가 한국 제조·한국 출고라는 동일 기준을 설명 |
| 2 | 상품 categoryMaster·일반 기본값·장바구니 추천 | 제조 방식 미상인 상품에 handmade 배지·이야기·추천 pitch가 자동 부여되지 않음 |
| 3 | 위시리스트·작가·주문·FAQ·정책·미리보기·알림 | 상품 고유 정보와 공통 홍보를 구분하고 내부 상태·작가 ID·URL 계약을 보존 |
| 4 | Admin 게시·상담 생성 및 기존 외부 데이터 | 신규 상품·답변에 기본 수작업 주장이 재생성되지 않고, 기존 설명은 상품별 근거로 검토 |
| 5 | 과거 컴포넌트 | 다시 사용해도 모든 상품 handmade·공장 제외 문구가 복원되지 않음 |

권장 공통 소개: **Made in Korea. Shipped from Korea.** 설명 예시: **Explore products made in Korea, curated in Seoul and shipped directly from Korea.** 이 문구는 사용자 결정에 맞춘 제안이며 소비자 반응이나 전환율을 검증한 결과는 아니다.

`Verified`, 인증·무독성·소재 보장, 보험 배송, 특정 지역 제조·출고, 모든 상품 국내 디자인은 각각 독립된 근거가 필요하다. 한국 제조·한국 출고라는 확정 방향만으로 이 추가 보장까지 새로 확정하지 않는다.

초기 검토는 조사·문서화였다. 당시 화면 문구·상품 데이터·템플릿·환경변수·운영 DB는 수정하지 않았고 앱 검사도 재실행하지 않았다. 보고서의 링크·소스 근거와 기본값 실제 반환·공개 HTML·공개 카탈로그를 검증했다. 아래 후속 구현 기록과 구분한다.

## 9. 후속 구현 및 검증 — 2026-10-03

사용자의 후속 `진행해줘` 요청으로 D031을 적용했다. Codex 직접 작업이며 Gemini 자동 파이프라인 실행 결과가 아니다.

### 적용한 범위

- **홈·탐색:** preview/live 배너, 숨겨진 H1, 카테고리 소개, 헤더·탐색 링크·작가 목록/상세를 한국 제조·한국 출고 중심으로 정리했다. 공급자 공통 호칭은 `Makers & Brands`로 넓혔다. 작가의 실제 이름·DB 자기소개는 보존했다.
- **상품·구매:** categoryMaster 12개 공통 footer의 handcrafted를 제거했다. 분류되지 않은 상품의 handmade 배지·수작업 이야기·자동 인증 추정을 제거하고 한국 제조/한국 출고·상품별 관리 안내로 바꿨다. 카테고리 ID와 분류 로직은 유지했다. 장바구니 추천·위시리스트·상품 JSON-LD 기본 분류·미리보기 기본 설명도 정리했다.
- **고객 안내:** FAQ·배송/반품/약관의 공급자·제조 방식 표현을 조정했다. 고객 주문 표시 `Crafting`은 `Preparing`으로 바꾸고 내부 상태 값 `crafting`은 유지했다. 고객지원 작가 맥락 표시는 `Maker / Brand`로 바꿨다.
- **이메일:** ArtistDropEmail의 `100% Handcrafted`, 장인 인증서·특정 가마 생산량·일괄 사은품 등 실제 상품 입력과 무관한 기본 주장을 제거했다. 한국 제조·한국 출고와 상품 페이지 확인 안내로 교체했다. 리뷰 요청 이메일의 공통 artisan 표현도 정리했다. ArtistDropEmail 실제 렌더링에서 발견한 기존 Tailwind/Head 구조 오류를 고쳐 HTML 생성을 확인했다. 수신거부 링크와 뉴스레터 EmailConsentNotice를 유지했다.
- **Admin 재생성 방지:** [상품 게시 기본값](../../../blank-seoul-admin/lib/shopify/publishProduct.ts), [작가 상품 미리보기](../../../blank-seoul-admin/app/artist/dashboard/components/StorePreviewModal.tsx), [영문 상담 합성](../../../blank-seoul-admin/lib/inquiries/replySynthesizer.ts), [빠른 상담 답변](../../../blank-seoul-admin/app/manage/inquiries/components/InquiryActionComposer.tsx), [컬렉션 설명 생성](../../../blank-seoul-admin/app/api/admin/reorganize-collections/route.ts), [상품 분류 프롬프트](../../../blank-seoul-admin/app/api/manage/auto-categorize/route.ts)를 정리했다. 분류 프롬프트는 상품 유형·제공된 사실을 사용하도록 했다. 해당 API 실행이나 고객 발송은 하지 않았다.
- **과거 컴포넌트:** 사용 연결이 확인되지 않았던 배너·브랜드 소개·모집 등에서도 모든 상품 handmade·공장 제외 문구를 제거했다. manifest의 과거 K-Food 설명을 현재 사업 방향으로 바꿨다.

### 검증 결과

| 확인 | 결과·한계 |
| --- | --- |
| 양쪽 `npm run typecheck` | 통과 |
| Storefront `npm run test:unit` | 28/28 통과. 기존 미리보기 기본 제목 기대값 갱신 |
| Admin 관련 단위 시험 | `inquiry-hub-and-spoke`, `shopify-publications`, `inquiry-ui` 총 34/34 통과. 전체 Admin 시험 실행 결과는 아님 |
| 변경한 Storefront 파일 ESLint | 47개 파일, 오류 0·경고 12. 기존 이미지/미사용 변수 경고 포함 |
| Storefront 전체 ESLint | 기존 `tests/unit/environment-routes.test.ts:8`의 `no-explicit-any` 오류 1·경고 25로 실패. 해당 파일은 작업 시작 기준 SHA256과 같으며 이번에 수정하지 않음 |
| 실제 기본값 실행 | 12개 category care의 고객 표시 문구에 수작업 기본 주장이 없고, 미분류 상품의 인증 플래그가 모두 false임을 확인. 미리보기 기본값 3종과 명시적으로 입력된 handmade 상품 설명 보존 확인. 내부 배지 ID는 문구 검사에서 제외 |
| 이메일 HTML 생성 | ArtistDropEmail 실제 렌더링 통과. 한국 제조/출고 안내·수신거부 링크와 수작업·가마 수량·장인 인증 기본 주장 제거 확인 |
| 로컬 Chrome 화면 | `localhost:3001`, 1440×1000 및 390×844, preview/live 총 4조합 HTTP 200. 공통 handmade 문구 없음·가로 넘침 없음·pageerror 없음. 두 화면 캡처도 직접 확인. 새 브라우저 컨텍스트에서 GET 이외와 외부 브라우저 요청을 차단했으며 서버의 카탈로그 읽기는 기존 로컬 환경 사용 |
| 변경 보존·형식 | 작업 전 app/lib/tests 사본과 변경분 대조. 기존 고객지원·Admin 재고/공개 코드 변경 보존. 양쪽 `git diff --check` 통과 |

이번 문구 작업에서 전체 배포 빌드, 모든 하위 페이지의 모바일/로그인 E2E, 실제 이메일 발송은 실행하지 않았다. 로컬 홈페이지 검증을 운영 배포 확인으로 취급하지 않는다.

### 남은 작업과 운영 기준

1. 사용자 Git push 및 양쪽 앱 배포 후 실제 홈·상품 상세·작가 소개·이메일을 확인한다. 로컬 소스 변경으로 기존 배포가 갱신되지는 않는다.
2. §7.1의 기존 Shopify 상품 설명, DB 작가 소개·이미지 속 텍스트는 개별 제조 사실을 확인해 유지/수정한다. 플랫폼 전체를 handmade로 소개하는 문구와 실제 수작업 상품의 사실 표기를 구분한다. 원격 상품/작가 데이터는 이번에 변경하지 않았다.
3. `artisan`이 포함된 식별자·파일명·자산명·실제 업체명과 손세탁(`hand wash`) 안내는 보존했다. Admin의 테스트 상품명·통관 품명 기본값과 특정 수공예 상품 유형을 설명하는 계약 문구도 이번 범위로 일괄 변경하지 않았다.
4. 일부 구체 카테고리의 기존 소재·인증 배지, 배송·검수·할인 보장은 별도 근거 확인이 필요하다. 이번 정리는 제조 방식 공통 주장에 대한 적용이며 제품별 원산지·인증·법률 적합성 검증 완료를 뜻하지 않는다.
