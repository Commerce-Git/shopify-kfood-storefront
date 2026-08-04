# Shopify API (2026-01) 연동 및 마이그레이션 가이드

이 문서는 기존 정적 토큰(Legacy Token) 방식에서 **2026년 기준 최신 Client Credentials Grant 방식**으로 인증을 전환하고, 강화된 **GraphQL API (2024-04 버전 이후)** 스키마 변경점에 대응하기 위한 가이드라인입니다. 나중에 파이프라인을 유지보수하거나 다른 스토어를 새롭게 연결할 때 참고하십시오.

---

## 1. 서버-투-서버 인증 구조 (Client Credentials Grant)

Shopify는 보안상의 이유로 과거의 "영구 만료되지 않는 정적 API 토큰" 사용을 지양하고 있습니다. 대신, CLI나 백엔드 파이프라인과 같은 Headless 서버 애플리케이션은 **Client ID**와 **Client Secret**을 이용해 24시간마다 새로운 1회성 토큰을 발급받아야 합니다..

### 환경 변수 구성 (`.env.local`)
앱의 자격 증명(Credentials) 페이지에서 아래 두 가지를 가져와야 합니다.
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_CLIENT_SECRET=shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> [!TIP]
> **캐싱 및 갱신 구조**
> 파이프라인(`token-manager.ts`)은 매번 API를 요청하지 않고 발급받은 액세스 토큰을 로컬 파일(`.shopify-token.json`)에 저장합니다. 파일의 유효기간(24시간)을 체크하여 만료 1시간 전이 되면 자동으로 갱신을 수행합니다.

---

## 2. Dev Dashboard 권한(Scopes) 설정 시 주의점

자체 구축(Custom) 앱이나 Server-to-Server 통신을 위한 앱은 대시보드 UI를 통해 직접 권한 명칭을 입력해야 합니다.

### 올바른 Scopes 입력 방식
앱의 "구성(Configuration)" 혹은 "API Access" 메뉴에서 아래와 같이 **쉼표(,)로 구분된 단일 문자열**을 입력하십시오.
```text
read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
```

> [!WARNING]
> **유효하지 않은 권한 이름 오류**
> 메타필드 접근을 위해 `write_metafield_definitions` 등 존재하지 않는 레거시 권한을 섞어 넣으면 오류(`유효하지 않은 범위가 포함되어 있습니다`)가 발생합니다. **메타필드는 `write_products` 권한만 있으면 상품 메타필드를 정의하고 조작할 수 있습니다.**

### 권한 캐시 초기화 주의사항
대시보드에서 권한을 변경하더라도 로컬 토큰 파일(`.shopify-token.json`)에는 기존 범위(빈 값 등)가 캐싱되어 있어 **"권한 부족(Access denied)"** 에러가 유지됩니다. 
앱을 스토어에 **Update/Re-install** 한 직후에는 로컬 토큰 파일(`.shopify-token.json`)을 강제로 삭제하여 권한이 확장된 새 토큰을 갱신 발급 받아야 합니다.

---

## 3. GraphQL 스키마 파괴적 변경사항 (Breaking Changes)

Shopify **2024-04** API 버전부터(우리는 `2026-01` 사용) 상품과 옵션, 재고 관리 등 구조에 엄청난 변화가 일어났습니다.

### 3-1. `ProductInput`에서 `variants` 필드 삭제
상품을 생성(`productCreate`)하거나 업데이트할 때, 기존에는 `ProductInput` 내부에 배열 형태로 `variants`를 담아 한 번에 처리했습니다. **이 기능은 삭제되었습니다.** (Field is not defined on `ProductInput` 에러 발생)

#### 해결책: 핵심 분리 (2-Step Creation)
상품 본체를 만들고 ➡️ 생성된 직후의 기본 옵션(Default Variant)을 `productVariantsBulkUpdate`로 분리 편집해야 합니다.

```diff
- // 예전 방식 (단일 Mutation)
- mutation CreateProduct($input: ProductInput!) {
-   productCreate(input: $input) { ... }
- }
- /* 
-   input: {
-     title: "Example Product",
-     variants: [{ price: "10.00", sku: "ABC" }] // ❌ 버전에러 발생 
-   }
- */

+ // 최신 방식 (2단계 단계적 처리)
+ // 1. 빈껍데기 상품 기본틀 먼저 생성
+ mutation CreateProduct($input: ProductInput!) { ... }
+ 
+ // 2. 빈 상품 생성 직후 id를 기반으로 자동 생성된 1번 Variant 내용 덮어쓰기
+ mutation UpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
+   productVariantsBulkUpdate(productId: $productId, variants: $variants) { ... }
+ }
```

### 3-2. `sku` 항목의 보호 영역 분리 (`inventoryItem`)
마찬가지로 `2024-07` 버전을 기점으로 옵션 속성이었던 **SKU 바코드 데이터가 재고 관리의 깊은 영역으로 종속**되었습니다. `ProductVariantsBulkInput` 최상단에서 `sku`를 요청하면 존재하지 않는 필드 에러를 반환합니다.

#### 해결책: `inventoryItem` 내부로 이동

```json
{
  "productId": "gid://shopify/Product/123",
  "variants": [
    {
      "id": "gid://shopify/ProductVariant/456",
      "price": "10.00",
      "inventoryItem": {
        "sku": "NEW-SKU-123",
        "measurement": {
          "weight": {
            "value": 100,
            "unit": "GRAMS"
          }
        }
      }
    }
  ]
}
```
위와 같이 옵션이 아니라 `inventoryItem`의 하위 구조로 `sku`와 무게를 넣도록 데이터 페이로드를 조립해야 API 검증을 무사히 통과합니다.

---

## 4. 참조용 공식 문서 (References)
문제가 생기거나 최신 구조를 확인해야 할 때는 아래 링크들을 우선 순위로 점검하세요.

- [Client Credentials Grant (API 인증)](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens)
- [Admin API 권한 목록 (Access Scopes)](https://shopify.dev/docs/api/usage/access-scopes)
- [GraphQL Admin API Reference (최신 버전)](https://shopify.dev/docs/api/admin-graphql)
- [ProductVariantsBulkInput 구조 명세서 (variants와 sku 이동 내역)](https://shopify.dev/docs/api/admin-graphql/latest/inputs/ProductVariantsBulkInput)

---
**작성일시**: 2026-03-31
**대상 프로젝트**: FDA 물류 자동화 파이프라인 (Phase 0)
