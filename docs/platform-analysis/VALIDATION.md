# 검증 결과와 후속 시험

아래 1–3절은 2026-09-24의 검증 기록이다. 문의의 최신 실행 결과는 바로 아래 후속 확인, 운영·테스트 환경 분리의 이력은 관련 후속 절을 참조한다.

## 문의 Preview 실제 시험과 프록시 접근 보완 — 2026-10-02

사용자 직접 시험 요청으로 실행했다. 대상은 테스트 Supabase `zijvqethklunvydtqmak`와 Admin dev Preview `1c8ab504`/READY, Storefront dev Preview `07e5441b`/READY다. 운영 문의 데이터나 실제 고객 이메일을 사용하지 않았다. [비밀값을 제외한 실행 증거](../../../blank-seoul-admin/scripts/performance/inquiry-preview-test-result.json), [현재 문의 계약·다음 단계](INQUIRY_DELIVERY.md#2026-10-02-실제-문의-시험과-preview-연결-보완).

| 범위 | 실행 결과 | 한계 |
| --- | --- | --- |
| 배포된 고객 프론트 Preview | Chrome에서 문의 GET·실시간 자격 POST 503, 대화 이력 미표시를 재현 | 전체 문의 흐름 통과 판정 불가 |
| 배포된 Admin 문의 HTTP | 생성·회신·동일 요청 재전송·생성 내용 충돌 409·내부 노트 비공개·대화별 읽음·직원 bearer 비노출 확인. 익명 직원/관리자 401, ADMIN 위조 403, 저장된 비참여 작가 세션 403 확인 | 문의 첨부·만료 30일 경과·모든 권한/작가 배정 조합을 전수 시험하지 않음 |
| 실제 Supabase private Broadcast | 고객 A/B·관리자 구독 성공. 실제 DB 회신으로 A·관리자만 알림 수신. 발급되지 않은 채널 참가 CHANNEL_ERROR | 최초 1.8초 확인에서는 수신 0; 새 구독의 10초 확인과 후속 브라우저에서 수신 성공. 보편적 지연 보장 아님 |
| 알림 발행 제한 | WebSocket 고객 발행 timeout/미수신. REST 익명·서버 요청 모두 HTTP 202였으나 실제 수신은 서버 대조군만 발생 | HTTP 상태만으로 권한 판정하지 않음 |
| 로컬 수정 Next.js 프론트 → 배포된 Admin | 문의 작성·관리자 목록 표시·회신 표시·열린 화면 읽음·닫기/다시 열기·새로고침·오프라인 초안/미읽음 보존·재접속 복구 통과 | 프론트는 로컬 포트 3031, 별도 `.next-offline` 캐시. 아직 원격 수정 프론트 시험이 아님 |
| 실제 Admin Preview UI → 로컬 수정 고객 UI | 관리자가 문의 화면에서 작성한 회신 POST 201·입력 초기화·고객 표시 확인. 표시 대기 약 829ms | 해당 소규모 시험의 관찰값이며 SLA/비용/동시 이용 검증 아님 |
| 실제 서버 저장 후 브라우저 응답 유실 | 입력 유지 → 같은 요청 재시도 → 원래 메시지 ID 반환. DB 한 행·말풍선 하나·입력 초기화 확인 | 최초 시험 도구의 route/ARIA 대기 충돌은 도구 수정 후 기존 시험 대화로 재확인 |

**503 원인·보완:** 보호된 Admin Preview에 프론트 서버가 접근키 없이 요청했고, 보호 화면으로의 redirect가 `redirect: 'error'`에 의해 503으로 처리됐다. 프론트 문의 프록시에 서버 전용 `ADMIN_API_PROTECTION_BYPASS`를 추가해 검증된 HTTPS Admin origin에만 헤더로 전달한다. 고객 쿠키/Authorization/프론트 보호 키는 전달하지 않고 조회 매개변수도 `summary`, `known`, `before`만 허용한다. 반복 쓰기나 다른 환경으로의 fallback은 추가하지 않았다.

원격 프론트 **dev 브랜치 Preview**에 기존 Admin 자동화 접근키를 encrypted 변수로 등록·pull 재검증했다. 다른 변수·양쪽 접근 보호는 유지했으며 Production/localhost에 이 변수를 새로 등록하지 않았다. `.env.example`에는 선택 변수명·설명만 추가했다. 프론트 전체 단위 **28/28**, TypeScript·변경 프록시 ESLint·diff 공백 검사 통과. 프로덕션 build는 이번 실행에서 반복하지 않았다.

가상 문의 4개를 앱 API로만 만들고 모두 해결·읽음 처리해 미확인 수를 0으로 확인했다. 이메일 flag=false를 유지했고 시험 답변에 미읽음 공개 회신이 남지 않았다. 프론트 브라우저 접근용 임시 키는 시험 후 폐기하고 격리 서버를 종료했다. API 자체의 자동 trigger 변경 외에 SQL/마이그레이션을 적용하거나 Git push·배포를 수행하지 않았다.

**사용자 재배포 후 후속 확인:** Storefront `e76ddc2e`·Admin `1c8ab504`가 Preview와 Production 양쪽 READY임을 조회했다. 아래 결과는 위의 수정 전/로컬 시험 이후에 실행한 것으로, 실행 증거의 `deployedFollowup`에 보관한다.

| 범위 | 후속 결과 | 한계 |
| --- | --- | --- |
| 배포된 고객 Preview → 배포된 Admin Preview | 문의 생성 201·관리자 목록 표시·답변 표시·읽음·닫기/다시 열기·새로고침·오프라인 초안/미읽음 보존·재접속 통과. 관찰한 문의 API 응답 18개 모두 성공 | 가상 고객 한 대화, 소규모 기능 시험 |
| 저장 성공 후 응답 유실 | 초안 유지 후 같은 요청 재전송으로 원래 ID·DB 한 행·말풍선 하나 확인 | 영구 오프라인 outbox 검증 아님 |
| 배포된 관리자 UI → 배포된 고객 UI | 답변 POST 201·입력 초기화·고객 표시 약 1.34초, 관찰한 관리자 API 응답 14개 성공 | SLA·동시 이용 보장 아님 |
| 배포된 고객 private Broadcast | 구독 성공·`changed` 수신·신규 답변 조회/표시 확인. 12초 유휴 구간에 정기 고객 조회 추가 0건 | 최초 도구의 객체 JSON 판정은 배열/바이너리 프레임을 놓침. SDK serializer 후속 확인으로 교정; 비용 절감 판정 아님 |
| Production 읽기 전용 | 공개 페이지 200·없는 고객 문의 404·비로그인 관리자 API 401 | 운영 대화 생성·회신·메일은 시험하지 않음 |

후속 가상 문의 1개만 앱 API로 생성했으며 해결·관리자/고객 미확인 0·공개 답변 미읽음 0으로 정리했다. 메일 false를 유지했다. 프론트 임시 시험 접근키를 폐기하고 기존 키·접근 보호를 보존했다. 에이전트는 SQL 적용·Git push·배포를 수행하지 않았으며 이번 후속 작업에는 앱 코드 수정이 없다. **문의 Preview 재시험은 완료했고, 실제 메일 전달과 운영 문의 전체 흐름은 별도다.**

실행일: 2026-09-24 · 검증 대상은 로컬 작업 트리다. [기준선](README.md)과 [명령 원문 결과](check-results.json)를 함께 참고한다.

## 1. 실제 실행 결과

| ID | 위치·명령 | 결과 | 증명하는 범위 |
| --- | --- | --- | --- |
| V01 | F `npm run test:unit` | 종료 0, 9개 통과 | 카탈로그 페이지네이션·일부 스키마/로컬 저장·오류 처리·주문 소유 이메일 유틸 |
| V02 | A `npm run test:unit` | 종료 0, 15개 통과 | 관리자/작가/창고 대표 권한 경계, cron 인증, 입고 request ID, 완료 패킹 중복, 문의 첨부 경계 |
| V03 | F `npm run typecheck` | 종료 0 | 현재 TypeScript 타입 검사 |
| V04 | A `npm run typecheck` | 종료 0 | 현재 TypeScript 타입 검사 |
| V05 | A cwd에서 `node <storefront>/scripts/analysis/check-fulfillment-scenarios.cjs` | 종료 1, 5개 통과·2개 실패 | 실제 순수 그룹화·작가 코드 함수에서 F01/F02 재현 |
| V06 | F `python3 scripts/analysis/inventory-platform.py --storefront /Users/junseoha/Downloads/blank-seoul-storefront --admin /Users/junseoha/Downloads/blank-seoul-admin --output docs/platform-analysis` | 수집 완료 | 소스 목록·직접 DB/RPC 참조·SHA-256·Git 기준선 |

V05는 결함을 숨기지 않도록 기대 조건 위반 시 종료 1을 반환한다. 수정 후 같은 시나리오가 통과해야 한다. 외부 DB·택배·Shopify 호출 없이 메모리 입력을 사용한다.

| V05 시나리오 | 결과 |
| --- | --- |
| 기본 fixture 두 작가의 코드가 서로 다름 | 통과 |
| 모두 입고·송장 없음 → 합포장 ready | 통과 |
| A만 입고 → A ready/B pending | 통과 |
| A 송장 발급·B 운송 중 → A submitted/B pending | 통과 |
| A 송장 후 B 입고 → A 송장에 B가 섞이면 안 됨 | 실패: 합포장 itemCount=2, tracking=TRACK-A |
| A 출고 완료·B 입고 → A completed/B ready | 통과 |
| Artist A/B의 EMS 식별자가 달라야 함 | 실패: 두 코드 모두 1FS8 |

기존 단위 테스트는 외부 fetch를 대체하고 가짜 입력을 사용한다. admin 실행 로그에는 의존 모듈의 dotenv 로딩과 DB 환경 이름 출력이 있었다. 이를 실제 운영 DB 접속·검증 증거로 사용하지 않는다. 향후 시험 환경은 환경 파일 자동 로딩까지 분리해 재현성을 높이는 것이 좋다. storefront에는 Node 실험 기능/모듈 형식 경고가 있었으며 테스트는 통과했다.

## 2. 이번에 실행하지 않은 것

### 2차 분석의 추가 확인

2026-09-24 역할별 여정 분석에서는 앱·업무 로직을 변경하지 않았다. 단위/타입/물류 진단을 다시 실행하지 않았으며 위 V01–V06은 1차 기록으로 유지한다.

- 1차 `inventory.json`의 소스 1,062개를 현재 파일과 SHA-256 대조: 변경·누락 0개.
- 현재 페이지 45개·라우트 파일 150개를 주관 모듈에 분류: 미분류 0개. 빈 라우트도 파일 수에는 포함하며 기능으로 인정하지 않음.
- 근거: [journey-evidence.json](journey-evidence.json)의 기준 커밋·파일 해시·API 문자열·DB/RPC 직접 참조. 이 데이터는 호출 그래프의 완전성·런타임 동작·운영 권한을 증명하지 않음.
- 문서 일관성 확인: 기능 ID 35개·여정 단계 33개·정책 질문 12개·계약 12개·인수 시나리오 7개, 중복 ID·미등록 기능 참조·깨진 로컬 링크 0개. 조사 중 앱/lib 소스 697개 해시 변경 0개. 실제 앱 E2E·DB·외부 서비스·부하 시험은 미실행이다.

### 미실행 시험

- 배포 빌드·브라우저 구매 E2E·전체 lint. 이번 산출물은 기능 변경이 없는 분석 문서이며 위 기본 검사와 재현 시험에 범위를 뒀다.
- 실제 Supabase의 SQL·RLS·RPC·트리거·트랜잭션 시험.
- 실제 Shopify 결제·환불·상품 수정·출고 및 우체국·메일·은행/세금 서비스 호출.
- 20,000세션 부하, IO 장시간 관측, 장애 주입 통합 시험, 백업 복원 훈련.
- 이름에 `test`가 있는 admin 스크립트 일괄 실행. 외부 쓰기 가능성이 있어 파일 이름을 안전성 증거로 삼지 않았다.
- agent-bridge 실제 모델 호출 및 다중 저장소 통합 시험.

테스트 파일 수·PASS 수는 전체 기능 커버리지나 운영 적합성 점수가 아니다. PF01–PF11은 별도의 상세 회귀/통합 검증이 필요하다.

## 3. 추가 검증 계획

| 시험 ID | 대상·예시 | 환경·완료 기준 |
| --- | --- | --- |
| V10 | 구매→가격 수정→지연 웹훅, 같은 주문 재전송·라인 추가 | 가짜 시계/이벤트 + 시험 DB; 올바른 단가 버전·중복 없음 |
| V11 | 판매 수량 변경과 구매·Shopify 웹훅 동시 발생 | 시험 DB/연동 대체; 손실 업데이트·판매량 역행 없음 |
| V12 | 2개 주문을 1개씩 입고, 중복/동시 스캔, 품목 저장 후 stock RPC 실패 | 시험 DB; 라인 배정·실물·수불 일치 |
| V13 | 송장 확정 후 추가 입고, 같은 작가명 코드 충돌, 중복 접수 | 도메인 + 시험 외부 어댑터; 고정된 묶음·송장과 정확한 수량 |
| V14 | 외부 출고 성공 후 로컬 쓰기 실패, 재시작 | 시험 DB·외부 응답 기록; 재고 중복 차감 없이 상태 수렴 |
| V15 | 부분 환불·전액 환불·환불 뒤 취소, 기지급 주문, 취소 DB 실패 | 시험 DB/웹훅; 원거래 보존·조정 합계·오발송 방지 |
| V16 | 누락 단가·취소 주문의 정산 요청, 정산 중 환불, 정산 취소 | 시험 DB; 서버 검증·지급 근거·감사 이력 보존 |
| V17 | claim 직후 강제 종료, 임대 만료, 이전 워커 늦은 완료 | 시험 DB/워커; 중단 작업 회수·중복 결과 차단 |
| V18 | 고객/작가/창고 A가 B의 객체 ID 요청, 해지·세션 만료·직접 DB/Storage 접근 | 역할별 시험 계정; API·DB 양쪽 거부 |
| V19 | 리전·데이터량·캐시 상태를 정한 1k→5k→20k 세션 및 배치 병행 | 독립 시험 환경; 합의된 지연·오류·IO·정합성·비용 만족 |
| V20 | DB/파일 복원, 이전 앱 버전과 신규 스키마, 부분 배포 | 독립 시험 환경; 합의한 RPO/RTO·배포 호환성 증거 |

부하·복구 시험의 시간과 기준은 목표 문서의 후보 수치를 사용자와 확정한 뒤 적용한다. 운영 자료가 없으면 추측값으로 PASS를 만들지 않는다.


## 운영 테스트 환경 분리 수정 보고서

작성일: 2026년 9월 30일. 대상은 Blank Seoul 프론트와 Admin이다. 이번 보고서는 Shopify 앱 공유와 운영·개발 연결을 검토한 이후 실제 적용한 코드·로컬 설정·문서 변경을 정리한다. 작성자는 작업을 수행한 Codex이며, 운영 담당자가 배포 전후 확인 범위를 판단하는 데 사용한다.

**결론: 두 프로젝트의 환경 분리 보완은 로컬 코드 적용과 커밋까지 완료됐다. 단위 테스트 합계 288개와 양쪽 타입 검사가 통과했다. 최신 코드의 Vercel 배포, 실제 웹훅 전달, 개발 스토어 시험 주문과 운영 DB 미반영 여부는 아직 확인하지 않았다.** 따라서 현재 판정은 코드 보완 완료이며 운영·테스트 환경 전체의 완전 격리 검증 완료가 아니다.

### 목적과 적용 범위

운영과 테스트에서 같은 코드와 Shopify 앱을 사용하되, 접속 스토어·DB·웹훅 수신 주소·메일 링크가 각 환경에 맞게 동작하도록 보완했다. 구매자와 작가의 시험 동작이 운영 데이터에 영향을 주지 않도록 하는 작업이며, 공통 목표 R01–R03 및 두 프로젝트 작업 범위 R08에 해당한다.

| 구성 | 운영 | 개발 및 테스트 |
| --- | --- | --- |
| 프론트 | 운영 배포 | 프론트 Preview 또는 로컬 개발 서버 |
| Admin | 운영 배포 | Admin Preview 또는 로컬 개발 서버 |
| Shopify | 운영 스토어 | 개발 스토어 |
| Supabase | 운영 프로젝트 | 테스트 프로젝트 |
| Shopify 앱 | 두 스토어에 설치한 같은 앱 사용 방향 유지 | 앱 자격증명 공유와 스토어별 토큰 발급을 구분 |

이 표는 구성 방향이다. 원격 계정 설정 전체를 대조해 완료 판정한 결과가 아니다. 신규 Shopify 앱 생성이나 운영 상품·고객·주문을 테스트로 복제하는 마이그레이션은 이번 코드 변경에 포함하지 않았다.

### 확인한 커밋

보고서 작성 시작 시 두 작업 트리는 깨끗했고, 두 프로젝트 모두 `dev` 브랜치였다.

| 프로젝트 | 확인한 커밋 | 커밋명 | 변경 파일 수 |
| --- | --- | --- | --- |
| Admin | `890007a` | `fix: isolate Shopify token cache and validate webhook store` | 8 |
| 프론트 | `a3042e0` | `fix: isolate storefront tokens and preview environment` | 10 |

위 커밋은 로컬 Git에서 확인했다. 원격 push 성공이나 해당 커밋의 Vercel 배포 성공은 별도 확인 대상이다. 이 보고서와 목차 보완은 위 커밋 이후의 문서 변경이다.

### Admin 변경

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| 토큰 캐시 | 메모리와 `.shopify-token.json`을 공통 사용 | 스토어 도메인·Client ID·Client Secret의 해시로 메모리와 파일을 분리 |
| 기존 파일 처리 | 출처를 구분할 정보 부족 | 공용 파일을 읽지 않고 새 토큰 발급. 자동 삭제하지 않음 |
| 캐시 유효성 | 토큰과 만료값 위주 확인 | 캐시 식별자·스토어·앱·필드 형식·만료를 확인 |
| 토큰 발급 | 설정값을 그대로 사용 | Shopify 도메인 검증, HTTP 리다이렉트 거절, 토큰 응답 형식 검증 |
| 캐시 파일 | 공통 파일 | `.shopify-token-<hash>.json`, 생성 모드 0600, Git 제외. 파일 쓰기 실패 시 메모리 사용 |
| 캐시 조회와 삭제 | 공통 캐시 대상 | 지정한 스토어·앱·키 조합만 조회 또는 초기화 |
| 웹훅 | 본문 HMAC 검증 | HMAC 검증 후 수신 스토어 헤더와 `SHOPIFY_STORE_URL` 일치 검사 |

웹훅 검사는 주문 생성·취소·삭제, 환불, 상품, 재고의 6개 공통 검증 사용 경로에 적용했다. 서명이 잘못되면 401, 서명은 유효하지만 다른 스토어 또는 스토어 헤더 누락이면 403, 서명과 스토어가 유효하지만 JSON 형식이 잘못되면 400이다. 서버의 스토어 설정이 누락되거나 잘못되면 500으로 처리한다. 다른 스토어의 요청이 업무 의존성을 사용하기 전에 거절되는지도 테스트했다.

**한계:** Shopify HMAC은 본문을 검증하며 스토어 헤더를 서명하지 않는다. 같은 앱 Secret을 공유할 때 이 헤더 검사는 오배송·오설정 방지 장치다. 앱 Secret을 알고 있는 환경 사이의 암호학적 격리까지 보장하지 않는다. 실제 구독이 운영과 Preview의 올바른 주소로 전달되는지 별도 확인해야 한다.

근거: [토큰 관리](../../../blank-seoul-admin/lib/shopify/token-manager.ts), [도메인 검사](../../../blank-seoul-admin/lib/shopify/store-domain.ts), [웹훅 검증](../../../blank-seoul-admin/lib/shopify/webhook-utils.ts), [Admin 회귀 테스트](../../../blank-seoul-admin/tests/unit/shopify-environment-isolation.test.ts). 설정 예시·Git 제외 규칙·기존 검증 스크립트의 요청 헤더도 함께 갱신했다. 상세 절차는 [Admin 연동 가이드](../../../blank-seoul-admin/doc/Shopify_API_2026_Guide.md)를 참조한다.

### 프론트 변경

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| Admin API DB 캐시 | `shopify_token_cache`의 고정 `admin_token` 행 사용 | 스토어·앱·Secret 해시가 포함된 ID 사용 |
| 기존 DB 캐시 | 다른 설정에서 생성된 토큰의 출처 확인 불가 | 이전 공용 행은 읽거나 삭제하지 않음 |
| DB 저장 | 저장 완료를 기다리지 않음 | 저장 완료를 기다리며, 실패 시 메모리 토큰 유지 |
| 수신거부 서명 | 이메일·작가 정보만 포함 | `v2.` 서명에 사이트 origin·Shopify 도메인·Supabase URL·이메일·작가 포함 |
| 이메일 사이트 주소 | 미설정 시 기존 배포 주소로 대체 | 잘못된 주소·키·환경 식별값이면 링크 생성 실패 |
| Preview 이메일 | 운영 주소를 사용할 수 있음 | `VERCEL_ENV=preview`에서 사이트 주소가 `https://blankseoul.com`이면 거절 |
| 상품 미리보기 | 주소 접두사, `localhost` 또는 `vercel.app` 포함 여부로 허용 | `NEXT_PUBLIC_ADMIN_API_URL`의 정확한 origin과 실제 부모·팝업 창을 검사 |
| 준비 메시지 전송 | `postMessage` 대상 `*` | 설정된 Admin origin으로만 전송 |

새 수신거부 링크는 키가 같더라도 사이트·스토어·DB가 달라지면 검증에 실패한다. 잘못된 수신자·작가 또는 변조된 토큰도 거절한다. 주소와 Secret을 운영 값으로 조용히 대체하는 경로를 제거했다.

**기존 이메일 호환 범위:** 사이트 주소가 `https://blankseoul.com`이고 `VERCEL_ENV`가 preview가 아니며 `UNSUBSCRIBE_ACCEPT_LEGACY=false`가 아니면 기존 형식의 서명도 허용한다. 과거 링크에는 환경 정보가 없으므로 같은 키로 발급된 과거 테스트 링크와 운영 링크를 구별할 수 없다. 새 링크의 환경 분리와 과거 링크의 출처 보증은 다른 문제다. 운영에서 구형 링크를 모두 폐기할 경우에만 `UNSUBSCRIBE_ACCEPT_LEGACY=false`를 적용한다.

근거: [프론트 토큰 관리](../../lib/shopify/admin.ts), [수신거부 링크](../../lib/unsubscribe.ts), [미리보기 origin 검사](../../lib/security/preview-origin.ts), [미리보기 화면](../../app/product/preview/page.tsx), [프론트 회귀 테스트](../../tests/unit/environment-isolation.test.ts).

### 로컬 설정과 문서 변경

프론트 `.env.local`의 `NEXT_PUBLIC_SITE_URL`을 `http://localhost:3001`로 수정하고, `UNSUBSCRIBE_SECRET`을 운영과 다른 개발용 값으로 변경했다. 운영 `.env.production.local`의 값은 변경하지 않았다. 비밀값은 Git에 포함하지 않았으며 이 보고서에도 기록하지 않는다.

양쪽 로컬 환경파일을 대조했을 때 운영과 개발의 Shopify 도메인·Storefront 토큰·Supabase 연결값은 서로 달랐고, 같은 환경의 프론트와 Admin은 같은 Shopify·Supabase 연결값을 사용하고 있었다. 이는 파일 대조 결과이며 실제 자격증명의 유효성, DB 권한, 원격 배포 설정을 검증한 결과는 아니다.

프론트에 [환경변수 예시](../../.env.example)와 [환경 분리 가이드](../environment-isolation.md)를 추가했고, 공통 목차와 작업 기록을 갱신했다. Admin에는 기존 연동 가이드와 환경변수 예시를 보완했다. 프론트 수정은 처음에 임시 작업본에서 준비·검증한 뒤, 형제 프로젝트 쓰기 권한 승인을 받아 원본에 적용했다. 원본 적용 후 테스트와 타입 검사도 통과했다.

### Vercel 설정 확인 상태

사용자가 제공한 화면에서 세 변수의 운영·Preview 공용 적용을 확인했다. 이후 아래와 같이 분리하는 방법과 입력 주소를 안내했다. **안내 이후 저장된 최종 값과 재배포 결과는 확인하지 않았다.**

| 변수 | Production 값 | Preview에 안내한 값 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://blankseoul.com` 유지 | `https://blank-seoul-storefront-git-dev-thec9rqwer-4072s-projects.vercel.app` |
| `NEXT_PUBLIC_ADMIN_API_URL` | `https://blank-seoul-admin.vercel.app` 유지 | `https://blank-seoul-admin-git-dev-thec9rqwer-4072s-projects.vercel.app` |
| `UNSUBSCRIBE_SECRET` | 기존 운영 키 유지 | 새 테스트용 무작위 키. 생성·전달 완료, 원격 저장 확인 안 됨 |

로컬 파일 변경과 Vercel 설정은 별개다. 위 Preview 전용 키는 로컬 개발 키와도 별도로 생성했다. `NEXT_PUBLIC_*` 값은 브라우저 빌드에 들어가므로 설정 변경 이후 새 빌드가 필요하다.

`NEXT_PUBLIC_STORE_LAUNCH_STATUS=preview`는 구매 기능을 끄는 애플리케이션 설정이며, Vercel Preview라는 배포 유형과 다르다. 개발 스토어 연결과 테스트 결제를 확인한 후 구매 시험 환경에서 `live`로 설정하는 절차를 설명했다. 이번 작업에서 판매 상태를 변경하거나 실제 결제를 수행하지 않았다.

### 실행한 검증과 증거

| 프로젝트 | 명령 | 결과 | 증거 범위 |
| --- | --- | --- | --- |
| Admin | `npm run test:unit` | 275개 통과, 실패 0 | 기존 테스트와 환경 분리 회귀 10개 포함 |
| Admin | `npm run typecheck` | 종료 코드 0 | TypeScript 타입 검사 |
| 프론트 | `npm run test:unit` | 13개 통과, 실패 0 | 기존 9개와 환경 분리 회귀 4개 |
| 프론트 | `npm run typecheck` | 종료 코드 0 | TypeScript 타입 검사 |
| 양쪽 | `git diff --check` | 통과 | 수정 당시 diff의 공백 오류 검사 |

단위 테스트 합계는 **288개**다. 대화 중 프론트 14개로 안내한 값은 집계 오류였고 실제 결과 13개로 정정했다. Admin 테스트 러너의 최상위 항목 수와 하위 테스트를 포함한 총 테스트 수는 다르며, 위 수치는 로그의 `tests`/`pass` 집계를 사용한다.

보고서 작성 시 이전 실행 로그의 말미를 다시 확인했다. Admin은 `/tmp/blank-admin-unit-test.log`, 프론트 원본 적용 후 결과는 `/tmp/front-isolation-installed-tests.log`에 남아 있었다. 임시 로그는 영구 보존 자료가 아니며, 재현 가능한 테스트 소스와 위 커밋을 기준으로 삼는다. 문서 작성만을 위해 테스트 전체를 다시 실행하지는 않았다.

신규 테스트는 가상 파일·DB·HTTP 응답으로 캐시 분리, 프로세스 재시작, 만료·손상·설정 누락, 서명 거절, 다른 스토어 요청의 처리 전 차단을 확인한다. 실제 DB·Shopify 호출, 배포 빌드, 브라우저 결제, 메일 발송, 부하 시험을 통과했다는 뜻은 아니다.

### 기존 작업과 이번 보고서의 경계

| 이전 대화의 항목 | 이번 보고서에서 인정하는 증거 |
| --- | --- |
| 크론 보완과 배포 후 확인 | 사용자가 완료했다고 알린 상태. 이번 환경 분리 검증에서 재실행하지 않음 |
| 테스트 작가 로그인 복귀 | 사용자가 정상 이동 화면을 제공함. 이후 변경된 두 커밋의 배포 검증을 대체하지 않음 |
| 대시보드 SQL 03–06 및 데이터 seed/cleanup | 이번 두 환경 분리 커밋의 변경 대상이 아님. SQL 재적용·데이터 삭제·정산 RPC 검증을 수행하지 않음 |
| 개발 Shopify와 Headless 설정 | 사용자 화면에서 생성·설정 진행을 확인함. 현재 토큰 유효성 및 웹훅 전체 목록을 원격으로 재검증하지 않음 |
| 과거 아키텍처 보고서의 완전 격리·100% 정상·빌드 성공 | 이번 작업에서 독립 확인하지 못한 주장. 현재 완료 판정의 근거로 사용하지 않음 |

이번 토큰 캐시 변경은 기존 `shopify_token_cache.id` TEXT 기본키를 사용하므로 새 SQL이 필요하지 않다. 기존 대시보드 마이그레이션의 적용 필요 여부까지 없어진다는 뜻은 아니다.

### 남은 작업과 완료 조건

1. **배포 대조:** 프론트 `a3042e0`, Admin `890007a` 또는 이를 포함한 후속 커밋이 각각 Preview에 배포됐는지 확인한다. Vercel의 환경별 Shopify·Supabase·Admin 주소와 수신거부 키 적용을 대조한다.
2. **조회와 로그인:** 개발 스토어 상품이 프론트 Preview에 표시되고, 로그인 후 같은 Preview로 돌아오는지 확인한다. Admin에서 연 상품 미리보기가 실제 Preview 프론트에서 정상 수신되는지도 확인한다.
3. **웹훅 구독:** 개발 스토어 주문이 Admin Preview로, 운영 스토어 주문이 운영 Admin으로 전달되는지 확인한다. 같은 앱의 공통 구독과 스토어별 구독을 구분하고 기존 운영 공통 주소를 Preview 주소로 바꾸지 않는다. 실제 설정이 맞지 않으면 403 거절만으로 개발 주문을 정상 수집할 수는 없다.
4. **시험 주문:** 개발 스토어의 테스트 결제를 준비하고 구매 기능을 활성화한 뒤 주문 1건을 생성한다. 테스트 Admin·DB에만 반영되고 운영 DB에 해당 시험 주문이 없는지 확인한다.
5. **이메일 경계:** 지정된 시험 수신자에게 생성한 링크가 Preview 주소를 가리키고 테스트 DB·개발 Shopify의 구독 상태만 변경하는지 확인한다. 같은 시험 링크를 운영에서 처리하면 거절돼야 한다.

실제 시험 결과에는 배포 커밋, 시험 시각, 대상 스토어·DB, HTTP 결과와 데이터 반영 여부를 남긴다. SQL 적용과 Git push는 사용자 수동 원칙을 유지한다. 남은 배포·외부 연동 검증이 완료되기 전에는 환경 전체를 검증 완료로 표시하지 않는다.


## 문의 전달 방식과 무료 한도 검토

2026-09-30: [문의 알림 검토](INQUIRY_DELIVERY.md)에 storefront `a3042e0`·admin `890007a`의 조회/구독 경로, 공식 요금제 문서와 사용자 확인 Free 기준을 대조했다. 하루 100/1,000/10,000 문의 세션 가정의 산술 계산을 Python으로 확인했다. 현재 실시간 구독은 관리자·작가에 존재하고 고객은 10초 조회 중인 점을 구분했다.

검증 범위는 코드 읽기·공식 문서 확인·계산·변경 문서의 로컬 링크와 diff 검사다. 앱 테스트는 문서만 변경하여 재실행하지 않았다. 실제 Vercel/Supabase 사용량·원격 RLS·E2E·부하·청구액은 미검증이며 가정상 95.6% 요청 감소를 실측 성과로 표시하지 않는다. 코드·SQL·설정·Git push 변경 없음.


### 문의 기준선 측정 도구 검증

2026-09-30 Admin `scripts/performance/inquiry-http-report.mjs`와 `inspect-inquiry-baseline.sql` 추가. HAR 집계 단위 시험 5개 통과(고정 관찰 시간, 요청 겹침, 실패/크기 누락, origin 격리, 비밀값 미출력, 잘못된 입력). Admin `npm run typecheck` 통과. 합성 HAR의 CLI 실행에서 10분·60요청을 6회/분과 본문 합계 122,880바이트로 집계하고 토큰·본문 미출력을 확인했다. 이 결과는 도구 검사이며 실제 사용량이 아니다.

SQL은 파일 작성/검토만 했고 DB 실행·실행 계획 검증은 하지 않았다. 당시 대시보드 수치·실제 HAR 자료는 대기 상태였다. 이후 사용자 제공 사용량은 아래 기록을 참조한다. 전체 앱 단위/빌드·브라우저 E2E·Realtime 부하 시험은 이번 도구 변경에서 재실행하지 않았다. 실행 절차와 자료 범위는 [공통 검토의 수집 절차](INQUIRY_DELIVERY.md#기준-사용량을-수집하는-실행-절차)에 둔다.


### 사용자 제공 Supabase와 Vercel 사용량

2026-09-30 실제 고객 0명 확인. Supabase Current billing cycle의 Egress 0.00 / 5 GB, DB 44 / 500 MB, MAU 3 / 50,000 등과 Vercel 함수 호출 6.6K / 1M, Fluid CPU 26m 40s / 4h, 메모리 2.5 / 360 GB-Hrs 등을 사용자 텍스트로 접수했다. [표와 해석](INQUIRY_DELIVERY.md#사용자-제공-사용량과-다음-판단)에 기록했다.

표시 한도 대비 비율만 산술 확인했다. 날짜 범위·프로젝트 필터·Realtime 사용량·문의 경로별 사용량은 미확인이다. 원격 계정 조회나 실측 테스트 완료가 아니며 현재 여유를 대규모 서비스 용량 보증으로 해석하지 않는다. 문서만 변경하여 앱 테스트는 재실행하지 않았다.


### 무료 테스트 환경의 문의 조회 개선

2026-09-30 사용자 단계 조정 D021에 따라 상세 비용 분석을 확대하지 않고 조회 간격·숨김/복귀·오류 재시도를 수정했다. Front `ConciergeChat.tsx`, `lib/inquiries/polling.ts`, `tests/unit/inquiry-polling.test.ts` 변경. 단위 테스트 총 19개(신규 6개 포함), 타입 검사 통과. 새 조회 제어/시험 파일 ESLint 통과. 전체 lint와 배포 빌드는 이번에 실행하지 않았다.

사용자의 테스트 DB 진단 결과와 가상 대화 2개/메시지 4개 준비 결과를 접수했다. 실제 익명 REST HEAD는 문의 두 테이블 모두 401, 서비스 역할의 준비된 문의 조회는 200이었다. 로컬 Chrome에서 실제 GET을 확인했으며 닫힌 상태는 1분당 6→1회였다. 열림/숨김/복귀 조건과 측정 한계는 [공통 결과](INQUIRY_DELIVERY.md#무료-테스트-환경의-조회-개선-결과)와 [비교 JSON](../../../blank-seoul-admin/scripts/performance/inquiry-polling-baseline.json)을 따른다.

SQL은 사용자가 실행했고 에이전트가 적용하지 않았다. 신규 private Broadcast, 미확인 배지, 메시지 페이지 조회, 쓰기/첨부/메일 시험, 운영 DB·Vercel 배포·실제 비용·부하 검증은 미완료다. 사용자 Git push와 Preview 확인이 다음 단계다.


## 문의 신뢰성·권한·알림 구현 검증

실행일: 2026-09-30. Admin `de67e02`, Storefront `a34907e` 이후의 미커밋 작업 트리를 검증했다. 구현 내용과 사용자 적용 순서는 [문의 전달 계약](INQUIRY_DELIVERY.md#문의-신뢰성알림-구현과-적용-절차)에 기록한다. 아래 결과는 원격 Supabase/Vercel 적용이나 출시 승인이 아니다.

| 검사 | 결과 | 확인한 범위 |
| --- | --- | --- |
| Admin `npm run typecheck` | 통과 | TypeScript 계약 |
| Storefront `npm run typecheck` | 통과 | TypeScript 계약 |
| Admin `npm run test:unit` | 292/292 통과 | 기존 회귀와 문의 권한·전송·응답 계약·메일 공급자 오류 처리 |
| Storefront `npm run test:unit` | 23/23 통과 | 조건부 폴링, 실시간 연결 중 정기 조회 중지와 오류 fallback, 요청 키·메시지 병합 |
| Admin `node --import tsx --test tests/unit/inquiry-ui.test.ts` | 마지막 읽음 실패 보완 후 2/2 통과 | 실제 고객 컴포넌트의 미확인 배지·읽음 실패 재조회·전송 실패 입력/요청 키 유지·중복 방지; 알림 훅의 재인가·힌트 병합·숨김 해제 |
| Admin `tests/integration/inquiry-delivery.mjs` | 15/15 시나리오 통과 | 임시 로컬 PostgreSQL에서 SQL 07–09 실제 실행: 동시성·트랜잭션·권한·페이지·알림 범위·메일 작업 복구 |
| 신규 문의 공통 모듈 ESLint | 통과 | `clientDelivery`, `deliveryContract`, `saveMessage`, `signalLease`, `useInquirySignals`, `notificationManager` |
| 양쪽 `git diff --check` | 통과 | 변경 파일 공백 오류 |

단위/JSDOM 시험은 HTTP·인증·Supabase 연결을 대역으로 사용한다. 실제 컴포넌트 코드를 실행했지만 Chrome·모바일 화면의 시각 검증이나 배포 E2E는 아니다. 읽음 실패 보완 후 관련 UI 시험을 재실행했으며, 위 전체 단위 테스트 수와 별개의 추가 기능 수로 합산하지 않는다.

SQL 통합 시험은 `.env`를 읽지 않고 임의 loopback 포트에 생성한 일회용 PostgreSQL에서 실행했다. 원격 DB에는 연결하지 않는다. Supabase 전용 `realtime.send`/`realtime.topic`은 로컬 함수로 대체하고 `anon`·`authenticated`·`service_role` 역할로 RLS를 검사했다. 따라서 실제 Supabase 채널 가입과 캐시된 연결 권한의 동작까지 증명하지 않는다.

재현 명령(Admin 디렉터리):

```sh
npm install --prefix /tmp/blank-inquiry-test embedded-postgres pg
INQUIRY_TEST_MODULE_ROOT=/tmp/blank-inquiry-test node tests/integration/inquiry-delivery.mjs
```

핵심 SQL 확인 사항:

- 동일 요청의 동시 실행은 대화/첫 메시지와 일반 메시지를 한 번만 저장하며, 첫 메시지 실패 시 새 대화도 롤백한다. 같은 키로 다른 내용을 보내면 거부한다.
- 고객 응답에 내부 중계·감사·내부 결정·직원 메타데이터가 포함되지 않는다. 만료/직원 대화 조회와 만료/SPAM 고객 전송을 거부한다.
- 고객 읽음은 요청한 자기 대화의 공개 관리자 메시지에만 적용된다. 동일 시각 메시지를 포함한 이력은 50개 이하의 페이지로 중복 없이 조회된다.
- 고객 알림에는 본문이 없고, 내부 변경은 허용된 직원에게만 전달된다. 다른 topic·직접 테이블 읽기·브라우저 알림 위조를 거부한다. 별도의 permissive 정책이 존재해도 해당 topic namespace 제한이 유지된다.
- 자격 만료와 작가 배정 회수 후에는 기존 가입 상태를 가정해도 새 알림 발행이 중단된다.
- 공개 답변의 메일 작업은 저장 트랜잭션 안에서 예약된다. 읽은 메시지는 최초 발송 대상에서 제외하며 연속 답변을 묶는다. 재시도 수신자/본문 고정, 오래된 claim 완료 거부, 공급자 idempotency 보존 기간 전 자동 재시도 중단을 확인했다.

**미실행:** 프로덕션 빌드, 실제 브라우저 양쪽 앱 E2E, Supabase private Broadcast 연결, 실제 Resend 수신, 스케줄러 등록, Vercel Preview 배포, 실사용 비용·부하 측정. 운영/시험 Supabase SQL과 Git push는 수행하지 않았다. 실시간/메일 플래그는 기본 false이므로 로컬 구현 완료를 실시간 운영 개시로 간주하지 않는다.

다음 완료 증거는 [적용 순서](INQUIRY_DELIVERY.md#적용-순서)에 따라 테스트 DB에 SQL을 적용하고 Preview에서 고객 두 명·배정/미배정 작가·관리자 간 격리, 전송 재시도, 연결 복구, 시험 이메일 도착을 확인하는 것이다.


## 로컬 환경변수와 외부 호출 경계 보완 검증

2026-09-30. [환경 연결 보완](../environment-isolation.md#2026-09-30-로컬-환경변수-보완)에 따른 추가 변경이다. Admin/Storefront 로컬 파일 4개를 dotenv로 파싱해 중복 키 없음, 환경 내 공통 키 일치, 테스트/운영 비밀값 분리, 로컬 연결 주소, 이메일·실제 우체국 접수 기본 비활성을 확인했다. 검사 출력에는 비밀값을 포함하지 않았다.

- Admin 전체 단위 테스트 **297/297 통과**, TypeScript 검사 통과.
- 신규 `tests/unit/environment-config.test.ts` **5/5 통과**: NODE_ENV로 운영 접수 승격 불가, 요청 본문/Preview가 서버 설정을 우회하지 못함, 캐시 갱신 설정/운영 주소 경계, 실제 접수 함수의 암호화·HTTP 이전 거절, 미설정/오인증 팝빌 webhook의 DB 접근 차단.
- 신규 환경 정책 모듈과 캐시 갱신 모듈 ESLint, `git diff --check` 통과.
- Frontend 앱 소스는 변경하지 않았다. 기존 코드의 HTTP 응답/외부 서비스는 대역으로 검증했으며 실제 우체국 접수·취소·팝빌 콜백·메일 발송·원격 환경변수 변경·배포·Git push는 수행하지 않았다.

사용자가 앞서 보고한 문의 SQL 적용·배포 성공과 이번 미배포 보완을 구분한다. 로컬 키를 바꾼 것만으로 Vercel 및 외부 스케줄러의 자격증명이 갱신되지는 않는다.


## Vercel 등록 환경변수 읽기 검증

### 2026-10-01: 사용자 1·2번 설정 후 재조회

Admin 프로젝트만 읽기 전용으로 재조회했다. 아래의 9월 30일 전체 감사는 당시 기록이며, 이번 결과로 해당 등록 상태를 갱신한다. Production 코드블록 10개는 모두 기대값과 일치한다. Preview 11개 중 10개가 일치하며 **`POPBILL_IS_TEST`만 실제 false / 기대 true**다. `NEXT_PUBLIC_POPBILL_IS_TEST=true`이므로 현재 Preview 서버 모드와 화면 모드가 다르다. Preview의 서버 변수만 true로 수정해야 하며 Production false는 유지한다. Preview dev 전용 override는 없다.

| 범위 | 등록값 판정 | 현재 배포 |
| --- | --- | --- |
| Production | 10/10 일치 | 9월 30일 22:44:41 KST 배포, SHA `9dc6b47`, 설정 변경 전 |
| Preview(dev) | 10/11 일치, POPBILL_IS_TEST 수정 필요 | 9월 30일 22:40:28 KST 배포, SHA `9dc6b47`, 설정 변경 전 |

현재 배포 환경변수 키 목록에는 새로 추가한 Production 8개·Preview 9개가 없고, 조회 대상 변수의 수정 시각이 배포 생성보다 늦다. 따라서 **Vercel 등록 완료와 배포 반영 완료를 구분하며 현재는 재배포가 필요하다.** Production EPOST_USE_PROD는 여전히 미등록이지만 앞서 2번의 코드블록에는 포함되지 않고 실제 배송 접수 여부에 따른 조건부 항목이었으므로 10/10 판정에서 제외했다.

우체국 보호 코드는 로컬 미커밋 상태다. Preview EPOST_USE_PROD=false를 등록한 것만으로 현재 배포 코드의 운영 접수 선택을 차단한다고 판정하지 않는다. 다음은 Preview POPBILL_IS_TEST 수정과 보호 코드 검토·사용자 push 후 재배포다. 이번에는 3–5번 비밀값/선택 기능이나 프론트 설정을 다시 검사하거나 변경하지 않았다. 원격 설정·배포는 변경하지 않았고 원본 임시 다운로드는 검사 후 삭제했다.

### 2026-09-30 전체 감사 기록

2026-09-30. 사용자 요청에 따라 프론트·어드민의 **현재 등록값, Production/dev Preview 배포, 실제 코드 사용처**를 읽기 전용으로 대조했다. 이 절은 앞선 일부 변수 비교를 확장한 결과다. 기여 목표는 R03의 데이터 환경 일치, R11의 운영·외부 연동 설정 누락 방지이며 M01–M12 공통 배포 계약을 다룬다.

**판정: DB·Shopify 대상과 프론트 연결 주소는 분리됐지만, 외부 호출·알림 주소·일부 비밀값은 아직 환경 격리가 끝나지 않았다.** 등록되지 않은 변수가 모두 오류인 것은 아니다. 필수 연결, 기능별 필수, 안전한 기본값, 대체 이름, 현재 사용하지 않는 항목을 아래에서 구분한다. 원격 설정 변경·앱 코드 수정·배포·SQL 적용·실제 메일/배송/콜백 호출은 하지 않았다.

### 조회 범위와 한계

- 팀 `thec9rqwer-4072s-projects`, 프로젝트 `blank-seoul-admin` / `blank-seoul-storefront`의 환경변수 전체 목록을 조회했다. Admin은 등록 행 51개(Production 44개, Preview 29개), 프론트는 등록 행 25개(각 환경 16개)다. 한 행이 여러 환경에 적용되므로 합산 수와 다르다.
- `dev` 브랜치 전용 override는 두 프로젝트 모두 0개다. 일반 Preview 등록값을 상속한다. 다른 임의 브랜치 전용 override를 별도로 조회한 감사는 아니다.
- Admin 650개, 프론트 165개의 앱·라이브러리·이메일·루트 실행 설정 소스를 정적으로 검사했다. 직접/문자열 인덱스/구조 분해 `process.env` 참조와 환경 객체를 받는 정책 함수까지 대조했다. 고유 참조 키는 Admin 61개, 프론트 24개(플랫폼 변수·미사용 컴포넌트 포함)다. 스크립트·scratch·시험 전용 변수는 배포 필수 목록에 합산하지 않았다.
- `env ls`의 암호문으로 값 일치를 판단하지 않았다. `env pull`로 읽을 수 있는 값만 보호된 임시 파일에서 비교하고, Sensitive는 등록 여부·범위만 확인했다. 읽을 수 있는 등록값에 빈 값·앞뒤 공백은 없었다.
- 네 배포 API의 환경변수 **키 목록**에 각 환경의 등록 키가 모두 포함된다. 누락으로 분류한 신규 핵심 키도 배포 목록에 없다. 등록값 수정 시각은 해당 배포 생성 시각보다 늦지 않았다. 다만 `env pull --id`는 실패해 **배포 당시 값 전체와 현재 등록값의 동일성은 미검증**이다.
- Supabase 키의 JWT 프로젝트 식별자·역할·만료 시각은 각 URL과 일치했다. 로컬 기대값과도 일치한다. JWT 서명 유효성, 실제 DB 권한·스키마와 공급자 인증 성공을 외부 호출로 검증한 것은 아니다.
- 내려받은 비밀값·원본 API 응답은 보고서에 저장하지 않고 비교 후 삭제했다. Sensitive 값은 복호화를 우회하지 않았다. [Vercel Secret 조회 제한](https://vercel.com/docs/environment-variables/sensitive-environment-variables)을 따른다.

### 현재 배포와 미배포 변경

| 프로젝트 | 환경 | 배포 생성 시각(KST) | Git SHA | 상태 |
| --- | --- | --- | --- | --- |
| blank-seoul-admin | production / main | 2026-09-30 22:44:41 | `9dc6b47` | READY |
| blank-seoul-admin | preview / dev | 2026-09-30 22:40:28 | `9dc6b47` | READY |
| blank-seoul-storefront | production / main | 2026-09-30 22:44:54 | `9ba2c2f` | READY |
| blank-seoul-storefront | preview / dev | 2026-09-30 22:40:53 | `9ba2c2f` | READY |

각 프로젝트의 운영·Preview가 같은 커밋을 사용하며 로컬 HEAD와도 일치한다. 그러나 Admin의 현재 미커밋 `lib/config/environmentIsolation.ts`, `lib/epost/client.ts`, `lib/shopify/revalidate.ts`, `app/api/tax-invoice/webhook/route.ts` 보완은 네 배포에 포함되지 않는다. 아래에서 배포된 코드와 보완 후 동작을 구분한다. READY는 기능 검증 통과를 의미하지 않는다.

### 우선 해결할 사항

| 우선순위 | 대상·현재 상태 | 영향과 필요한 조치 |
| --- | --- | --- |
| 높음 | Admin Preview `STOREFRONT_REVALIDATE_URLS=https://blankseoul.com` | 시험 상품/프로필 변경이 운영 캐시 갱신을 요청한다. Preview 프론트 origin으로 변경한다. `REVALIDATE_SECRET`도 환경별로 나누고 같은 환경의 두 프로젝트에서 일치시킨다. 현재 양쪽 키는 서로 맞지만 운영·시험이 같은 값이다. |
| 높음 | Admin Preview `POPBILL_IS_TEST=false` | 시험 계좌 확인·세금계산서·알림 경로가 실사용 모드다. Preview는 `true`; `NEXT_PUBLIC_POPBILL_IS_TEST=true`도 설정한다. Production의 기존 `false`는 실사용 의도 확인 없이 변경하지 않는다. 공개 플래그는 화면 표시용이며 서버 모드를 대체하지 않는다. |
| 높음 | Admin 양쪽 `EPOST_USE_PROD` 미등록 + 배포된 우체국 코드 | 배포 코드는 요청의 명시 모드를 우선하고, 미지정 시 `NODE_ENV=production`이면 운영 접수를 선택한다. **Preview에 false만 넣어도 이 배포 코드에서는 충분하지 않다.** 로컬 보호 코드 배포와 Preview false 설정을 함께 적용한다. Production은 실제 접수할 때만 true. 접수확인/취소는 별도 공용 경로여서 접수 가드만으로 전체 우체국 격리를 보장하지 않는다. |
| 높음 | Admin 양쪽 `POPBILL_WEBHOOK_SECRET` 미등록 | 배포된 핸들러는 미설정 시 자체 secret 검증을 생략한다. 그러나 `proxy.ts`가 이 경로를 공개 콜백으로 허용하지 않아 일반 공급자 요청은 관리자 인증에서 차단될 수 있다. **외부에 무인증으로 열려 있다고 단정하지 않는다.** secret과 공급자 전송 설정을 맞추고, 로컬 fail-closed 보완 및 proxy 콜백 허용을 함께 검토해야 한다. 값만 추가하면 콜백이 정상화되는 상태가 아니다. |
| 높음 | Admin 양쪽 `NEXT_PUBLIC_BASE_URL`·`NEXT_PUBLIC_STORE_PREVIEW_URL` 미등록 | 알림은 운영 Admin 기본주소(일부는 다른 admin 도메인), 상품 미리보기 iframe은 운영 스토어로 향한다. 특히 Preview는 프론트의 origin 검증과 충돌한다. 환경별 주소를 명시한다. |
| 기능 필수 | 프론트 양쪽 `RESEND_WEBHOOK_SECRET` 미등록 | `/api/webhooks/resend`가 503을 반환하도록 구현돼 있어 반송·스팸 신고에 따른 마케팅 수신 동의 동기화를 받을 수 없다. Resend의 해당 endpoint signing secret을 등록한다. 임의 생성 키나 RESEND_API_KEY로 대체하지 않는다. Preview 이벤트도 테스트 전용 수신 경로와 맞춘다. |
| 기능 필수 | Admin 양쪽 `INQUIRY_REALTIME_ENABLED` 미등록 | SQL·배포 여부와 별개로 실시간 힌트가 꺼진다. Preview true로 기능 검증 후 운영 활성화를 결정한다. 기존 조회 동작 자체가 모두 중단되는 것은 아니다. |
| 기능 필수 | Admin 양쪽 `CRON_SECRET`·`STOREFRONT_URL` 미등록, `INQUIRY_EMAIL_ENABLED` 미등록 | 문의 메일은 기본 꺼짐. 문의 worker는 CRON_SECRET부터 검사하므로 미설정이면 503이며 PIPELINE_SECRET로 대체되지 않는다. 켤 때는 세 변수와 RESEND 키, 실제 스케줄러가 필요하다. false 상태에서는 STOREFRONT_URL 누락이 현재 메일 발송 장애라는 뜻은 아니다. |
| 기능 필수 | Admin 양쪽 `BIZ_REG_NO` 미등록 | EMS 엑셀 생성과 HS 검증 요청의 사업자번호가 빈 값으로 생성된다. 해당 기능 사용 시 실제 계약과 일치하는 번호를 명시한다. 일반 상품 조회의 필수 변수는 아니다. |

핵심 근거(Admin 상대경로): `lib/epost/client.ts` 및 배포 SHA의 동일 파일, `proxy.ts:30`, `app/api/tax-invoice/webhook/route.ts:20`, `app/artist/dashboard/components/StorePreviewModal.tsx:30`, `lib/notifications/popbillKakao.ts:158,523`, `app/api/cron/send-inquiry-emails/route.ts:9`, `lib/inquiries/notificationManager.ts:6`, `lib/pipeline/modules/ems-builder/index.ts:80`. 프론트 근거: `app/api/webhooks/resend/route.ts:58`, `app/product/preview/page.tsx`.

### 등록할 값의 기준

아래 주소 약칭은 설명용이며 새 환경변수 이름이 아니다.

| 주소 | Production | Preview(dev) |
| --- | --- | --- |
| F: 프론트 origin | `https://blankseoul.com` | `https://blank-seoul-storefront-git-dev-thec9rqwer-4072s-projects.vercel.app` |
| A: 어드민 origin | `https://blank-seoul-admin.vercel.app` | `https://blank-seoul-admin-git-dev-thec9rqwer-4072s-projects.vercel.app` |
| DB | `https://feezosccyvecmrhqrkgl.supabase.co` | `https://zijvqethklunvydtqmak.supabase.co` |
| Shopify 도메인 | `tv7r0x-zn.myshopify.com` | `blank-seoul-dev.myshopify.com` |

| 프로젝트 / 변수 | Production | Preview | 현재 판정 |
| --- | --- | --- | --- |
| 양쪽 / Supabase URL·anon·service role | 운영 DB의 현재 값 | 테스트 DB의 현재 값 | 분리 확인, 유지 |
| Admin / `SHOPIFY_STORE_URL` | 운영 Shopify 도메인 | 개발 Shopify 도메인 | 분리 확인, 유지 |
| 프론트 / Shopify 도메인·Storefront 공개 토큰 | 운영 스토어 값 | 개발 스토어 값 | 분리 확인, 유지 |
| 프론트 / `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_API_URL` | F, A | F, A | 분리 확인, 유지 |
| Admin / `NEXT_PUBLIC_BASE_URL` | A | A | 양쪽 추가 |
| Admin / `NEXT_PUBLIC_STORE_PREVIEW_URL` | F + `/product/preview` | F + `/product/preview` | 양쪽 추가 |
| Admin / `NEXT_PUBLIC_SHOPIFY_STORE_URL` | 운영 Shopify 도메인 | 개발 Shopify 도메인 | 양쪽 추가 권장. 보류 주문의 Shopify 링크용 |
| Admin / `STOREFRONT_REVALIDATE_URLS` | F 유지 | F로 수정 | Preview 변경 |
| 양쪽 / `REVALIDATE_SECRET` | 기존 운영 키 유지 | 별도 시험 키, 같은 환경의 양쪽 동일 | Preview 쌍을 함께 변경 |
| Admin / `POPBILL_IS_TEST` | 현재 false 유지, 실사용 정책 확인 | true | Preview 변경 |
| Admin / `NEXT_PUBLIC_POPBILL_IS_TEST` | 서버 모드와 동일 | true | 양쪽 명시 권장 |
| Admin / `EPOST_USE_PROD` | 실제 접수 운영 시 true, 그 외 false | false | 보호 코드 배포와 함께 설정 |
| Admin / `POPBILL_WEBHOOK_SECRET` | 운영 콜백과 같은 키 | 시험 콜백과 같은 별도 키 | 공급자·proxy 경로도 함께 검토 |
| Admin / `INQUIRY_REALTIME_ENABLED` | Preview 검증 전 false | true | 단계적 활성화 |
| Admin / `INQUIRY_EMAIL_ENABLED` | 발송 검증 전 false | 우선 false | 의도적 비활성 명시 |
| Admin / `STOREFRONT_URL` | F | F | 문의 메일 활성화 전 필수 |
| Admin / `CRON_SECRET` | Admin 운영 worker 호출자와 일치 | 별도 시험 worker 키 | 문의 worker 사용 전 추가 |
| Admin / `PIPELINE_SECRET` | 기존 운영 호출자와 일치 | 운영과 다른 시험 키 | 현재 공용이므로 Preview 분리 |
| 프론트 / `CRON_SECRET` | 기존 운영 호출자와 일치 | 운영과 다른 시험 키 | 현재 공용이므로 Preview 분리 |
| 프론트 / `RESEND_WEBHOOK_SECRET` | 운영 endpoint signing secret | 시험 endpoint signing secret | webhook 사용 시 양쪽 추가 |
| 프론트 / `UNSUBSCRIBE_SECRET` | 기존 값 유지 | 현재 분리된 시험 키 유지 | 등록 분리 확인; 운영 값은 Sensitive라 대조 불가 |
| 프론트 / `NEXT_PUBLIC_STORE_LAUNCH_STATUS` | 현재 preview 유지; 판매 개시 때 live | 구매 시험을 할 때 live | Vercel 배포 유형과 별개. 현재 양쪽 구매 비활성 |
| Admin / `BYPASS_AUTH` | false 또는 미등록 | false 또는 미등록 | 현재 미등록은 안전. 로컬 true를 복사하지 않음 |
| Admin / `NEXT_PUBLIC_APP_ENV` | production(선택) | preview(선택) | VERCEL_ENV로 판별하므로 Vercel 필수 아님 |

Admin과 프론트의 CRON_SECRET은 **같을 필요가 없다**. 같은 환경에서 각각의 호출자와 맞추는 것이 조건이다. Admin의 기존 `process-sync-jobs`, `send-artist-emails`는 CRON_SECRET이 생기면 PIPELINE_SECRET보다 우선 사용한다. 따라서 CRON_SECRET을 추가할 때 해당 스케줄러 Authorization도 함께 맞추지 않으면 기존 호출이 401로 바뀔 수 있다(`requireCronSecret`은 첫 번째 설정값을 선택). `auto-pipeline`은 PIPELINE_SECRET을 계속 사용한다.

### 선택 기능과 현재 사용하지 않는 등록값

- `POPBILL_KAKAO_TEMPLATE_APPROVAL`, `POPBILL_KAKAO_TEMPLATE_TAX_INVOICE`, `POPBILL_KAKAO_TEMPLATE_TAX_CERT_REQUIRED`는 양쪽 누락이다. 승인된 템플릿으로 해당 알림톡을 보낼 때 필요하다. 미설정 시 일부 경로는 LMS로 대체하므로 “알림 전체 실패”로 분류하지 않는다. `POPBILL_KAKAO_TEMPLATE_TAX_APPROVED`는 TAX_INVOICE의 대체 이름이어서 둘 다 추가할 필요 없다. ORDER 템플릿은 이미 등록됐다.
- `EPOST_KPACKET_APPR_NO`는 등록된 EPOST_APPR_NO로 대체된다. `EPOST_EMS_APPR_NO`는 코드 기본 승인번호로 대체된다. 누락으로 전체 배송 불가라고 단정할 수 없지만 EMS를 사용할 계약의 승인번호는 명시·확인해야 한다.
- `SHOPIFY_WEBHOOK_SECRET`은 현재 SHOPIFY_CLIENT_SECRET로 대체된다. 앱이 관리하는 webhook이면 맞을 수 있으나 다른 방식으로 발급한 webhook signing secret을 쓰면 별도 등록해야 한다. 임의 새 키로 채우면 서명이 불일치한다. 공급자의 실제 webhook 생성 방식은 미검증이다.
- 같은 Shopify 앱을 두 스토어에 설치한 구조에서는 Client ID/Secret 공유 자체를 결함으로 분류하지 않는다. Admin은 읽을 수 있는 값이 로컬과 일치했고 프론트 앱 키는 Sensitive라 값 대조를 못 했다. 스토어별 앱 설치·권한·토큰 발급 성공은 별도 검증이다.
- `SHOPIFY_ACCESS_TOKEN`은 이전 방식의 대체 토큰이며 현재 OAuth 설정을 사용하는 데 필수 추가가 아니다. `SHOPIFY_LOCATION_ID`는 미설정 시 조회 경로로 위치를 선택하므로 여러 위치를 운영할 때 명시할지 결정한다.
- `GEMINI_API_KEY`, `DEEPL_API_KEY`, `GOOGLE_TRANSLATE_API_KEY`는 선택 기능이다. 미설정 시 분류/번역 대체 로직이 있다. `OPENAI_API_KEY`는 이름을 읽지만 해당 분류 경로가 실제 OpenAI 호출을 구현하지 않아 이것만 추가해도 LLM 기능이 켜지지 않는다.
- `ADMIN_ALERT_EMAIL`, `ADMIN_TAX_EMAIL`은 기존 기본 수신자가 있다. 시험 알림을 운영 지원 주소로 보내지 않으려면 테스트 수신자를 명시한다. 전역 발송 차단 변수는 아니며 실제 주문·작가 수신자는 별도로 결정된다.
- `SHIPPER_NAME/ADDRESS/CITY`는 food PN 경로용이다. 현재 보류 사업이므로 지금의 한국 제조 일반 상품 출시 필수값으로 추가하지 않는다. `NEXT_PUBLIC_STORE_TIMEZONE` 기본 Asia/Seoul, 프론트 `NEXT_PUBLIC_CANCEL_WINDOW_HOURS` 등록값 3은 현재 기준과 맞는다.
- Admin의 `NEXT_PUBLIC_STORE_LAUNCH_STATUS`, Kakao 4종(`KAKAO_APP_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REST_API_KEY`, `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`)과 STORAGE 계열 15개는 검사한 앱 실행 소스에서 직접 소비되지 않는다. STORAGE 계열은 별도 연결/과거 설정 여부를 확인한 뒤 정리하며 Preview에 무조건 복사하지 않는다. Supabase 대시보드의 OAuth 설정 존재 여부를 Vercel 변수 유무로 판단하지 않는다.
- 프론트 `NEXT_PUBLIC_CRISP_WEBSITE_ID`는 CrispChat 컴포넌트에서 읽지만 이 컴포넌트의 import/렌더 사용처가 현재 앱에서 발견되지 않았다. 현재 자체 문의 기능을 활성화하는 키가 아니다. `POPBILL_PLUS_FRIEND_ID`도 상수 선언 후 사용처가 발견되지 않았다.
- 프론트 `ADMIN_API_URL`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`은 이미 등록된 정식 이름의 대체값이므로 추가할 필요 없다. `UNSUBSCRIBE_ACCEPT_LEGACY`는 운영 기존 메일 호환 정책이므로 임의 false 설정하지 않는다. `STOREFRONT_OFFLINE_CHECK`는 오프라인 빌드 점검용이며 배포에 추가하지 않는다.
- `NODE_ENV`, `VERCEL`, `VERCEL_ENV`는 일반 앱 누락과 구분한다. 실제 배포에 VERCEL_ENV 키가 있고 Preview에서도 Next.js 프로덕션 빌드가 실행되므로 NODE_ENV를 테스트 DB 판별에 사용하면 안 된다. [Vercel 시스템 변수](https://vercel.com/docs/environment-variables/system-environment-variables)를 참고한다.

### 변수 외에 남은 연결 계약

1. **팝빌 콜백 경로:** secret 검증을 강제한 상태에서 공급자 호출이 proxy 인증을 통과하도록 좁게 설계하고 검증해야 한다. 아직 적용하지 않았다.
2. **메일·배송 공급자:** Resend/17Track/우체국/팝빌 계정 키를 공유하면 테스트 DB라고 해서 외부 발송·등록이 자동 격리되지 않는다. INQUIRY_EMAIL_ENABLED=false는 문의 답변 worker만 끄며 다른 이메일을 끄지 않는다. 현재 공급자별 시험 계정·발송 제한과 callback 대상은 미검증이다.
3. **기존 코드의 경계:** `lib/tracking/17track-client.ts:67`은 secret이 있어도 서명 헤더 누락을 통과시키는 분기가 있다. `lib/services/popbill/client.ts:7`에는 비밀키 형태의 하드코딩 fallback이 있다(값 미기록, 유효성 미검증). 변수 추가만으로 이 두 문제가 해소되지는 않는다. 별도 코드 보완 대상으로 남긴다.
4. **캐시 갱신:** 로컬 신규 가드는 공통 Shopify revalidate 함수에 적용됐다. `app/api/artist/profile/route.ts`와 `app/api/manage/artists/rename-requests/route.ts`의 직접 fetch 경로는 이 가드를 사용하지 않는다. 올바른 Preview 주소/키 설정이 계속 필요하며 모든 경로의 강제 격리는 후속 보완이다.
5. **스케줄러:** 프론트 vercel.json의 crons는 빈 배열, Admin에는 vercel.json이 없다. 변수 등록만으로 문의 worker가 주기 실행되지는 않는다. 외부 cron-job/GitHub Actions의 실제 예약·대상·Bearer 설정은 이번 Vercel 환경변수 감사에서 확인하지 않았다.
6. **로그인·스토어·배포 보호:** 각 Supabase의 redirect 허용 주소, Shopify 개발 스토어 앱 설치·webhook 대상·권한, Vercel Preview 보호가 서버 간 문의와 webhook을 막는지는 별도 실행 확인이 필요하다. 여기에 사용되는 보호용 secret을 NEXT_PUBLIC 변수로 노출하는 방식은 사용하지 않는다.

권장 적용 순서는 **Preview 주소·모드·비밀값 분리 → Admin 미배포 보호 코드와 콜백 경로 검토 → 사용자 push 및 Preview 재배포 → 로그인/미리보기/문의 실시간/콜백 시험 → Production에 검증된 설정 반영**이다. Production 키나 판매 상태를 로컬 파일과 다르다는 이유만으로 바꾸지 않는다. 환경변수 변경은 새 배포에 적용되며 특히 NEXT_PUBLIC 값은 새 빌드가 필요하다. [Vercel 환경변수 관리](https://vercel.com/docs/environment-variables/managing-environment-variables).

### 전체 키 대조표

`등록`은 읽을 수 있는 비어 있지 않은 값, `Sensitive`는 등록·범위만 확인, `미등록`은 사용자 등록 항목 없음이다. **행의 상태만으로 필수/오류를 판단하지 말고 위 기능 분류를 함께 읽는다.** 근거 링크는 두 저장소의 현재 작업 트리이며, Admin 미배포 파일은 위에서 따로 명시했다. 등록된 미사용 키도 빠짐없이 포함했다.

#### blank-seoul-admin

| 변수 | Production | Preview | 코드 참조(대표) |
| --- | --- | --- | --- |
| `ADMIN_ALERT_EMAIL` | 미등록 | 미등록 | [emails/index.ts:290](../../../blank-seoul-admin/emails/index.ts) |
| `ADMIN_TAX_EMAIL` | 미등록 | 미등록 | [app/api/admin/tax-invoices/reverse-issue/route.ts:122](../../../blank-seoul-admin/app/api/admin/tax-invoices/reverse-issue/route.ts) |
| `BIZ_REG_NO` | 미등록 | 미등록 | [app/api/admin/hscode/validate/route.ts:77](../../../blank-seoul-admin/app/api/admin/hscode/validate/route.ts) |
| `BYPASS_AUTH` | 미등록 | 미등록 | [lib/security/roles.ts:9](../../../blank-seoul-admin/lib/security/roles.ts) |
| `CRON_SECRET` | 미등록 | 미등록 | [app/api/cron/process-sync-jobs/route.ts:17](../../../blank-seoul-admin/app/api/cron/process-sync-jobs/route.ts) |
| `DEEPL_API_KEY` | 미등록 | 미등록 | [lib/translation/translator.ts:227](../../../blank-seoul-admin/lib/translation/translator.ts) |
| `EPOST_API_KEY` | 등록 | 등록 | [lib/epost/client.ts:20](../../../blank-seoul-admin/lib/epost/client.ts) |
| `EPOST_APPR_NO` | 등록 | 등록 | [app/api/admin/hscode/validate/route.ts:20](../../../blank-seoul-admin/app/api/admin/hscode/validate/route.ts) |
| `EPOST_CUST_NO` | 등록 | 등록 | [app/api/admin/hscode/validate/route.ts:19](../../../blank-seoul-admin/app/api/admin/hscode/validate/route.ts) |
| `EPOST_EMS_APPR_NO` | 미등록 | 미등록 | [lib/epost/client.ts:18](../../../blank-seoul-admin/lib/epost/client.ts) |
| `EPOST_KPACKET_APPR_NO` | 미등록 | 미등록 | [app/api/admin/hscode/validate/route.ts:20](../../../blank-seoul-admin/app/api/admin/hscode/validate/route.ts) |
| `EPOST_SEED_KEY` | 등록 | 등록 | [lib/epost/client.ts:21](../../../blank-seoul-admin/lib/epost/client.ts) |
| `EPOST_USE_PROD` | 미등록 | 미등록 | [lib/config/environmentIsolation.ts](../../../blank-seoul-admin/lib/config/environmentIsolation.ts) |
| `GEMINI_API_KEY` | 미등록 | 미등록 | [app/api/manage/auto-categorize/route.ts:27](../../../blank-seoul-admin/app/api/manage/auto-categorize/route.ts) |
| `GOOGLE_TRANSLATE_API_KEY` | 미등록 | 미등록 | [lib/translation/translator.ts:239](../../../blank-seoul-admin/lib/translation/translator.ts) |
| `INQUIRY_EMAIL_ENABLED` | 미등록 | 미등록 | [app/api/cron/send-inquiry-emails/route.ts:11](../../../blank-seoul-admin/app/api/cron/send-inquiry-emails/route.ts) |
| `INQUIRY_REALTIME_ENABLED` | 미등록 | 미등록 | [lib/inquiries/signalLease.ts:4](../../../blank-seoul-admin/lib/inquiries/signalLease.ts) |
| `KAKAO_APP_ID` | Sensitive | Sensitive | 직접 참조 없음 |
| `KAKAO_CLIENT_SECRET` | Sensitive | Sensitive | 직접 참조 없음 |
| `KAKAO_REST_API_KEY` | Sensitive | Sensitive | 직접 참조 없음 |
| `NEXT_PUBLIC_APP_ENV` | 미등록 | 미등록 | [lib/config/environmentIsolation.ts](../../../blank-seoul-admin/lib/config/environmentIsolation.ts) |
| `NEXT_PUBLIC_BASE_URL` | 미등록 | 미등록 | [app/api/cron/send-artist-emails/route.ts:170](../../../blank-seoul-admin/app/api/cron/send-artist-emails/route.ts) |
| `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` | 등록 | 등록 | 직접 참조 없음 |
| `NEXT_PUBLIC_POPBILL_IS_TEST` | 미등록 | 미등록 | [app/artist/dashboard/components/settlement/useSettlementWizard.ts:56](../../../blank-seoul-admin/app/artist/dashboard/components/settlement/useSettlementWizard.ts) |
| `NEXT_PUBLIC_SHOPIFY_STORE_URL` | 미등록 | 미등록 | [app/components/SkippedOrdersList.tsx:54](../../../blank-seoul-admin/app/components/SkippedOrdersList.tsx) |
| `NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY` | 등록 | 미등록 | 직접 참조 없음 |
| `NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY` | 등록 | 미등록 | 직접 참조 없음 |
| `NEXT_PUBLIC_STORAGE_SUPABASE_URL` | 등록 | 미등록 | 직접 참조 없음 |
| `NEXT_PUBLIC_STOREFRONT_URL` | 미등록 | 미등록 | [lib/config/environmentIsolation.ts](../../../blank-seoul-admin/lib/config/environmentIsolation.ts) |
| `NEXT_PUBLIC_STORE_LAUNCH_STATUS` | 등록 | 등록 | 직접 참조 없음 |
| `NEXT_PUBLIC_STORE_PREVIEW_URL` | 미등록 | 미등록 | [app/artist/dashboard/components/StorePreviewModal.tsx:30](../../../blank-seoul-admin/app/artist/dashboard/components/StorePreviewModal.tsx) |
| `NEXT_PUBLIC_STORE_TIMEZONE` | 미등록 | 미등록 | [app/api/orders/route.ts:11](../../../blank-seoul-admin/app/api/orders/route.ts) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 등록 | 등록 | [app/api/apply-shopify-categories/route.ts:7](../../../blank-seoul-admin/app/api/apply-shopify-categories/route.ts) |
| `NEXT_PUBLIC_SUPABASE_URL` | 등록 | 등록 | [app/api/apply-shopify-categories/route.ts:6](../../../blank-seoul-admin/app/api/apply-shopify-categories/route.ts) |
| `NODE_ENV` | 미등록 | 미등록 | [app/api/artist/account/reset/route.ts:36](../../../blank-seoul-admin/app/api/artist/account/reset/route.ts) · 플랫폼/프레임워크 |
| `NTS_BUSINESS_API_KEY` | 등록 | 등록 | [app/api/artist/verify-business/route.ts:81](../../../blank-seoul-admin/app/api/artist/verify-business/route.ts) |
| `OPENAI_API_KEY` | 미등록 | 미등록 | [app/api/manage/auto-categorize/route.ts:27](../../../blank-seoul-admin/app/api/manage/auto-categorize/route.ts) |
| `PIPELINE_SECRET` | Sensitive | Sensitive | [app/api/cron/auto-pipeline/route.ts:7](../../../blank-seoul-admin/app/api/cron/auto-pipeline/route.ts) |
| `POPBILL_CORP_NUM` | 등록 | 등록 | [app/api/admin/tax-invoices/reverse-issue/route.ts:119](../../../blank-seoul-admin/app/api/admin/tax-invoices/reverse-issue/route.ts) |
| `POPBILL_IS_TEST` | 등록 | 등록 | [app/api/artist/account/route.ts:30](../../../blank-seoul-admin/app/api/artist/account/route.ts) |
| `POPBILL_KAKAO_TEMPLATE_APPROVAL` | 미등록 | 미등록 | [lib/notifications/popbillKakao.ts:24](../../../blank-seoul-admin/lib/notifications/popbillKakao.ts) |
| `POPBILL_KAKAO_TEMPLATE_ORDER` | 등록 | 등록 | [lib/notifications/popbillKakao.ts:23](../../../blank-seoul-admin/lib/notifications/popbillKakao.ts) |
| `POPBILL_KAKAO_TEMPLATE_TAX_APPROVED` | 미등록 | 미등록 | [lib/notifications/popbillKakao.ts:25](../../../blank-seoul-admin/lib/notifications/popbillKakao.ts) |
| `POPBILL_KAKAO_TEMPLATE_TAX_CERT_REQUIRED` | 미등록 | 미등록 | [lib/notifications/popbillKakao.ts:26](../../../blank-seoul-admin/lib/notifications/popbillKakao.ts) |
| `POPBILL_KAKAO_TEMPLATE_TAX_INVOICE` | 미등록 | 미등록 | [lib/notifications/popbillKakao.ts:25](../../../blank-seoul-admin/lib/notifications/popbillKakao.ts) |
| `POPBILL_LINK_ID` | 등록 | 등록 | [app/api/test/alimtalk/route.ts:22](../../../blank-seoul-admin/app/api/test/alimtalk/route.ts) |
| `POPBILL_PLUS_FRIEND_ID` | 미등록 | 미등록 | [lib/notifications/popbillKakao.ts:20](../../../blank-seoul-admin/lib/notifications/popbillKakao.ts) |
| `POPBILL_SECRET_KEY` | 등록 | 등록 | [app/api/test/alimtalk/route.ts:22](../../../blank-seoul-admin/app/api/test/alimtalk/route.ts) |
| `POPBILL_SENDER_PHONE` | 등록 | 등록 | [app/api/test/alimtalk/route.ts:37](../../../blank-seoul-admin/app/api/test/alimtalk/route.ts) |
| `POPBILL_USER_ID` | 등록 | 등록 | [lib/notifications/popbillKakao.ts:17](../../../blank-seoul-admin/lib/notifications/popbillKakao.ts) |
| `POPBILL_WEBHOOK_SECRET` | 미등록 | 미등록 | [app/api/tax-invoice/webhook/route.ts:22](../../../blank-seoul-admin/app/api/tax-invoice/webhook/route.ts) |
| `RESEND_API_KEY` | 등록 | 등록 | [app/api/artist/test-email/route.ts:25](../../../blank-seoul-admin/app/api/artist/test-email/route.ts) |
| `REVALIDATE_SECRET` | 등록 | 등록 | [app/api/artist/profile/route.ts:184](../../../blank-seoul-admin/app/api/artist/profile/route.ts) |
| `SHIPPER_ADDRESS` | 미등록 | 미등록 | [lib/pipeline/modules/pn-generator/pn-mapper.ts:43](../../../blank-seoul-admin/lib/pipeline/modules/pn-generator/pn-mapper.ts) |
| `SHIPPER_CITY` | 미등록 | 미등록 | [lib/pipeline/modules/pn-generator/pn-mapper.ts:44](../../../blank-seoul-admin/lib/pipeline/modules/pn-generator/pn-mapper.ts) |
| `SHIPPER_NAME` | 미등록 | 미등록 | [lib/pipeline/modules/pn-generator/pn-mapper.ts:42](../../../blank-seoul-admin/lib/pipeline/modules/pn-generator/pn-mapper.ts) |
| `SHOPIFY_ACCESS_TOKEN` | 미등록 | 미등록 | [lib/pipeline/shared/config.ts:19](../../../blank-seoul-admin/lib/pipeline/shared/config.ts) |
| `SHOPIFY_CLIENT_ID` | 등록 | 등록 | [lib/pipeline/shared/config.ts:15](../../../blank-seoul-admin/lib/pipeline/shared/config.ts) |
| `SHOPIFY_CLIENT_SECRET` | 등록 | 등록 | [lib/pipeline/shared/config.ts:16](../../../blank-seoul-admin/lib/pipeline/shared/config.ts) |
| `SHOPIFY_LOCATION_ID` | 미등록 | 미등록 | [lib/shopify/publishProduct.ts:552](../../../blank-seoul-admin/lib/shopify/publishProduct.ts) |
| `SHOPIFY_STORE_URL` | 등록 | 등록 | [lib/pipeline/shared/config.ts:14](../../../blank-seoul-admin/lib/pipeline/shared/config.ts) |
| `SHOPIFY_WEBHOOK_SECRET` | 미등록 | 미등록 | [lib/shopify/webhook-utils.ts:45](../../../blank-seoul-admin/lib/shopify/webhook-utils.ts) |
| `STORAGE_POSTGRES_DATABASE` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_POSTGRES_HOST` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_POSTGRES_PASSWORD` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_POSTGRES_PRISMA_URL` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_POSTGRES_URL` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_POSTGRES_URL_NON_POOLING` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_POSTGRES_USER` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_SUPABASE_ANON_KEY` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_SUPABASE_JWT_SECRET` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_SUPABASE_PUBLISHABLE_KEY` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_SUPABASE_SECRET_KEY` | 등록 | 미등록 | 직접 참조 없음 |
| `STORAGE_SUPABASE_URL` | 등록 | 미등록 | 직접 참조 없음 |
| `STOREFRONT_REVALIDATE_URLS` | 등록 | 등록 | [app/api/artist/profile/route.ts:183](../../../blank-seoul-admin/app/api/artist/profile/route.ts) |
| `STOREFRONT_URL` | 미등록 | 미등록 | [lib/inquiries/notificationManager.ts:6](../../../blank-seoul-admin/lib/inquiries/notificationManager.ts) |
| `SUPABASE_SERVICE_ROLE_KEY` | 등록 | 등록 | [app/api/apply-shopify-categories/route.ts:7](../../../blank-seoul-admin/app/api/apply-shopify-categories/route.ts) |
| `TRACK17_API_KEY` | 등록 | 등록 | [lib/tracking/17track-client.ts:15](../../../blank-seoul-admin/lib/tracking/17track-client.ts) |
| `TRACK17_WEBHOOK_SECRET` | 등록 | 등록 | [lib/tracking/17track-client.ts:67](../../../blank-seoul-admin/lib/tracking/17track-client.ts) |
| `VERCEL` | 미등록 | 미등록 | [lib/security/roles.ts:10](../../../blank-seoul-admin/lib/security/roles.ts) · 플랫폼/프레임워크 |
| `VERCEL_ENV` | 미등록 | 미등록 | [lib/config/environmentIsolation.ts](../../../blank-seoul-admin/lib/config/environmentIsolation.ts) · 플랫폼/프레임워크 |

#### blank-seoul-storefront

| 변수 | Production | Preview | 코드 참조(대표) |
| --- | --- | --- | --- |
| `ADMIN_API_URL` | 미등록 | 미등록 | [app/api/inquiries/proxyHelper.ts:5](../../app/api/inquiries/proxyHelper.ts) |
| `CRON_SECRET` | Sensitive | Sensitive | [app/api/artists/broadcast/route.ts:41](../../app/api/artists/broadcast/route.ts) |
| `NEXT_PUBLIC_ADMIN_API_URL` | 등록 | 등록 | [app/api/inquiries/proxyHelper.ts:5](../../app/api/inquiries/proxyHelper.ts) |
| `NEXT_PUBLIC_CANCEL_WINDOW_HOURS` | 등록 | 등록 | [lib/constants.ts:17](../../lib/constants.ts) |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | 등록 | 등록 | [app/components/CrispChat.tsx:11](../../app/components/CrispChat.tsx) |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | 등록 | 등록 | [app/api/stock/route.ts:7](../../app/api/stock/route.ts) |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | 등록 | 등록 | [app/api/stock/route.ts:6](../../app/api/stock/route.ts) |
| `NEXT_PUBLIC_SITE_URL` | 등록 | 등록 | [app/robots.ts:3](../../app/robots.ts) |
| `NEXT_PUBLIC_STORE_LAUNCH_STATUS` | 등록 | 등록 | [lib/constants.ts:9](../../lib/constants.ts) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 등록 | 등록 | [lib/supabase/client.ts:6](../../lib/supabase/client.ts) |
| `NEXT_PUBLIC_SUPABASE_URL` | 등록 | 등록 | [lib/supabase/admin.ts:13](../../lib/supabase/admin.ts) |
| `NODE_ENV` | 미등록 | 미등록 | [app/api/artists/broadcast/route.ts:42](../../app/api/artists/broadcast/route.ts) · 플랫폼/프레임워크 |
| `RESEND_API_KEY` | Sensitive | Sensitive | [emails/client.ts:8](../../emails/client.ts) |
| `RESEND_WEBHOOK_SECRET` | 미등록 | 미등록 | [app/api/webhooks/resend/route.ts:58](../../app/api/webhooks/resend/route.ts) |
| `REVALIDATE_SECRET` | 등록 | 등록 | [app/api/revalidate/route.ts:32](../../app/api/revalidate/route.ts) |
| `SHOPIFY_CLIENT_ID` | Sensitive | Sensitive | [lib/shopify/admin.ts:18](../../lib/shopify/admin.ts) |
| `SHOPIFY_CLIENT_SECRET` | Sensitive | Sensitive | [lib/shopify/admin.ts:20](../../lib/shopify/admin.ts) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | 미등록 | 미등록 | [lib/shopify/storefront.ts:14](../../lib/shopify/storefront.ts) |
| `SHOPIFY_STORE_DOMAIN` | 미등록 | 미등록 | [lib/shopify/storefront.ts:12](../../lib/shopify/storefront.ts) |
| `STOREFRONT_OFFLINE_CHECK` | 미등록 | 미등록 | [next.config.ts:5](../../next.config.ts) |
| `SUPABASE_SERVICE_ROLE_KEY` | 등록 | 등록 | [lib/supabase/admin.ts:14](../../lib/supabase/admin.ts) |
| `UNSUBSCRIBE_ACCEPT_LEGACY` | 미등록 | 미등록 | [lib/unsubscribe.ts:31](../../lib/unsubscribe.ts) |
| `UNSUBSCRIBE_SECRET` | Sensitive | 등록 | [lib/unsubscribe.ts:14](../../lib/unsubscribe.ts) |
| `VERCEL_ENV` | 미등록 | 미등록 | [lib/unsubscribe.ts:22](../../lib/unsubscribe.ts) · 플랫폼/프레임워크 |

이 감사는 설정/정적 경로의 대조다. 전체 기능 E2E, 사용자 데이터·비용·성능, 공급자 자격증명 유효성 검증이나 운영 완전 격리 인증으로 해석하지 않는다.


## 환경변수 단순화 적용 검증

실행일: 2026-10-01. 사용자 요청에 따라 코드 수정과 양쪽 로컬 env 파일·Vercel Preview/Production 등록 정리를 수행했다. 앞선 환경변수 표는 당시 스냅샷이며, 최신 관리 기준은 [환경 분리 문서](../environment-isolation.md#2026-10-01-환경변수-단순화-적용)다.

- Admin의 팝빌 공개 플래그·Shopify 공개 도메인 중복을 제거하고 기존 계좌 응답/서버 레이아웃으로 전달한다. 설정 미확인 상태에서는 계좌 인증을 막는다.
- `STOREFRONT_URL`을 미리보기·캐시 갱신의 기본 origin으로 사용한다. 로컬 주소 override는 유지했다. 상품 미리보기의 전송 origin과 수신 창도 확인한다.
- 프론트 문의 proxy와 Shopify 호출은 현재 표준 변수명만 사용한다.
- 양쪽 `.env.example`, `.env.local`, `.env.production.local`의 구성과 설명을 정리했다. 비밀값은 문서·Git에 포함하지 않았으며 실제 env 파일의 Git 제외를 확인했다.
- Vercel Admin에서 5개 변수명의 9개 등록 행을 삭제했다: `NEXT_PUBLIC_POPBILL_IS_TEST`, `NEXT_PUBLIC_SHOPIFY_STORE_URL`, `NEXT_PUBLIC_STORE_PREVIEW_URL`, `STOREFRONT_REVALIDATE_URLS`, `NEXT_PUBLIC_STORE_LAUNCH_STATUS`. 마지막 항목은 Admin만 삭제했고 프론트 판매 상태는 유지했다.
- 양쪽 `REVALIDATE_SECRET` 등록을 Production/Preview로 분리하고 Preview를 같은 시험용 키로 설정했다. Production 값은 유지했다. 공급자 자격증명·기존 작업 인증값은 변경하지 않았다.

### 실행 증거

| 검사 | 결과 |
| --- | --- |
| Admin 전체 단위 테스트 | 301/301 통과 |
| Storefront 전체 단위 테스트 | 23/23 통과 |
| 양쪽 TypeScript 검사 | 통과 |
| 양쪽 `git diff --check` | 통과 |
| Vercel API 변경 작업 | 삭제 9건, scope 분리 2건, Preview 키 등록 2건 성공 |
| 변경 후 API 재조회 및 환경값 pull | 양쪽 Production/Preview 4개 조합 확인 |
| 운영의 읽을 수 있는 기존 값 보존 | 제거한 중복 키 및 플랫폼 생성값을 제외하고 동일 |
| 변경 대상 외 등록값 보존 | ID·암호화 값·target 동일 확인. Sensitive 평문은 검증하지 않음 |
| 환경별 프론트/Admin 연결 | DB URL·Shopify 도메인·상호 origin·캐시 키 일치 |
| 캐시 키 환경 분리 | Preview와 Production 값 다름, 각 환경 안에서는 두 프로젝트 값 동일 |
| 원격 등록 행 수 | Admin 62, Storefront 26. 양쪽 브랜치별 override 0 |
| 현재 모드 | 팝빌 Preview true/Production false, 실시간 true/false, 문의 메일 양쪽 false, 프론트 판매 상태 양쪽 preview |

### 완료되지 않은 범위

- Git push·새 코드 배포·빌드·실제 브라우저 E2E·공급자 호출 시험은 수행하지 않았다. 현재 배포가 새 설정 계약을 사용하는 것으로 해석하지 않는다.
- Production `EPOST_USE_PROD`는 미등록이며 실제 배송 사용 여부 답변 대기다. 새 코드로 실제 접수를 사용하려면 운영에 명시적으로 true를 설정해야 한다.
- 문의 메일 worker 인증/예약, 팝빌·Resend 콜백, 알림톡 템플릿 등 선택 기능은 사용 시 공급자 설정과 함께 완성해야 한다. 키 개수를 줄인 것이 전체 외부 서비스 검증 완료를 의미하지 않는다.
- 프로필/작가명 변경의 기존 직접 캐시 호출은 이번에 주소 해석만 통일했다. 해당 호출의 프론트 요청 body 계약과 실제 캐시 반영은 별도 검증 대상이다.
- Vercel 변경은 다음 배포의 입력이다. 기존 배포는 기존 설정을 유지한다. 양쪽 최신 코드로 Preview를 먼저 배포하고, 우체국 운영 접수 결정 후 Production에 적용한다.


## 환경변수 변경 정밀 재검토

실행일: 2026-10-01. 사용자의 변경 영향 검토 요청에 따라 변수 소비 경로, 양쪽 API 계약, 브라우저 전달값, Vercel 현재 등록값/운영 배포를 다시 확인했다. 이번 원격 작업은 읽기 전용이다.

### 발견 및 수정

| 문제 | 영향과 수정 | 구분 |
| --- | --- | --- |
| 작가 프로필·이름 변경 캐시 호출 계약 불일치 | 본문 없는 POST에 query secret/path를 붙였으나 프론트는 JSON만 읽어 400을 반환한다. 중앙 helper의 JSON `artists: true` 요청으로 전환하고 프론트에서 `/artists` 및 `/artists/[slug]`를 무효화한다. Next `after`로 응답 후 실행을 유지하고 요청에 5초 제한·redirect 거절을 추가했다. | 기존 결함이 이전 단순화에서 남아 있었음. 이번 수정 완료 |
| 미리보기 기본 origin 검증 누락 | URL 조합이 기본 주소의 path/query/hash를 버려 잘못된 설정을 정상으로 처리할 수 있었다. 조합 전에 origin을 검증한다. 유효한 로컬 override는 기본 주소 없이도 사용 가능하다. | 새 helper의 검증 누락. 이번 수정 완료 |
| 문의 proxy 주소 파싱 예외 | 잘못된 환경값에서 URL 생성 예외가 보호 구문 밖으로 나가 500이 될 수 있었다. 주소·프로토콜·자격증명·경로를 먼저 검사하고 503으로 응답한다. 표준 Admin 주소 하나만 사용하며 쓰기 요청을 다른 환경에 재시도하지 않는다. | 기존 예외 처리 결함. 이번 수정 완료 |

### 남은 배포 조건

1. **운영 우체국 접수:** Production `EPOST_USE_PROD` 미등록. 새 보호 코드는 실제 접수를 허용하지 않는다. 실제 접수를 사용 중이라면 값 결정 전 운영 배포하면 해당 기능이 중단된다. 사용 여부는 사용자 답변 대기이며 이번 검토에서 임의 활성화하지 않았다.
2. **팝빌 callback:** 양쪽 Vercel의 `POPBILL_WEBHOOK_SECRET` 미등록. 라우트는 미설정 시 503이며 `/api/tax-invoice/webhook`은 proxy 공개 경로에도 없다. 키 등록만으로 정상 수신이 되는 상태가 아니다. 실제 사용한다면 공급자의 서명/인증 방식과 proxy 통과를 함께 검증해야 한다. 이번 환경 정리로 해당 연동까지 완성됐다고 판정하지 않는다.
3. **배포 순서:** 프론트 새 API → Admin 새 호출 코드 순서로 같은 환경에 배포한다. Preview 캐시 키도 변경됐으므로 한쪽만 새 배포인 동안 캐시 갱신 401이 발생할 수 있다. 두 배포 완료 후 시험한다. 기존 SHA를 새 환경으로 재빌드하면 제거된 변수의 소비 코드가 남아 있으므로 피한다. Production 캐시 키는 변경하지 않았다.

### 실행 검증

- Admin 전체 단위 **302/302**, Storefront **26/26**, 양쪽 타입 검사 및 diff 공백 검사 통과.
- 추가 회귀 시험: 인증된 JSON 캐시 요청·잘못된 키 거절·기존 상품/컬렉션 요청 유지, 잘못된 origin 차단, 문의 쓰기 1회 전달 및 타 환경 재시도 없음.
- 실제 env 파일을 복사하지 않은 별도 디렉토리에서 가상 자격증명으로 양쪽 Next.js webpack **compile 모드** 성공. 전체 prerender/generate 및 실제 공급자 통합 빌드 검증과는 다르다.
- 가상 설정의 Admin 빌드 서버 `/login` HTTP 200. HTML에 검증된 Shopify 도메인·프론트 미리보기 URL이 포함되고 지정한 서버 비밀값 표식은 없음. 브라우저 정적 산출물 Admin 215개·프론트 81개에서도 시험 비밀값 표식 0건. 이는 검사한 표식/산출물 범위의 결과이며 전체 애플리케이션 유출 부재를 증명하는 것은 아니다.
- Vercel 4개 환경 조합 재조회: DB·Shopify·상호 origin·캐시 키 일치, Preview/Production 캐시 키 분리, 제거 대상 Admin 키 미등록 확인. 양쪽 브랜치 override 0건.
- 현재 운영 배포는 Admin `9dc6b47a895927cb9a11ac4dd1aeb222274dafab`, Storefront `9ba2c2fe87f338d3ec77ddd3e8bbc44c3554f6a6`로 기존 상태이며 이번 변경이 배포된 것으로 보지 않는다.
- SQL·Git push·원격 설정 변경·배포·실제 금융/배송/메일·인증된 상품 미리보기 E2E는 수행하지 않았다.

판정: 설정 단순화와 소비 코드의 기본 연결은 검증됐고 발견한 코드 결함은 보완했다. 운영 외부 처리 두 가지와 배포 후 실제 사용자 흐름은 아직 검증 완료가 아니다.

## 팝빌 테스트 웹훅 구현 및 검증

실행일: 2026-10-01. 자동처리를 테스트 환경에서 먼저 구현해 달라는 사용자 요청에 따라 진행했다. 앞선 재검토의 팝빌 callback 미구현 항목은 이번 구현으로 보완했으며, 실제 공급자 연동 완료와는 구분한다.

- 공식 회원 웹훅의 `X-Api-Key`, 사업자번호·문서 종류·BUY 관리번호·날짜·상태를 검사한다. 요청 본문은 64 KiB로 제한한다.
- `/api/tax-invoice/webhook`만 관리자 로그인 proxy에서 제외하고 라우트 자체 인증을 적용했다. 다른 세금계산서 API 인증은 유지한다.
- 단일 DB 함수에서 행 잠금, 최근 공급자 시각·이벤트 ID·테스트 모드를 검사하고 상태를 반영한다. 중복/과거 이벤트는 정상 응답하고, 누락 문서·충돌·DB 오류는 실패 응답을 반환한다.
- 역발행 요청 상태는 200, 발행 상태는 300~305, 거부는 400으로 정정했다. 305는 국세청 전송 실패이며 성공 상태로 해석하지 않는다.
- Admin Vercel **Preview에만** `POPBILL_WEBHOOK_SECRET`을 Sensitive로 등록했다. 기존 등록 행의 ID·암호화 값·target 보존을 확인했다. Production 설정은 변경하지 않았다.

### 실행 증거와 한계

| 검사 | 결과 |
| --- | --- |
| Admin 단위 테스트 | 308/308 통과 |
| Admin TypeScript 검사 | 통과 |
| 가상 설정의 격리된 Next.js webpack compile 빌드 | 통과. 전체 prerender 및 실제 외부 서비스 통합 검증은 아님 |
| 폐기 가능한 PGlite DB 시험 | SQL 재적용·중복·순서 역전·충돌·환경 불일치·취소·실행 권한 검증 통과 |
| 실제 Supabase SQL 적용 | 미실행. 사용자 수동 적용 필요 |
| Git push / 새 배포 / 팝빌 실제 callback | 미실행 |

테스트는 합성 입력과 로컬 DB 기준이다. 기존 수동 처리·조회 동기화와의 모든 경쟁 조건, 실제 공급자 재시도, 실사업자 세금계산서 발행을 검증한 것은 아니다. 기존 행의 과거 공급자 시각은 자동 추정하지 않으며, 충돌이나 공급자 재시도 한도 초과는 확인 후 재전송해야 한다.

### 남은 사용자 작업

1. 테스트 DB에 `20261001_01_popbill_webhook_delivery.sql` 수동 적용.
2. 최신 Admin 코드를 push하고 Preview 배포.
3. 현재 Preview의 Vercel Deployment Protection을 통과할 Automation Bypass 설정과 팝빌 테스트 회원 웹훅 URL/API Key 등록.
4. 실제 테스트 callback에서 정상 응답 및 DB 반영 확인.

정확한 URL·콘솔 위치·적용 범위는 [Admin 팝빌 연동 원본](../../../blank-seoul-admin/doc/notifications/TAX_INVOICE_REVERSE_ISSUANCE_GUIDE.md#b-p2-팝빌-웹훅-수신--2026-10-01-구현-기준)에 모았다. 운영 활성화는 이 검증 이후 별도로 진행한다.

### 추가 확인: Preview 접근 키 생성

2026-10-01 사용자 요청으로 Vercel 공식 API를 통해 Admin 프로젝트에 `popbill-test-webhook` Automation Bypass 키를 생성했다. 기존 접근 키·환경변수 등록·SSO 보호 설정이 보존됐음을 재조회로 확인했다. 키와 완성된 콜백 URL은 Git 밖의 로컬 비공개 파일(권한 600)에만 기록했다. 키의 권한 범위는 Admin 프로젝트 전체 배포다.

- 운영/테스트 DB SQL 적용과 배포 성공: 사용자 보고. 이번 작업에서 SQL 재실행이나 배포는 하지 않았다.
- 배포된 dev Preview 확인: 우회 키 없이 401; 우회 후 잘못된 웹훅 키는 앱 JSON 401; 올바른 웹훅 키와 잘못된 본문은 앱 JSON 400. 현재 배포에서 접근 보호 통과 및 인증 검증 경로 도달을 확인했다.
- 유효한 업무 이벤트·DB 쓰기·팝빌 발행 요청은 보내지 않았다. 팝빌 테스트 사이트의 회원 웹훅 등록과 실제 이벤트 검증이 남았다.

## Production 변수 보완 및 외부 서비스 재검토

실행일: 2026-10-01. 사용자의 Production 누락 보완 및 추가 누락 검토 요청에 따른 작업이다. 팝빌 테스트 콘솔 설정 완료는 이후 사용자 보고로 반영한다. 현재 계약은 [환경 분리 기준](../environment-isolation.md#2026-10-01-production-누락-보완-이후-기준)이다.

### 원격 등록 변경

- Admin Production: `EPOST_USE_PROD=false`, 별도의 `POPBILL_WEBHOOK_SECRET`(Sensitive) 2행 추가.
- Admin Preview/Production: 기존 각 로컬 파일의 사업자번호, K-Packet/EMS 승인번호, 발송인 이름·주소·도시 6개씩 총 12행 추가. 비어 있거나 임의 생성해야 하는 공급자 값은 넣지 않았다.
- 원격 재조회 및 4개 환경 pull 확인: 기존 등록값 보존, Admin 77행/Storefront 26행, 브랜치 override 0건. 프론트는 원격 변경 없음.
- 같은 환경의 프론트/Admin DB URL·Shopify 도메인·상호 origin·캐시 키 일치. 환경 간 DB·Shopify 도메인·캐시 키 분리. 배송 변수는 해당 로컬 값과 일치. 두 환경에서 인증 우회 false 및 우체국 실제 접수 false 확인.
- Sensitive 값은 읽기 불가능한 항목이 있어 평문 일치 검증과 등록 존재 확인을 구분했다. 공급자 자격증명의 유효성·승인 상태는 확인하지 않았다.

### 코드 발견 및 보완

| 발견 | 조치 |
| --- | --- |
| 팝빌 설정 누락 시 실제 내장 연동 키·사업자·사용자 기본값 사용 | 내장 기본값 제거. 키·10자리 사업자번호·사용자가 없으면 서비스 호출 전에 실패. 기존 내장 키와 Vercel 키가 일치하여 공급자 키 교체 필요 사항 기록 |
| 17TRACK 키/서명 누락 허용, 서명 대신 키 원문도 허용 | `sign` 헤더의 64자리 SHA256만 상수 시간 비교. 설정 누락 503, 서명 오류 401. 공식 단일 `data` 객체가 무시되는 문제도 보완 |
| 우체국 취소는 `EPOST_USE_PROD` 검사 없음 | DEV 등기번호 형식 외 취소에 운영 허용 검사 적용. Preview/미허용 환경에서 실제 등기번호 취소를 암호화·HTTP 전에 차단 |

17TRACK 서명 형식은 [공식 문서](https://api.17track.net/en/doc)의 원문 body + `/` + Security/API key 방식과 대조했다. 현재 두 Vercel 환경의 `TRACK17_WEBHOOK_SECRET`과 API 키가 같음을 값 노출 없이 확인했다.

### 검증 결과

- Admin 전체 단위 **313/313**, TypeScript, 양쪽 diff 공백 검사 통과.
- 실제 env를 복사하지 않은 가상 설정의 분리된 Next.js webpack compile 빌드 통과. 전체 prerender/외부 공급자 통합 시험은 아니다.
- 새 회귀 시험: 팝빌 설정 누락 시 SDK 호출 0회, 설정된 자격증명 사용, 17TRACK 위조·누락·본문 변경 서명 거절, 단일 이벤트 반영, 우체국 실제 취소 차단/DEV 취소 경로 유지.
- 실제 env 파일은 Git 제외, 운영 팝빌 콘솔 입력값 파일은 Git 밖 권한 600으로 보관했다. 기존 사용자 문서 변경 보존.
- 실제 배송 접수·취소, 세금계산서 발행, 고객 메일/SMS, DB SQL, Git push, 새 배포는 수행하지 않았다. 프론트 실행 코드 변경 없음.

### 남은 사항

1. 이번 코드 push 및 Admin Preview/Production 새 배포. 환경 등록 변경만으로 기존 배포가 갱신되지는 않는다.
2. 팝빌 **연동 키 `POPBILL_SECRET_KEY` 교체** 및 운영 웹훅 콘솔 등록/실제 수신 확인. 테스트 콘솔은 사용자 설정 완료 보고이나 유효한 상태 변경 이벤트 반영은 미검증이다.
3. 프론트 양쪽 `RESEND_WEBHOOK_SECRET` 미등록. 공급자가 발급한 해당 endpoint 서명 키 필요. 현재 미설정 경로는 503이다.
4. 알림톡 승인·세금계산서·인증서 안내 템플릿과 발신 채널 확인. 일부 기존 경로의 LMS 대체 발송은 유지된다.
5. 문의 메일은 양쪽 disabled. 활성화 시 Admin `CRON_SECRET`과 worker 호출자/예약을 함께 구성해야 한다. 기존 `PIPELINE_SECRET` 호출을 깨뜨리지 않도록 이번에 임의 등록하지 않았다.
6. Admin Resend/17TRACK 계정 키 공유 및 로컬 운영 파일의 팝빌 시험 모드 등 격리 한계는 환경 분리 문서에 기록했다. `false` 하나로 모든 외부 서비스가 시험 모드가 되지는 않는다.
7. 17TRACK의 DB/Shopify 부분 실패 복구·이벤트 중복 처리는 이번 인증/입력 수정 범위 밖이다. 현재 핸들러의 부분 실패가 성공 응답으로 끝나는 경로가 남아 있어 배송 상태 동기화 전체의 신뢰성 검증 완료로 판정하지 않는다.

## 외부 연동 구현 정밀 재검토

실행일: 2026-10-01. 현재 로컬 변경·Admin HEAD `6058dc9`·원격 설정을 대조했다. 범위는 최근 환경변수/팝빌/17TRACK/우체국 보호 변경과 직접 연결된 쓰기 경로다. 발견 사항과 조치 원본은 [FINDINGS EXT01–EXT05](FINDINGS.md#4-외부-연동-구현-재검토--2026-10-01)이다.

### 이번 실행 증거

| 검사 | 결과 및 한계 |
| --- | --- |
| Admin 전체 단위·타입 | **313/313 통과**, TypeScript 통과. 기존 정상/인증 시험은 아래 경쟁·장애 결함을 막는 증거가 아님 |
| 폐기 가능한 PGlite SQL | 재적용·중복·시각 순서·취소·모드 불일치·권한 시험 통과. 실제 Supabase 및 다른 직접 쓰기 경로와의 경쟁 검증은 아님 |
| 팝빌 Preview 모드 가드 | 모듈에 Preview + false를 주면 credentials ok=true/isTest=false 반환. 실제 SDK HTTP는 호출하지 않음 |
| 오래된 조회와 취소 경쟁 | 가상 현재 행 cancelled, 이전 조회 결과 300 → 상태 issued로 변경. UPDATE 조건은 작가명/기간뿐 |
| 17TRACK DB 실패 | 가상 DB 오류를 반환했지만 HTTP 200, success=true, delivered=0 |
| 역발행 DB 실패 | 가상 공급자 기등록 성공 + DB 오류 → HTTP 200, 단건 SUCCESS, successCount=1. 외부 등록·메시지는 실행하지 않음 |
| 공백 검사 | 양쪽 Git diff --check 통과 |

### 원격 재조회 결과

- 네 프로젝트/환경 조합 env pull 및 공식 API 메타데이터 재조회 성공. Admin 77행/프론트 26행, 브랜치 override 0건.
- 환경별 DB·Shopify·프론트/Admin origin·캐시 키 일치, 환경 간 캐시 키 분리. Admin 양쪽 EPOST_USE_PROD=false, Preview 팝빌 true/Production false, 문의 메일 false 유지.
- POPBILL_WEBHOOK_SECRET은 **양쪽 등록 존재**를 메타데이터로 확인했다. Preview Sensitive 값은 pull에서 비어 있으므로 그 결과를 누락으로 판정하지 않는다.
- 현재 Production READY 배포는 Admin `6058dc9`, Storefront `07e5441`. 최근 Admin 내장 자격증명 제거·17TRACK 서명 보강·우체국 취소 가드는 로컬 미커밋 변경으로 아직 이 배포에 포함되지 않았다. 등록값이 같아도 기존 배포에 새 값이 적용됐음을 의미하지 않는다.
- 과거 HEAD의 내장 팝빌 연동 키와 현재 Vercel 두 환경 키가 동일함을 값 공개 없이 재확인했다. 사용/악용 여부는 검증하지 않았다.

이번 작업은 검토와 기존 공통 문서 갱신이며 실행 코드·원격 설정을 추가 변경하지 않았다. 실제 금융/배송/메일 호출, SQL 적용, Git push, 배포를 수행하지 않았다. 전체 빌드는 재실행하지 않았으며 이전 compile 검증과 구분한다. 실제 callback에서 BUY 회사번호·문서 키 계약, 모든 공급자 실패/재전송, 사용량·동시성 검증은 미완료다.

판정: 최근 인증·설정 분리 보완은 유효하지만, 다른 쓰기 경로의 상태 경쟁과 실패 은폐가 재현돼 **운영 자동처리 완료로 판정할 수 없다**. 우선 연동 키 교체, 팝빌 쓰기 경로/모드 가드 통합, 배송 부분 실패 복구를 해결하고 테스트 이벤트로 검증해야 한다.

## 외부 연동 오류 복구 구현

실행일: 2026-10-01. 사용자가 직접 구현을 요청하고 배포는 직접 수행하기로 했다. R03/R11과 정산·배송·알림 여정의 EXT02–EXT05를 로컬에서 보완했다. 프론트 실행 코드는 변경하지 않았고 공통 원본 문서만 갱신했다.

### 변경 결과

| 경로 | 구현한 보호 |
| --- | --- |
| 역발행 | 공급자 호출 전에 관리번호·금액·환경을 원자적으로 준비. 기존 문서 충돌과 저장 실패는 실패로 반환하며 외부 호출을 중단. 등록 후 저장 실패는 관리번호와 외부 등록 여부를 반환하여 같은 관리번호로 복구 |
| 조회·웹훅·수동 수정 | 조회도 공급자 시각을 사용해 기존 웹훅 RPC로 반영. 요청 기록은 최신 발행·취소 상태를 되돌리지 않으며 수동 상태 변경도 행 잠금과 전이 조건 적용. 세금계산서의 기존 공개 정책·브라우저 직접 권한 제거 |
| 알림·표시 | 팝빌 SDK와 알림 경로의 모드 검증 통일. Preview에서 false 및 잘못된 문자열 차단. 설정 누락·권한 오류를 mock 발송 성공으로 표시하지 않음. 화면의 실패 건수·안내 발송 여부·취소/거절 표시 및 수령 확인 문구 수정 |
| 배송 수신 | 서명·본문 크기·배치·시각 검증 후 EMS 배송 완료와 작업 기록을 한 RPC에서 저장. 재수신해도 최초 완료 시각·작업 키 유지. 현재 DB에 없는 등기번호는 반영하지 않음 |
| Shopify 반영 | DB claim/lease와 같은 fulfillment 동시 claim 방지. 15초 작업 제한, 최대 3개 처리. 재시도 전 Shopify DELIVERED 조회 및 mutation 자동 재시도 제거. 불확실한 응답을 성공으로 확정하지 않음 |
| 복구·진단 | 5분 후 재시도·최대 5회 후 failed, 늦게 연결된 fulfillment 재조회. 인증된 관리자 조회/재처리 API와 예약 작업 API 제공. 실행할 pending 작업이 없어도 failed 작업이 있으면 성공으로 숨기지 않음 |

구현 원본: [세금계산서 쓰기 계약](../../../blank-seoul-admin/doc/notifications/TAX_INVOICE_REVERSE_ISSUANCE_GUIDE.md#세금계산서-쓰기-보호--현재-적용-기준), [배송 완료·복구 계약](../../../blank-seoul-admin/doc/logistics/ARTIST_LOGISTICS_WORKFLOW.md#7-배송-완료-외부-반영복구-계약). 환경변수는 추가하지 않았다. 로컬 `.env.production.local`의 POPBILL_IS_TEST는 원격 Production과 같은 false로 변경했고 `.env.local`은 true를 유지했다. 운영 로컬 실행은 실제 팝빌 모드이므로 개발 시험은 테스트 구성을 사용한다. 실제 자격증명 값을 문서·테스트에 복사하지 않았다.

### 실행 검증과 한계

- 전체 Admin 단위 시험 **327/327 통과**. 공급자 호출 전/후 저장 실패, 취소 이후 오래된 조회, 알림 실패, 서명·입력·본문 제한, Shopify 불확실한 결과, 잘못된 claim, 예약/관리자 인증, 실패 작업 진단을 가상 의존성으로 시험했다.
- 폐기 가능한 PGlite에서 SQL 01→02→03 적용 및 반복 적용, 관리키/환경/금액 충돌, 상태 경쟁 순서, 기존 공개 정책 제거, 직접 테이블/RPC 권한, lease 만료·중복 수신·같은 fulfillment 작업·늦은 연결·5회 실패·수동 복구 시험 통과. 실제 Supabase의 동시 트랜잭션 부하 시험은 아니다.
- 최종 TypeScript 검사 통과. 실제 env를 복사하지 않은 임시 디렉토리에서 Next.js webpack **compile 빌드 통과**. 전체 prerender·운영 설정·외부 공급자 통합 시험과 구분한다.
- Shopify 조회 후 생성은 재전송 중복을 줄이는 방식이다. 외부 시스템과 분산 트랜잭션/정확히 한 번 전송을 보장하지 않는다. 실제 API 권한·지연된 상태 조회·공급자 재전송 시험은 필요하다.
- 실제 DB SQL 적용, 외부 발행·배송·고객 알림, Vercel 설정 변경, Git push 및 배포는 수행하지 않았다. 공급자 연동 키도 교체하지 않았다.

### 사용자 적용 순서

**후속 진행 상태:** 사용자가 SQL 실행·운영/테스트 배포 완료를 보고했다. 아래 원격 검증에서 Admin 양쪽 배포의 `ffc3606`/READY와 테스트 DB의 관련 RPC 공개를 확인했다. 실제 발행·Shopify 반영 시험은 미완료다. 기존 팝빌 키는 D024에 따라 유지하며 자동 복구 예약은 D023으로 보류됐다. 실패 기록·중복 방지·관리자 수동 재처리는 유지한다.

1. 테스트 DB에서 기존 `20261001_01` 적용을 확인한 뒤 Admin `supabase/migrations/20261001_02_tax_invoice_write_guards.sql`과 `20261001_03_tracking_delivery_jobs.sql`을 직접 실행한다. 새 코드는 이 RPC들이 필요하며 SQL 미적용 상태에서 성공으로 우회하지 않는다.
2. **현재 기존 키 유지(D024):** Private 저장소라는 사용자 설명과 기존 키 사용 요청에 따라 팝빌 연동 키 교체를 배포 필수 선행 조건으로 두지 않는다. 기존 POPBILL_SECRET_KEY를 서버 환경변수와 Git에서 제외된 로컬 파일로 관리하고 코드 내장 값은 복원하지 않는다. 외부 유출·악용은 확인되지 않았으며, 노출이나 접근 범위 변경이 확인되면 교체를 다시 검토한다.
3. 직접 push 및 Preview 재배포 후 팝빌 실제 시험 문서의 BUY 회사번호/관리키 callback과 17TRACK 재전송·Shopify 반영/복구를 확인한다. 실제 BUY 계약 미확인 때문에 회사번호 검사를 임의로 완화하지 않았다.
4. **현재 보류(D023):** `/api/cron/process-tracking-deliveries`의 예약 등록은 반복 실패나 수동 관리 부담이 확인될 때 진행한다. Authorization Bearer는 CRON_SECRET이 있으면 해당 값, 없으면 기존 PIPELINE_SECRET이다. 예약이 없어도 실패 기록은 유지되며 초기 운영에서는 관리자가 미처리 작업을 확인하고 수동 재처리한다. 자동화 재개 시 호출자의 응답 대기 제한에 맞춰 처리량과 실행 시간을 보완한다. 한 요청에서 최대 3개를 처리하므로 더 큰 배치·미처리 작업은 반복 처리해야 한다.
5. 확인 후 운영 DB에도 SQL 02·03을 직접 적용하고 운영 코드를 배포한다. 관리자 복구 API는 로그인 인증이 필요하며 전용 화면은 추가하지 않았다. 과거 배송 완료 전체 재등록·17TRACK 등록 실패 보상·공급자 정기 대조는 이번 구현 범위에 포함하지 않았다.

### 원격 Preview 및 로그인 설정 확인 — 2026-10-01

Supabase CLI 로그인 후 저장된 macOS 자격증명을 메모리에서 사용하여 Management API의 Auth 설정을 **GET으로만** 조회했다. 계정 관리 토큰을 앱 `.env`에 추가하지 않았으며 원격 URL 설정·Provider 설정·SQL은 변경하지 않았다. 비공개 키와 응답 전체는 문서에 저장하지 않았다.

| 대상 | 직접 조회 결과 | 판단 / 다음 확인 |
| --- | --- | --- |
| Admin Production / dev Preview | 양쪽 READY, Git SHA `ffc3606e3c42d7918d0bb262091ad44e19c2107e` | 최신 코드 배포 확인. 공급자 업무 결과 검증과 구분 |
| Preview 설정 | 테스트 Supabase `zijvqethklunvydtqmak`, 팝빌 true, 우체국 false, BYPASS_AUTH false, 문의 메일 false | 현재 등록값 조회이며 배포 당시 전체 env 스냅샷 검증은 아님. Sensitive pull 빈 값은 누락 판정에 사용하지 않음 |
| 테스트 DB RPC | `apply_popbill_tax_invoice_event`, `prepare_popbill_tax_invoice`, `record_popbill_tax_invoice_request`, `mark_manual_tax_invoice`, 배송 receive/claim/finish/retry 총 8개가 PostgREST schema에 존재 | SQL 전체 정의·운영 DB 동일성까지 검증한 것은 아님 |
| 테스트 업무 데이터 | `tax_invoices` 0건, `tracking_delivery_jobs` 0건. 두 테이블의 anon SELECT는 401/42501 | 현재 문서·배송 작업을 대상으로 정상 반영/실패 복구 시험할 수 없음 |
| 운영 Auth | Site URL `https://blankseoul.com`; 운영 프론트·Admin 및 localhost 3000/3001/3002 허용; Kakao·Google true | 운영 복귀 주소는 유지. 로컬 테스트 3001은 환경 정리 때 테스트 DB로 이동하는 것이 맞음 |
| 테스트 Auth | Site URL도 `https://blankseoul.com`; localhost 3000/3001/3002와 운영 프론트·Admin, Admin dev Preview 허용; localhost 3003와 프론트 dev Preview 누락; Kakao true, Google false | 사용자 확인: 문제가 발생한 주소는 localhost 3003. 허용 URL 누락과 운영 기본 복귀 주소가 홈페이지 이동을 설명함. Kakao 작가 로그인과 Google 관리자 로그인은 별도 |

실제 Admin dev Preview HTTP **18개 확인 통과**(2026-09-30 19:13 UTC / 2026-10-01 04:13 KST): 관리자·작가·cron 인증 없는 요청 401, code 없는 callback 및 외부 next 입력의 같은 Admin origin 복귀 307, 팝빌 키 누락/오류 401·잘못된 JSON/필드 400·interOPYN=false 문서 무처리 200, 17TRACK 서명 누락/오류 401·정상 서명 비배송 이벤트 200·잘못된 JSON 400·존재하지 않는 배송번호 RPC 무처리 200 및 health 200. 첫 시험의 작가 GET은 artist 인자 없이 400을 반환했으므로 인증 시험에서는 artist 인자를 넣어 401을 별도로 확인했다. 실제 발행·알림 발송·등록된 배송 데이터 변경·Shopify mutation·예약 작업 실행은 수행하지 않았다. SQL 적용과 Git push는 사용자 수행 원칙을 유지했다.

당시 테스트 Auth의 제안값(아래 후속 작업에서 적용): Site URL은 `https://blank-seoul-storefront-git-dev-thec9rqwer-4072s-projects.vercel.app`, Redirect URLs에는 `http://localhost:3001/**`, **`http://localhost:3003/**`**, `https://blank-seoul-storefront-git-dev-thec9rqwer-4072s-projects.vercel.app/**`, `https://blank-seoul-admin-git-dev-thec9rqwer-4072s-projects.vercel.app/**`를 유지/추가한다. 테스트 목록의 운영 주소와 운영 로컬 포트는 사용처를 확인한 뒤 제거한다. 먼저 localhost 3003를 추가하고 새 Kakao 로그인을 시작하면 해당 callback 복귀를 재검증할 수 있다. 테스트 관리자 업무 시험에는 Google Provider 설정과 정상 관리자 세션이 추가로 필요하다. [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [CLI 자격증명 저장](https://supabase.com/docs/reference/cli/supabase-login).

### Supabase Auth URL 원격 수정 — 2026-10-01

위 조회 이후 사용자가 운영·테스트 URL의 직접 수정도 요청했다. Vercel 프로젝트 도메인/두 dev alias와 양쪽 `.env`의 Supabase 연결, npm dev/prod 실행 포트를 재조회·대조한 뒤 URL 필드 두 개만 PATCH했다. 변경 전 URL 값은 `/Users/junseoha/.config/blank-seoul/supabase-auth-url-change.private.json`에 보관했다. 관리 토큰과 Provider 비밀값을 파일·문서에 기록하지 않았다. 설정 원본은 [환경 분리 가이드의 Auth URL 계약](../environment-isolation.md#supabase-auth-url-configuration--2026-10-01-적용)이다.

- 테스트: Site URL을 운영 홈페이지에서 프론트 dev Preview로 변경. Redirect URLs를 테스트 로컬 3001/3003와 프론트·Admin dev Preview 두 주소로 정리했다.
- 운영: Site URL은 운영 홈페이지 유지. 배포 주소는 프론트 `/auth/callback`, Admin `/api/auth/callback` 및 `?next=/artist`로 지정했고 운영 로컬 3000/3002를 유지했다. 테스트 로컬 3001은 제거했다.
- 각 PATCH 후 GET 결과의 `site_url`/`uri_allow_list`가 계획값과 일치하며 다른 Auth 설정 필드의 차이는 0개였다. Google/Kakao 활성화, 키, 메일·세션 설정은 변경하지 않았다. SQL 적용·Git push·Vercel 배포는 수행하지 않았다.
- OAuth 복귀 확인 **7/7 통과**(2026-09-30 19:25 UTC / 2026-10-01 04:25 KST): PKCE authorize 요청 후 공급자의 access_denied 취소 callback을 보내 실제 Supabase가 선택한 Location의 origin/path/기존 query를 확인했다. 테스트 로컬 3003/3001, Admin·프론트 dev Preview, 운영 Admin Kakao·Google callback, 운영 프론트 Google callback이 요청 주소로 복귀했고 `next=/artist`를 유지했다. 취소 오류 query는 비교에서 제외했다. 실제 사용자 로그인·세션 생성·앱 callback 실행·이메일 발송은 수행하지 않았으며 테스트 프론트의 주소 검증에는 활성화된 Kakao를 사용했다. 프론트의 실제 Google 로그인을 시험한 것으로 해석하지 않는다.
- 사용자에게 필요한 다음 확인: localhost 3003에서 기존 로그인 흐름을 닫고 새 Kakao 로그인부터 시작하여 작가 화면 복귀를 확인한다. 테스트 Google Provider false와 관리자 세션 부재에 따른 업무 시험 한계는 그대로다.

### 운영 관리자 Google 로그인 검토·권한 등록 — 2026-10-01

사용자가 localhost 3002에서 관리자 로그인 실패를 보고했다. 운영 Auth 설정 GET과 사용자 목록 GET을 조회하고 callback/proxy 코드를 대조했다. 사용자가 제공한 로그에는 `EXCHANGE_SUCCESS`가 있어 Google 인증과 세션 교환은 성공했다. 운영 Google Provider/Client ID/Secret은 설정돼 있고 localhost 3002는 허용 URL이다. 운영 Auth 사용자 4명 중 Google 연결 계정은 2개이며, 서버가 관리하는 `app_metadata.role`/`roles`의 admin 권한 계정은 0개였다. `proxy.ts`와 `requireAdmin`이 해당 권한을 요구하므로 Google 인증 이후 관리자 접근이 차단된 것으로 확인했다.

- 사용자가 기존 Google 연결 계정 두 개를 관리자 등록 대상으로 명시했다. 운영 Auth Admin API로 이메일이 확인된 정확한 두 기존 계정의 `app_metadata`를 읽고 기존 필드를 보존하여 `role: "admin"`을 추가했다. 각 계정을 재조회하여 권한을 확인했고, 최종 관리자 수 2개·다른 계정 metadata 변경 없음·대상 계정의 나머지 app_metadata 보존을 확인했다. 새 계정 생성·테스트 계정 변경·SQL 실행은 하지 않았다. 개인 이메일·인증 토큰은 문서에 기록하지 않는다.
- 회원 가입은 운영/테스트 모두 허용돼 있다(`disable_signup=false`, before-user-created hook 없음). Supabase를 구매자/작가와 공유하므로 프로젝트 전체 가입 차단으로 관리자 접근을 제어하지 않았다. Google 인증 성공과 관리자 업무 인가는 별도이며 `isAdminUser`의 server-managed app_metadata 조건을 유지했다. 등록된 Google OAuth 앱 자체의 Audience 제한은 Google 콘솔을 직접 조회하지 않아 미검증이다.
- Google provider token을 카카오 사용자 API에 보내던 별도 callback 결함도 수정했다. 카카오 연결 계정의 `/artist` 복귀 흐름에서만 전화번호/이름 수집을 수행하고 Google 관리자 callback은 카카오 호출을 생략한다. 이메일로 생성 후 소셜 계정이 연결되면 app_metadata.provider는 email로 남을 수 있으므로 providers 배열도 확인한다. OAuth 코드가 포함된 요청 URL·provider token 접두사는 callback 진단 로그에서 제거했다.
- 관련 시험 **18/18 통과**: 새 callback 회귀 시험 3개(Google 토큰 미전송/로그 배제, 카카오와 연결된 Google 관리자 계정의 카카오 호출 생략, 이메일 연결 카카오 작가 복귀 유지)와 기존 security-boundaries 15개. TypeScript 검사·diff 검사 통과. 실제 Google 계정으로 새 로그인 완료 후 관리자 업무 접근은 사용자가 재확인해야 한다.
- Auth 권한 변경은 원격 반영 완료다. callback 코드는 로컬 수정이며 Git push/Vercel 배포는 수행하지 않았다. localhost 3002에서 로그아웃 후 새 로그인하고, 원격에는 사용자 push/배포 후 확인한다. 테스트 Google Provider는 기존 false/자격증명 미설정 상태를 유지했다.

- **push 후 배포 조회:** 사용자가 push 완료를 보고했고 로컬/원격 추적 main·dev가 `b4845a3b69ed18d3a9c7544014a01df25c47f3e6`를 가리킴을 확인했다. Vercel deployment 목록에서 dev Preview는 READY, main Production은 QUEUED였다(2026-10-01 04:59–05:00 KST 조회). 운영 새 배포 완료와 두 관리자 계정의 실제 새 로그인·업무 접근은 아직 확인하지 않았다. 이번 커밋은 새 SQL/env 적용을 추가로 요구하지 않는다.

### Preview 팝빌·배송 상태 및 재처리 동작 확인 — 2026-10-01

사용자가 실제 동작 확인을 요청했다. R03/R11 및 EXT02–EXT05의 인수 검증으로 실행했다. 시험 전에 로컬 테스트 구성과 원격 DB를 대조했다: Supabase `zijvqethklunvydtqmak`, Shopify `blank-seoul-dev.myshopify.com`의 partnerDevelopment=true, POPBILL_IS_TEST=true, EPOST_USE_PROD=false. 팝빌 잔액 API가 실제 시험 서버에서 200을 반환했다(잔액 0). Shopify 앱의 write_orders/write_fulfillments 및 관련 fulfillment order 권한을 조회했고, 주문과 앱 webhookSubscriptions가 모두 비어 있음을 확인했다. Production 업무 데이터·팝빌 문서 발행·우체국 접수·고객 알림 호출은 하지 않았다.

Vercel 재조회(2026-09-30 20:28 UTC / 2026-10-01 05:28 KST): Admin dev Preview와 main Production 모두 `b4845a3b69ed18d3a9c7544014a01df25c47f3e6` / READY. Preview 보호 우회 키와 웹훅 키는 요청 헤더에서만 사용하고 보고서에 기록하지 않았다.

시험 데이터는 Shopify 개발 스토어에 test=true·0원 사용자 지정 품목·재고 차감 BYPASS·알림 false·고객/메일/전화번호 없음으로 주문 2개를 생성했다. 등록된 실물 상품 재고를 쓰지 않았다. `EXTCHK26-OK`의 주문/fulfillment는 `18917845074098` / `7265302249650`, `EXTCHK26-RETRY`는 `18917845106866` / `7265302315186`이다. 두 fulfillment의 최초 displayStatus는 MARKED_AS_FULFILLED였다. [시험 데이터 SQL](../../../blank-seoul-admin/scripts/performance/seed-external-delivery-test.sql)은 사용자 직접 실행했고 원격 SELECT로 세금계산서 2건·EMS 2건·failed 작업 1건을 확인했다. 이 failed/attempts=5는 실제 과거 장애 이력이 아니라 소진 상태의 재처리를 위한 초기 조건이다. fixture SQL의 확인값/충돌/NULL 식별자/재실행 상태 보존/활성 작업 삭제 차단/기존 데이터 보존은 별도 로컬 PostgreSQL에서 8개 확인을 통과했다.

실제 원격 DB·Preview HTTP·Shopify 개발 API 및 localhost 관리자 API를 포함한 **19개 확인 통과**. [확인 항목·시각·한계 JSON](../../../blank-seoul-admin/scripts/performance/external-delivery-test-result.json)에 기록했다.

| 대상 | 실행 결과 | 검증 범위 |
| --- | --- | --- |
| 팝빌 상태 | requested → issued(300) → NTS 완료(304) → cancelled, 별도 문서 refused를 DB SELECT로 확인 | 시험 프로그램이 만든 콜백을 실제 Preview에 전달. 팝빌에서 발행한 문서는 아님 |
| 팝빌 중복·역전 | 같은 event ID 재수신·이전 stateDT 수신은 200이며 행/updated_at 불변 | DB 최신 상태 유지 |
| 팝빌 충돌·미등록 | 같은 시각의 다른 상태 및 미등록 관리키는 503. 충돌 행 불변·미등록 행 생성 없음 | 저장하지 못한 이벤트를 성공으로 숨기지 않음 |
| NTS 메타데이터 | 승인번호·발행/전송 시각 저장, invoice_status는 issued 유지 | 수령 확인 confirmed 업무 단계와 국세청 전송 완료를 구분 |
| 정상 배송 | Preview signed callback → EMS delivered → 작업 completed → 실제 Shopify DELIVERED 이벤트 1개 | 개발 스토어 실제 GraphQL mutation과 후속 query 확인 |
| 배송 재수신 | 다른 완료 시각으로 반복해도 최초 DB 시각·작업·이벤트 수 보존 | 같은 배송 중복 반영 차단 |
| 소진 작업 | seeded failed 작업의 Preview 콜백은 503, failed 유지. 인증 없는 Preview 재처리는 401 | 소진 작업을 성공으로 표시하지 않고 관리자 권한 필요 |
| 불확실한 응답 | localhost에서 현재 관리자 Route Handler를 실행. 실제 Shopify 이벤트 생성 성공 응답만 시험 프로그램이 503으로 교체. DB pending·attempts=1·last_error 보존 | 실제 공급자 장애는 발생하지 않았으며 장애 응답을 주입함 |
| 수동 복구 | localhost 3003 실제 HTTP POST로 completed·last_error=null. Shopify 이미 DELIVERED여서 이벤트 수 1 유지 | localhost의 의도된 개발 인증 우회 사용. Vercel 관리자 세션 시험은 아님 |
| 복구 후 | Preview 반복 콜백 200, 미완료 목록에서 fixture 제거, 빈 수동 배치 processed=0 | 자동 예약 등록·무한 반복 없음 |

첫 실행은 15개 확인 뒤 localhost 3003 서버 종료로 마지막 HTTP 요청이 ECONNREFUSED였다. 시험 서버를 다시 실행하고 DB에 남은 pending 작업만 재처리해 나머지 4개를 완료했다. 팝빌/정상 배송 앞 단계는 재실행하거나 시험 데이터를 초기화하지 않았다. 애플리케이션 실행 코드·환경변수·원격 설정·배포·SQL 정의는 이번 검증에서 변경하지 않았다.

**남은 검증:** 팝빌 상태 300 이후 국세청 후속 전송과 운영 회원 콜백, 실제 등록 운송장의 17TRACK 상태 변화, 운영의 실제 배송·세무 흐름. 테스트 회원·개발 스토어의 성공을 운영 전체 인수 완료로 해석하지 않는다. D023의 자동 예약 보류와 D024의 기존 팝빌 키 유지 방향은 변경하지 않았다.

시험 결과 검토가 끝나면 사용자가 [cleanup-external-delivery-test.sql](../../../blank-seoul-admin/scripts/performance/cleanup-external-delivery-test.sql)을 테스트 DB에서 직접 실행할 수 있다. 시험 문서·EMS·작업은 현재 유지하며 실제 정산/발행/우체국 접수 대상으로 사용하지 않는다. cleanup은 Supabase의 고정 시험 행만 삭제하며 Shopify 개발 스토어의 두 시험 주문은 별도로 남는다.

### 팝빌 테스트 회원의 실제 요청·취소 콜백 — 2026-10-01

**사용자 push 후 확인 완료:** Admin 양쪽 `d5ab1cf`/READY를 원격 조회했다. 07:30 KST에 인증된 dev Preview 앱 역발행 POST가 HTTP 200·successCount=1·notificationSent=false였고, 새 시험 문서의 실제 Request 콜백 requested/200 확인 후 SDK 취소 및 실제 CancelRequest 콜백 cancelled/500을 확인했다. 별도 MID·공급자 시각을 DB에서 대조했다. 이메일·전화번호를 비웠고 문서는 취소됐다. 아래의 미배포 표시는 최초 SDK 시험 당시 기록이며, 앱 수정의 배포·앱 경로 확인은 이 후속 결과로 완료됐다. [실행 증거](../../../blank-seoul-admin/scripts/performance/external-delivery-test-result.json)의 `popbillApplicationPostDeployTest`를 따른다.

**2026-10-02 실제 Issue 후속 확인:** 팝빌의 테스트 인증서 전용 공급자 `1234567890`을 `MARKETORI` 연동회원으로 가입하고 인증서를 등록했다. 인증된 Preview 앱이 관리번호 `INV-BS-202609-018f0002`, 공급가 1,000원·세액 100원의 역발행 요청을 만들었고 실제 Request 웹훅이 requested/200·상태시각 `20261002190344`로 반영됐다. 사용자가 공급자 화면에서 인증서로 발행한 후 팝빌 조회와 테스트 DB가 issued/300·상태시각 `20261002192124` 및 동일 신규 MID를 반환했다. 연동사 시험 포인트도 3,000원에서 2,900원으로 100원 차감됐다. 연락처를 비워 알림은 발송하지 않았다. TEST 회원·Preview·테스트 DB의 Issue까지 검증했으며 상태 300 이후 국세청 후속 전송과 운영 회원 콜백은 미검증이다. [실행 증거](../../../blank-seoul-admin/scripts/performance/external-delivery-test-result.json)의 `popbillCertifiedSupplierIssueTest`를 따른다.

사용자가 제공한 본인 사업자 정보를 공급자·공급받는자에 사용한 시험 문서의 Request·CancelRequest 콜백을 확인했다. 지인 정보는 불필요했다. 인증된 Preview 역발행 POST에서 필수 `purposeType` 누락으로 팝빌이 거절하는 결함을 발견했고, `purposeType=청구`·`invoiceeType=사업자`를 명시하도록 수정했다. purposeType만 보완한 직접 요청은 일시 오류였고 두 항목을 명시한 뒤 성공했으므로 일시 오류 원인을 단정하지 않는다.

앱 API가 준비한 동일 시험 관리번호에 수정 데이터를 직접 SDK로 등록해 code=1을 받았다. 팝빌의 실제 POST 두 건은 Preview HTTP 200이며 테스트 DB는 requested/200(07:20:25 KST) → cancelled/500(07:21:11 KST), 서로 다른 MID와 공급자 상태시각으로 반영됐다. DB 상태를 수동 변경하지 않았다. 이메일·전화번호를 비웠고 알림톡을 호출하지 않았다. 시험 문서는 취소됐으며 테스트 회원/DB만 사용했다.

최초 SDK 시험에서는 단위 테스트 334개·타입 검사를 통과했지만 앱 POST가 아직 미배포였고 공동인증서도 미등록이었다. 이 당시 Issue·국세청 전송·거부 및 운영 회원의 실제 콜백은 미검증이었다. 이후 앱 배포와 2026-10-02 Issue 확인 결과는 위 후속 기록을 따른다. 구현·실행 근거는 [Admin 세금계산서 SSOT](../../../blank-seoul-admin/doc/notifications/TAX_INVOICE_REVERSE_ISSUANCE_GUIDE.md#실제-테스트-회원-콜백-확인--2026-10-01-07200721-kst), [실행 증거](../../../blank-seoul-admin/scripts/performance/external-delivery-test-result.json)의 `popbillProviderCallbackTest`를 참조한다.

### 로그인 세션을 사용한 Preview 재처리 후속 확인 — 2026-10-01

**17TRACK 공급자 콘솔 시험 확인 완료:** 사용자가 WebHook test의 `Operation done.`을 보고했고, Vercel 요청 로그에서 2026-09-30 22:00:11 UTC / 2026-10-01 07:00:11 KST의 Admin dev Preview `POST /api/webhooks/17track` 응답 200을 확인했다. 앞선 자체 GET 건강 확인(21:53:49 UTC)과 구분했다. 테스트 DB의 EXTCHK26_OK/RETRY 두 작업은 completed/attempts=1/last_error=null/최초 delivered_at을 유지했다. 콘솔 시험의 공급자 발생 요청과 endpoint 수락을 검증했으며, 등록된 실제 운송장의 상태 변화·신규 Shopify mutation·팝빌 직접 이벤트까지 완료한 것으로 확대하지 않는다. 공유 계정의 전체 callback URL과 운영 설정은 변경하지 않았다. 아래 공급자 직접 시험 미실행 표시는 이 콘솔 확인 전 상태다.

**배포·SQL 적용 후 원격 확인 완료:** 사용자가 배포와 fixture reset SQL 실행을 완료했고, Vercel Admin dev alias가 `a6775f1fbfe04c6c95e0d951ff9f14f1ea1579ba` / READY / dev / 비운영 target임을 직접 조회했다. 실제 Preview 관리자 쿠키로 **12개 확인 전부 통과**(2026-09-30 21:51:09–21:51:15 UTC / 2026-10-01 06:51 KST). 테스트 DB의 failed/attempts=5/시험 last_error를 읽고, 개발 스토어·test=true 주문·고정 fulfillment·기존 DELIVERED 이벤트 1개를 확인한 후 시험했다. 인증된 GET에는 실패 작업이 나타났고 비로그인 POST는 401·행 불변, 잘못된 송장 입력은 400 `Invalid tracking number`·행 불변이었다. 올바른 POST는 200/result=completed, DB completed/attempts=1/last_error=null로 복구됐다. 최초 delivered_at·EMS 행·다른 작업은 보존됐고 Shopify 이벤트 ID/내용도 동일했다. 완료 작업은 미처리 목록에서 빠졌으며 반복 POST도 200·DB/Shopify 불변이었다. SQL 적용·push·배포는 사용자가 수행했고 에이전트는 승인된 Preview 관리자 API만 실행했다. [원격 12개 확인 결과](../../../blank-seoul-admin/scripts/performance/external-delivery-test-result.json)의 authenticatedPreviewFollowup을 따른다. 아래 미배포/재시험 필요 기록은 이 확인 전 상태다. 공급자 직접 이벤트는 아직 별도 미검증이다.

사용자가 제공한 테스트 관리자 세션으로 Supabase 사용자 API의 실제 admin 권한과 Preview `GET /api/admin/tracking-deliveries` 200·items=[]를 확인했다. 쿠키·access/refresh/provider token은 Git 밖의 권한 600 파일에서만 사용하며 문서에 기록하지 않았다. 완료된 시험 작업 두 건은 failed 목록에 나타나지 않았다.

하지만 현재 배포 `b4845a3`에서 올바른 JSON의 POST(`trackingNumber=EXTCHK26_RETRY`, 빈 객체, 잘못된 번호 대조군)가 모두 400 `Invalid JSON`을 반환했다. 재처리 RPC/worker 전에 실패하므로 배송 작업은 변경되지 않았다. `requireAdmin`이 native Request를 `new NextRequest(request)`로 감싸면서 원래 요청 본문을 소비하는 경로를 로컬 재현했다. URL과 헤더만 인증용 NextRequest로 전달하도록 수정하여 원래 JSON/multipart 본문을 보존했다. 관리자 역할 검사와 인증 우회 조건은 변경하지 않았다. 개발 서버의 의도된 인증 우회 때문에 이전 localhost 시험에서는 이 경로를 지나지 않았다.

- 신규 실제 NextRequest 기반 회귀 시험 3개는 수정 전 실패·수정 후 통과: JSON 보존, multipart 보존, 401/403 접근 차단 유지.
- 관련 외부 연동 시험 포함 17/17, 전체 Admin 단위 시험 **333/333**, TypeScript 검사 통과. 로컬 코드 검증이며 원격 수정 적용 증거가 아니다.
- 이미 완료된 fixture의 Preview 실패 복구 재시험을 위해 [reset-external-delivery-retry-test.sql](../../../blank-seoul-admin/scripts/performance/reset-external-delivery-retry-test.sql)을 준비했다. 고정 배송/주문/fulfillment 검사 후 한 작업만 failed/attempts=5로 변경하며 Shopify DELIVERED 상태는 유지한다. 로컬 PostgreSQL 확인 6개 통과(프로젝트 확인값, 초기화, 반복 실행 보존, 다른 작업 보존, 활성 claim 차단, 식별 충돌 차단). 사용자 수동 실행 전이며 운영 적용 파일이 아니다.

**공급자 직접 조회:** 팝빌 시험 SDK의 회원 접근 URL로 테스트 콘솔 Webhook 설정을 읽었다. callback origin/path가 Admin dev Preview `/api/tax-invoice/webhook`이고 Vercel 보호 우회 query 및 API 인증키가 비공개 보관 설정과 일치했다. 조회 화면에서 보이는 실행 행은 0개였다. 설정 저장·실제 문서 등록/발행·승인·메일은 실행하지 않았다. 실제 공급자 BUY 이벤트 수신 증거는 여전히 없다. [팝빌 공식 Webhook 계약](https://developers.popbill.com/api-reference/taxinvoice/webhook/introduction).

17TRACK `/track/v2.2/getquota`는 HTTP 200/code=0, quota_total=200·used=42·remain=158·today_used=0이었다. 현재 로컬 운영/시험 API key는 동일하며 양쪽 Webhook Secret은 각 API key와 일치한다. 별도 17TRACK 계정 격리가 완료된 것으로 해석하지 않는다. [공식 API 문서](https://api.17track.net/en/doc)의 push는 account callback으로 전달하고 URL override 인자가 없으므로, 운영과 공유하는 전체 callback을 Preview로 변경하거나 불명확한 계정으로 시험 push를 실행하지 않았다. Console의 URL을 직접 지정하는 WebHook Test 또는 별도 시험 계정에서 공급자 발생 이벤트를 검증해야 한다.

**현재 다음 단계:** 사용자가 인증 본문 보존 코드를 push/Preview 배포하고 위 fixture reset SQL을 테스트 DB에서 직접 실행하면, 승인된 세션으로 실패 목록 → 관리자 POST 재처리 → DB completed → Shopify DELIVERED 이벤트 1개 유지를 원격 확인한다. Supabase SQL 적용·Git push·배포와 실제 공급자 콜백 시험은 이번 후속 작업에서 수행하지 않았다. 자동 예약 보류 D023은 유지한다.

### Preview Google 로그인 설정 누락 확인 — 2026-10-01

**사용자 최종 확인:** 테스트 관리자 권한 등록 후 사용자가 dev Preview 로그인이 잘 작동한다고 확인했고, 이후 운영 Google 로그인도 성공했다고 확인했다. 양쪽 Google 로그인 후 관리자 접근의 사용자 인수 확인을 완료했다. 기존 Google Secret 비활성화/삭제, 공급자 직접 콜백 및 Preview 관리자 배송 재처리는 이 로그인 확인에 포함되지 않는다. 아래 미확인 표시는 각 실행 당시 상태다.

**dev Preview 로그인 후 다시 로그인 화면 — 테스트 관리자 권한 등록:** 테스트 Auth 조회에서 앞서 승인된 Google 계정 2개가 생성되어 있고 last_sign_in_at이 Preview callback 요청 시각과 일치하지만 관리자 수는 0이었다. 보호 경로는 `app_metadata.role` 또는 `roles`의 admin만 통과시키므로 이 계정은 인증 후에도 대시보드에서 차단된다. 사용자 이전 승인 대상 2개만 테스트 Auth Admin API로 기존 `app_metadata`를 보존하면서 `role: admin`을 등록하고 재조회했다. Google identity와 다른 app_metadata 불변 확인. 운영·SQL·코드·Vercel 설정은 변경하지 않았다. Preview callback 로그는 307이며 확보한 요청 로그에는 오류 본문이 없으므로 그것만으로 세션 교환 성공을 확정하지 않는다. 새 Google 로그인 뒤 대시보드 접근은 사용자 확인이 남았다. 아래 관리자 0명 기록은 등록 전 상태다.

**사용자 로그인 시작 주소 확인 후 — main alias 복귀 보완:** 사용자는 `git-main` Admin에서 시작했으며 Google 화면에는 운영 Supabase가 표시됐다고 확인했다. Vercel alias/deployment API에서 해당 주소의 target=production·branch=main·READY·Admin 프로젝트·커밋 `b4845a3`를 확인했다. dev alias는 branch=dev·READY이고 실제 브라우저 로그인 버튼은 테스트 Supabase를 사용한다. main 주소에서 운영 DB를 사용하는 것은 정상이며 이 주소를 테스트 Preview로 취급하지 않는다. main callback의 허용 목록 누락으로 운영 프론트 루트 복귀를 재현한 뒤 운영 `uri_allow_list`에 main callback과 `?next=/artist` 2개만 추가했다. 다른 운영 Auth 필드와 테스트 설정 불변 검사 통과. 직후 첫 복귀 검사는 실패했지만 이후 새 요청에서 main Admin·main 작가 next·기존 운영 Admin 3개 모두 정상 callback 복귀를 확인했다. 실제 계정 로그인 완료는 사용자 확인이 남았다. 새 코드 배포는 필요하지 않다.

**Secret 교체 후 로그인 복귀 오류 진단:** 사용자가 Preview의 `redirect_uri_mismatch`와 이후 운영 프론트 루트로 code가 붙어 복귀하는 현상을 보고했다. 양쪽 실제 authorize URL을 Google까지 따라가서 `/v3/signin/identifier` 진입·주소 불일치 없음·프로젝트별 callback을 확인했다. 별도 임시 브라우저에서 현재 dev Preview `/login`의 Google 버튼을 직접 눌렀을 때 테스트 Supabase authorize, dev Preview `/api/auth/callback` 복귀 요청, Google의 테스트 Supabase callback과 로그인 화면을 확인했다. 로그인 취소를 이용한 복귀 주소 검사에서 테스트→Preview 및 운영→운영 Admin은 요청한 callback으로 302 복귀했다. 대조군인 운영 Supabase→Preview 요청은 허용 목록에서 제외되어 `https://blankseoul.com/`으로 복귀하는 현상을 재현했다. 사용자 요청이 오래된 배포/이전 OAuth 요청인지 확인하려면 로그인 시작 전체 주소와 새 dev 로그인 결과가 필요하다. 실제 사용자 계정 로그인·세션 교환은 아직 미검증이다. 코드·원격 설정·허용 목록 변경은 하지 않았다.

**최신 상태 — 운영 Secret 교체:** 사용자 요청으로 운영 `feezosccyvecmrhqrkgl`의 `external_google_secret`만 로컬에 보관한 새 원본값으로 PATCH했다. HTTP 성공 후 다른 운영 Auth 필드 불변 검사를 통과했다. 보호된 Secret 응답의 운영/테스트 일치 검사는 실패했으며, 이 비교로 원문 적용 여부를 판단할 수 없으므로 검증 근거에서 제외했다. 이후 양쪽 Google enabled=true·Secret 존재·새 PKCE authorize 302→Google 및 각 Supabase callback을 확인했다. Google token endpoint에 잘못된 시험 코드를 전송한 검사에서 새 Secret은 HTTP 400 `invalid_grant`, 잘못된 Secret 대조군은 HTTP 401 `invalid_client`였다. 새 자격증명 수락 근거이며 실제 사용자 로그인은 아직 미검증이다. 테스트에는 PATCH하지 않았고 기존 Google Secret도 비활성화/삭제하지 않았다. 운영 로컬 파일 주석과 공통 목차·환경 문서를 갱신했다. 아래는 교체 전부터의 실행 기록이다.

사용자가 Admin dev Preview `/login`에서 `Unsupported provider: provider is not enabled`를 보고했다. 현재 로그인 버튼은 Google을 요청한다. Management API GET으로 운영 Google enabled=true·Client ID/Secret 존재, 테스트 Google enabled=false·두 자격증명 없음, 테스트 Redirect URLs의 Admin dev alias 허용을 재확인했다. 테스트 `/auth/v1/authorize?provider=google` 직접 요청에서도 HTTP 400과 같은 validation_failed 응답을 재현했다. 이는 관리자 role 검사 또는 OAuth callback 코드 실행 전의 공급자 설정 오류다.

운영 OAuth Client ID로 테스트 Supabase callback을 요청한 별도 비로그인 probe에서는 Google signin/oauth/error의 redirect_uri_mismatch를 확인했다. Google 콘솔의 기존 Web OAuth client에 `https://zijvqethklunvydtqmak.supabase.co/auth/v1/callback` 추가가 선행돼야 한다. Google 콘솔 접근 권한이 없어 사용자에게 이 한 단계의 실행을 요청했다. Provider 설정을 변경하는 임시 도구는 이 callback 수락을 확인하지 못하면 PATCH 전에 중단하도록 준비했으며, 이번 요청에서도 중단돼 원격 Auth 설정·코드·Vercel env는 변경하지 않았다. 기존 Google 자격증명은 메모리에서만 읽고 파일·보고서에 저장하지 않았다.

테스트 Auth Admin API 조회에서는 사용자 1명·관리자 0명이며, 앞서 승인된 운영 관리자 이메일의 테스트 계정은 없었다. Google 활성화 이후 로그인 성공과 테스트 관리자 인가는 별도 확인해야 한다. [환경별 Google 설정 계약](../environment-isolation.md#supabase-auth-url-configuration--2026-10-01-적용)을 따른다.

**Google callback 등록 후:** 사용자가 추가 완료를 알렸고 기존 OAuth client로 테스트 callback을 다시 요청했을 때 Google `/v3/signin/identifier`로 진입해 redirect_uri_mismatch 해소를 확인했다. Supabase GET의 Secret을 원본으로 사용할 수 있다는 이전 설명은 잘못된 것으로 정정했다. 그 조회값으로 테스트 Provider 연결을 시도했으나 저장 후 Secret 검증이 불일치하여 Provider를 다시 false로 변경했다. 테스트 Client ID는 기존 OAuth 앱 값으로 준비했으며, Secret은 원본값으로 다시 설정해야 한다. 운영 Google enabled/Client ID 등록 상태는 유지됐고 원격 운영 PATCH는 하지 않았다. 다른 테스트 Auth 설정 필드는 변경하지 않았다. 로컬 두 프로젝트 `.env` 및 Downloads에서 해당 원본 Google 자격증명 파일을 찾지 못해, 사용자에게 Git 밖의 원본 Secret/자격증명 JSON 경로를 요청했다. 실제 계정 인증·세션 교환·테스트 관리자 권한 등록은 아직 수행하지 않았다. 조회 Secret의 보호값을 원본으로 재사용하거나 단순 SHA-256 비교로 검증하도록 가정하지 않는다.

**새 원본 Secret으로 테스트 Provider 연결:** 사용자가 Google 콘솔에서 기존 OAuth client에 새 Secret을 추가한 것이라고 설명하며 원본값을 제공했다. 테스트 프로젝트만 enabled=true·기존 Client ID·제공된 새 Secret으로 PATCH했다. TTY 입력 echo를 끈 표준 입력에서 메모리로 받았으며 Secret을 파일·로그·문서·코드·Vercel에 저장하지 않았다. 저장값 재조회에서 Google enabled/Client ID/Secret 등록 및 다른 테스트 Auth 필드 불변을 확인했고, 운영 config 전체도 변경 전 GET과 동일했다. 실제 `/auth/v1/settings` Google=true·일반 authorize 302→accounts.google.com·PKCE authorize 302→accounts.google.com 및 redirect_uri=`https://zijvqethklunvydtqmak.supabase.co/auth/v1/callback`을 확인했다. 최초 자동 authorize 검증 요청은 400이라 완료로 판정하지 않았고, 이후 실제 응답 본문/설정 재조회와 새로운 PKCE 요청으로 별도 성공을 확인했다. 사용자 Google 계정의 로그인 완료·authorization code 교환·관리자 API 접근까지 검증한 것은 아니다.

사용자가 기존 Google Secret 삭제 가능 여부를 물어 운영 Supabase가 여전히 기존 값을 사용함을 안내했다. 운영 Provider/Secret 교체나 Google 콘솔의 비활성화·삭제는 수행하지 않았다. [Google 공식 절차](https://support.google.com/cloud/answer/15549257?hl=en)에 따라 운영 새 값 적용·실제 로그인 확인 뒤 기존 Secret을 비활성화하고 다시 확인 후 삭제하는 순서가 필요하다.

**사용자 요청에 따른 로컬 보관:** 이후 사용자가 새 Secret을 Admin `.env.local`/`.env.production.local`에 보관하도록 명시했다. `GOOGLE_OAUTH_CLIENT_SECRET`으로 두 파일에 저장하고, Supabase 관리용·Vercel 등록 불필요·원격 자동 반영 없음과 운영은 아직 기존 값 사용 중임을 주석으로 표시했다. Git ignore 및 비추적 여부를 확인했고 권한 600으로 저장했다. `.env.example`에는 비밀값 없이 주석 처리된 변수명과 관리 목적만 추가했다. dotenv 파싱에서 양쪽 값 일치·키 중복 없음·추적 파일 diff에 해당 비밀값 없음 확인. 원격 운영 Provider 교체·Google Secret 삭제·애플리케이션 코드 변경은 하지 않았다.
