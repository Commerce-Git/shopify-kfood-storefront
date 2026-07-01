# 상품 등록 요청 가이드

> 이 프로젝트(storefront)는 **UI/UX 전용**입니다. 상품 등록은 `shopify-git`에서 수행합니다.

## 역할 분리

```
blank-seoul-storefront          shopify-git
─────────────────────             ───────────
✅ UI/UX 기획 & 디자인             ✅ 상품 등록/수정/삭제
✅ 상품 표시 (Storefront API)      ✅ FDA 메타필드 관리
✅ 체크아웃 생성                    ✅ HS코드/SKU/무게 관리
✅ SEO & 마케팅                    ✅ 주문 → EMS → FDA PN
❌ 상품 등록 금지                   ✅ Supabase 동기화
❌ Admin API 사용 금지              ✅ 재고 관리
```

## 새 상품이 필요할 때

### 1. 이 프로젝트에서 기획

어떤 상품이 필요한지 정리:
- 상품명, 가격, 설명
- 구성품 (어떤 개별 스낵을 넣을 것인지)
- 태그 (`featured`, `limited` 등)
- 이미지

### 2. shopify-git에서 등록

`shopify-git` 프로젝트를 열고 다음과 같이 요청:

```
"products.json에 다음 패키지 상품을 추가해줘:

- SKU: MKT-SNACKBOX-01
- 이름: Korean Snack Discovery Box
- 가격: $39.99 (할인 전 $54.99)
- 구성품: NS-SHRIMP-90G, OR-CHOCOPIE-468G, SY-BULDAK-140G
- 태그: featured, gift, snack-box, limited
- Headless 채널에 게시 필수"
```

### 3. 이 프로젝트에서 확인

```bash
# Storefront API로 상품 조회
curl -s -X POST \
  "https://tv7r0x-zn.myshopify.com/api/2024-10/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: 9446a89fffd548b95997e692fa1a5194" \
  -d '{"query": "{ products(first: 10) { edges { node { title handle } } } }"}' \
  | python3 -m json.tool
```

상품이 보이면 `localhost:3000`에서 UI 확인.

## Headless 채널 게시 확인

shopify-git에서 상품을 등록한 후, Shopify Admin에서 해당 상품이
**Headless 채널에 게시**되어 있는지 반드시 확인하세요.
게시되지 않으면 Storefront API에서 조회되지 않습니다.
