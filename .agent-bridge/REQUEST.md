# 작업 요청 — storefront M04 구매 경험 모듈 운영 지도 파일럿

## 작업 성격

분석 및 문서화. 애플리케이션 코드 리팩터링이나 기능 구현을 수행하지 않는다.

## 목표

`blank-seoul-storefront`의 기능별 운영 관리 방식을 검증하기 위해 공통 모듈 `M04 구매 경험`만 파일럿으로 분석한다. 이번 실행에서는 `M04-F001 상품 탐색`과 `M04-F002 장바구니`를 중심으로 목적, 사용자 여정, 실제 코드 진입점, 데이터·외부 서비스 의존성, 변경 영향, 검증 방법, 운영 관측 항목과 작은 정리 후보를 기록한다.

결과는 `docs/platform-analysis/STOREFRONT_MODULE_OPERATIONS.md` 한 파일에 작성한다. 이 문서는 이후 M01–M12와 `blank-seoul-admin` 모듈 문서를 같은 방식으로 확장할 수 있는 기준 예시여야 한다.

## 조사 범위

먼저 다음 문서에서 현재 목표와 공통 ID를 확인한다.

- `docs/platform-analysis/README.md`
- `docs/platform-analysis/PROJECT_DIRECTION.md`
- `docs/platform-analysis/USER_JOURNEYS.md`
- `docs/platform-analysis/FEATURE_MAP.md`
- `docs/platform-analysis/DATA_AND_FLOWS.md`

코드 조사는 아래 범위에 집중한다.

- `app/page.tsx`
- `app/artists/**`
- `app/collections/**`
- `app/product/**`
- `app/cart/**`
- `components/ProductInteractive.tsx`
- `components/BuyButton.tsx`
- `components/CartProvider.tsx`
- `components/ProductCard.tsx`
- Shopify, 작가, 재고, cart companion과 직접 관련된 `lib/**`
- 경계 확인에 꼭 필요한 경우에만 `AuthProvider`, 주문 및 배송 조회 코드

전체 저장소 파일 목록이나 모든 API를 새로 조사하지 않는다. M04와 직접 관련이 없는 코드는 분석 대상에서 제외한다.

## 문서에 포함할 내용

- M04가 사용자에게 제공하는 결과와 `M04-F001`, `M04-F002`의 책임
- 관련 사용자 여정과 요구사항 `B01`, `B02`, `B05`, `R01`
- 필요한 계약 `C02`, `C03`, `C06`과 M01·M03·M05 경계
- 실제 페이지, 컴포넌트, provider/hook, 서비스 및 데이터 원천
- 변경 유형별 영향 범위와 검토해야 할 인접 기능
- 대표 정상·실패 검증과 운영 중 확인할 신호
- 현재 코드에서 확인된 작은 정리 후보와 그 근거
- 다른 모듈에도 재사용할 수 있는 간결한 모듈 기록 템플릿
- 확인한 사실, 제안, 정책 미결정, 실행하지 않은 검증의 명확한 구분

한국어로 작성하고 약 250줄 이내를 목표로 한다. 기존 `FEATURE_MAP.md`의 단순 복사를 피하고 실제 변경 및 운영 판단에 필요한 정보를 보완한다.

## 제약 조건

- 현재 사업은 한국 제조 상품 중심이며 K-Food는 보류된 과거 사업이다.
- `../blank-seoul-admin`은 수정하거나 재분석하지 않는다. 기존 공통 문서에 기록된 계약만 참조한다.
- 이번 실행에서는 `docs/platform-analysis/STOREFRONT_MODULE_OPERATIONS.md`만 새로 작성한다.
- 앱 코드, 테스트 코드, 설정, 패키지와 다른 분석 문서를 변경하지 않는다.
- 기존 사용자 변경을 보존하고, 현재 코드에 근거하지 않은 기능·담당자·운영 상태를 만들지 않는다.
- 확정되지 않은 정책이나 요구사항은 임의로 결정하지 않는다.
- 외부 서비스 호출, 이메일·쿠폰·주문 변경, SQL 실행·마이그레이션 적용, 배포, Git push를 수행하지 않는다.

## 완료 기준

- 새 문서의 모든 로컬 파일 경로가 실제로 존재한다.
- M04의 책임, 코드 경계, 데이터 계약, 변경 영향, 검증 및 운영 신호를 한 문서에서 추적할 수 있다.
- 후속 모듈 문서를 같은 구조로 작성할 수 있는 템플릿이 포함된다.
- Gemini는 구현 결과와 미확인 사항을 `REPORT.md`에 기록한다.
- 문서 전용 작업이므로 새 테스트를 만들지 않는다. 등록된 회귀 검사는 오케스트레이터가 실행하며 그 결과를 기능 전체 검증으로 확대 해석하지 않는다.
