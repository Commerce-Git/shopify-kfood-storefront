# Storefront 운영·개발 연결과 검증

공통 기준: [플랫폼 목차](platform-analysis/README.md), [운영 확인 항목](platform-analysis/OPERATIONS.md). Admin 구현은 [Shopify 연동 가이드](../../blank-seoul-admin/doc/Shopify_API_2026_Guide.md)를 참조한다.

## 연결값

변수명은 환경마다 같고 값은 연결 대상에 맞춘다. 로컬 `.env.local`과 Vercel Preview는 별도 설정이다. 로컬 파일을 수정해도 Vercel 설정은 변경되지 않는다.

| 변수 | 로컬 개발 | Vercel Preview | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` | 고정된 프론트 Preview origin | `https://blankseoul.com` |
| `NEXT_PUBLIC_ADMIN_API_URL` | `http://localhost:3003` | 같은 환경의 Admin Preview origin | 운영 Admin origin |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` / `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | 개발 스토어 도메인 / 공개 토큰 | 개발 스토어 도메인 / 공개 토큰 | 운영 스토어 도메인 / 공개 토큰 |
| `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` | 설치된 앱 자격증명 | 설치된 앱 자격증명 | 설치된 앱 자격증명 |
| Supabase URL / anon key / service role key | 테스트 프로젝트 | 테스트 프로젝트 | 운영 프로젝트 |
| `UNSUBSCRIBE_SECRET` | 개발 전용 키 | Preview 전용 키 | 운영 키 유지 |

같은 Shopify 앱을 두 스토어에 설치했다면 앱 자격증명은 같아도 된다. Storefront 공개 토큰은 각 스토어에서 발급한 것을 사용한다. 앱 Secret, service role key, 수신거부 키는 브라우저 공개 변수로 만들지 않는다.

문의 API와 상품 미리보기는 `NEXT_PUBLIC_ADMIN_API_URL` 하나를 사용한다. 이전 서버 별칭 `ADMIN_API_URL`은 더 이상 읽지 않는다. 상품 미리보기는 브라우저에서 `NEXT_PUBLIC_ADMIN_API_URL`의 정확한 origin과 실제 부모/팝업 창을 검사한다. 경로·쿼리·인증정보가 붙은 주소는 허용하지 않는다. 로컬은 localhost HTTP를 허용한다.

`NEXT_PUBLIC_*` 값은 빌드 시 브라우저 코드에 포함되므로 변경 후 새 빌드가 필요하다. 프론트의 로그인 콜백도 해당 Supabase 프로젝트의 허용 URL에 등록해야 한다. 개발·운영의 스토어 ID, 고객·주문 ID를 섞어 복사하지 않는다.

## 구현한 경계

- **Admin API 토큰:** `shopify_token_cache.id`에 스토어 도메인·Client ID·Client Secret의 해시를 포함한다. 이전 공용 `admin_token` 행은 읽거나 삭제하지 않는다. 첫 요청에서 새 토큰을 얻고 기존 TEXT PK 테이블에 별도 행을 저장한다. 저장 실패 시 메모리 캐시로 계속 동작한다. 추가 SQL은 필요 없다. 새 토큰 응답이 잘못되었거나 설정이 없으면 재사용하지 않는다.
- **새 수신거부 링크:** `v2.` 서명에 사이트 origin·Shopify 도메인·Supabase URL·이메일·작가를 포함한다. 키가 같아도 대상 환경이나 수신자가 다르면 검증에 실패한다. 주소 또는 Secret이 없으면 링크 생성에 실패하며 운영 주소로 대체하지 않는다. Vercel Preview에서 운영 사이트 주소를 설정한 경우에도 거절한다.
- **기존 운영 이메일 호환:** `https://blankseoul.com`이며 `VERCEL_ENV`가 preview가 아닐 때만 이전 서명을 허용한다. 이전 형식에는 생성 환경 정보가 없어 과거에 동일 키로 발급된 링크의 출처를 구별할 수 없다. 기존 링크를 모두 폐기할 때는 운영에 `UNSUBSCRIBE_ACCEPT_LEGACY=false`를 설정한다. 운영 Secret은 이번 변경으로 교체하지 않는다. 개발 키는 운영과 분리한다.
- **상품 미리보기:** 접두사/부분 문자열/전체 `vercel.app` 허용과 `*` 수신 대상 전송을 제거했다. 다른 창이 보내거나 설정과 다른 origin이면 상품 데이터를 반영하지 않는다.

## 적용과 확인 순서

1. `.env.example`을 기준으로 Vercel의 Preview/Production 값을 각각 대조한다. Preview의 `NEXT_PUBLIC_SITE_URL`에는 고정 Preview 프론트 주소를, `NEXT_PUBLIC_ADMIN_API_URL`에는 고정 Preview Admin 주소를 넣는다. Preview의 `UNSUBSCRIBE_SECRET`, `CRON_SECRET`, `REVALIDATE_SECRET`은 운영과 분리하고, 재검증 키는 같은 환경의 Admin과 맞춘다.
2. Git push 및 배포 후 개발 상품 조회, 로그인 복귀, Admin에서 상품 미리보기, 테스트 이메일의 링크 주소와 수신거부 반영 DB를 확인한다. Vercel 배포 보호가 서버 간 문의 요청을 차단하지 않는지도 확인한다.
3. `NEXT_PUBLIC_STORE_LAUNCH_STATUS=preview`는 구매 기능을 끄는 값이며 Vercel Preview라는 배포 유형과 다르다. 개발 스토어·테스트 결제 연결 확인 후 구매 시험 환경에서만 `live`로 설정하고 다시 빌드한다. 이번 코드 변경은 판매 상태를 바꾸지 않는다.
4. `RESEND_API_KEY`가 있으면 실제 메일이 발송될 수 있다. 시험은 지정된 테스트 수신자로 진행한다. 운영 고객 데이터 복제 및 외부 발송 시험은 이번 검증에 포함하지 않는다.

## 검증 범위

`tests/unit/environment-isolation.test.ts`는 가상 DB/HTTP로 같은 DB에서 스토어·앱·키 교체별 토큰 분리, 기존 캐시 무시, 재시작·만료·오류 처리, 환경 간 수신거부 서명 거절, 미리보기 origin/창 검사를 확인한다. 실제 Shopify·Supabase·Vercel에 연결하지 않는다. 로컬 단위/타입 검사의 성공은 배포 설정 또는 결제 E2E 성공을 의미하지 않는다.


## 2026-09-30 로컬 환경변수 보완

사용자가 운영·테스트 DB의 문의 SQL 적용과 배포 성공을 보고했다. 이 절은 그 이후 로컬 환경변수 정리와 추가 코드 보완이며, 기존 Vercel 배포에 자동 반영된 변경이 아니다.

| Admin 변수 | `.env.local` | `.env.production.local` |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3003` | `http://localhost:3002` |
| `NEXT_PUBLIC_STORE_PREVIEW_URL` | `http://localhost:3001/product/preview` | `http://localhost:3000/product/preview` |
| `STOREFRONT_REVALIDATE_URLS` | `http://localhost:3001` | 기존 운영 프론트 주소 유지 |
| `STOREFRONT_URL` | 기존 dev 브랜치 프론트 Preview HTTPS 주소 | `https://blankseoul.com` |
| `EPOST_USE_PROD` | `false` | `false` |
| `INQUIRY_REALTIME_ENABLED` | `true` | `false` |
| `INQUIRY_EMAIL_ENABLED` | `false` | `false` |

2026-10-01 변경 이후 `STOREFRONT_URL`은 미리보기·캐시 갱신·문의 답변 이메일의 기본 origin이다. 아래 로컬 override가 있으면 미리보기·캐시 갱신은 별도 주소를 사용한다. 메일 작업자는 HTTPS를 요구하므로 테스트 파일은 기존 프론트 Preview origin을 사용한다. 로컬 문의 화면·미리보기·캐시 갱신은 위 localhost 연결을 사용한다. Preview 링크의 실제 접근/배포 보호와 메일 수신은 미검증이며 발송은 비활성이다. Vercel에는 localhost 주소를 복사하지 않고 같은 환경의 배포 origin을 입력한다.

- Admin/Storefront의 테스트 `REVALIDATE_SECRET`·`CRON_SECRET`을 환경 내에서 일치시키고 운영과 분리했다. 운영에 이미 있던 키는 유지했다. Admin 운영 파일에 없던 `CRON_SECRET`은 기존 운영 프론트의 값과 맞췄다.
- 테스트 Admin의 `PIPELINE_SECRET`을 운영과 분리했다. Admin 양쪽에 서로 다른 `POPBILL_WEBHOOK_SECRET`을 생성했다. 실제 값은 Git 제외된 각 `.env` 파일에서 관리하며 문서·로그에 복사하지 않는다.
- `.env.production.local`에 `BYPASS_AUTH=false`를 명시했다. `.env.local`의 기존 로컬 인증 우회는 유지했으므로 실제 권한 시험 때에는 `false`로 바꾸고 로그인한다. 쉘에서 이미 설정한 환경변수는 로컬 dotenv보다 우선할 수 있다.
- 당시에는 Shopify·팝빌의 서버/화면 변수를 맞췄다. 2026-10-01에는 공개 중복 변수 두 개를 제거하고 서버 기준값을 화면에 전달하도록 변경했다. 로컬 팝빌 테스트 모드는 유지했다.
- Shopify 앱 자격증명 및 Resend·우체국·팝빌 등의 공급자 키는 임의로 교체하지 않았다. 공급자 키 공유 여부만으로 외부 부수효과까지 완전히 격리됐다고 판정하지 않는다.

추가 코드 경계:

1. `EPOST_USE_PROD=true`가 있어야 실제 우체국 **접수**가 허용된다. 미설정/false에서 운영 접수 요청은 거절하며, `NODE_ENV=production`만으로 운영 접수를 선택하지 않는다. `VERCEL_ENV=preview/development` 또는 `NEXT_PUBLIC_APP_ENV=development/test/preview`에서는 true를 설정해도 운영 접수를 거절한다. 명시적인 테스트 요청(false)은 DEV 접수를 사용한다. 운영 로컬 파일에도 기본 false를 넣었으므로 실제 접수 검증을 수행하려면 운영 환경에서 별도로 true를 설정해야 한다. 기존 확인/취소 API와 다른 공급자 전체를 이번 접수 모드 경계로 보호했다고 간주하지 않는다.
2. 캐시 갱신의 하드코딩된 비밀값·운영 URL fallback을 제거했다. 설정 누락/잘못된 origin이면 갱신 호출을 생략하며, 테스트/Preview에서 `blankseoul.com` 및 그 하위 도메인으로 갱신하지 않는다. 운영의 다른 별칭까지 자동 식별하는 정책은 아니다.
3. 팝빌 세금계산서 webhook은 `POPBILL_WEBHOOK_SECRET`이 없으면 503, 값이 다르면 401로 중단한다. 외부 콜백을 사용하는 환경은 **배포 전에** 발신 설정과 수신 서버의 값을 일치시켜야 한다. 이번 작업에서 팝빌 관리자나 원격 환경변수는 변경하지 않았다.

적용 순서: 로컬 양쪽 서버 재시작 → 로컬 미리보기·캐시 갱신 확인 → Vercel 환경별 주소/키 등록과 스케줄러·콜백 발신 설정 대조 → 사용자 push/배포 → Preview 검증. 로컬 파일의 키 변경은 기존 원격 스케줄러·Vercel에 전달되지 않는다. 운영 배포에서 실제 우체국 접수가 필요하면 `EPOST_USE_PROD=true`와 운영 환경 식별을 함께 확인한다.

## 2026-10-01 환경변수 단순화 적용

**코드·로컬 파일·Vercel 등록값 정리 완료, 새 코드 배포는 미실행.** 사용자 요청에 따라 프론트와 Admin의 설정을 함께 정리했다. 기존 배포는 생성 당시 설정을 유지한다. 다음 배포는 아래 기준을 사용하는 변경 코드로 진행해야 하며, 옛 코드로 새 빌드를 만들면 제거된 변수에 의존하는 기능이 잘못 동작할 수 있다.

### 현재 관리 기준

| 기능 | 관리할 기준값 | 제거하거나 선택 사항으로 바꾼 값 |
| --- | --- | --- |
| Admin 팝빌 모드 | `POPBILL_IS_TEST` | `NEXT_PUBLIC_POPBILL_IS_TEST` 제거. 화면은 기존 계좌 API의 `is_test_mode`를 사용하고 응답 전에는 인증 버튼을 비활성화한다. 과거 `bank_verify_mode`는 인증 이력으로 별도 유지. |
| Admin Shopify 링크 | `SHOPIFY_STORE_URL` | `NEXT_PUBLIC_SHOPIFY_STORE_URL` 제거. 서버 레이아웃이 검증된 공개 도메인만 화면에 전달한다. |
| Admin 프론트 연결 | `STOREFRONT_URL` | `/product/preview`와 캐시 갱신 기본 origin을 유도. `NEXT_PUBLIC_STORE_PREVIEW_URL`, `STOREFRONT_REVALIDATE_URLS`는 로컬/다중 대상 override로만 유지하고 일반 Vercel 등록에서는 제거. |
| 프론트 Admin 연결 | `NEXT_PUBLIC_ADMIN_API_URL` | `ADMIN_API_URL` 별칭 읽기 제거. |
| 프론트 Shopify 연결 | `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` 별칭 읽기 제거. |
| 판매 공개 상태 | 프론트의 `NEXT_PUBLIC_STORE_LAUNCH_STATUS` | 사용하지 않는 Admin 등록만 제거. 프론트 값은 유지. |
| 캐시 갱신 인증 | 환경별 `REVALIDATE_SECRET` | 같은 환경의 프론트/Admin 값은 일치. Preview는 시험 키로 분리하고 Production 키는 보존. |

공개 설정은 서버 레이아웃/기존 계좌 응답으로 전달한다. 별도 설정 조회 API나 주기적인 조회를 추가하지 않았다. Shopify 앱 Secret·DB service role 등의 서버 비밀값은 공개 설정에 포함하지 않는다. 상품 미리보기 메시지도 지정 origin과 실제 iframe 창만 허용한다.

### Vercel에서 확인한 값

| 항목 | Preview | Production |
| --- | --- | --- |
| Admin `POPBILL_IS_TEST` | `true` | `false` |
| Admin `INQUIRY_REALTIME_ENABLED` | `true` | `false` |
| Admin `INQUIRY_EMAIL_ENABLED` | `false` | `false` |
| Admin `EPOST_USE_PROD` | `false` | 미등록 — 실제 접수 사용 여부 답변 대기 |
| 프론트 `NEXT_PUBLIC_STORE_LAUNCH_STATUS` | `preview` | `preview` |
| DB·Shopify·상호 연결 주소 | 개발 스토어·테스트 DB·고정 Preview 주소 | 운영 스토어·운영 DB·운영 주소 |

Production이라는 배포 이름이 모든 기능의 실제 처리를 의미하지 않는다. 판매 공개·메일·팝빌·배송은 각각 독립적으로 관리한다. `EPOST_USE_PROD`가 없으면 새 코드에서 실제 접수를 허용하지 않으므로, 실제 배송 사용 여부를 확인한 뒤 운영 배포해야 한다. 로컬 `.env.production.local`의 팝빌은 기존 `true`, 우체국은 `false`를 유지했다. 운영 DB를 보는 로컬 실행과 실제 외부 처리는 별개다.

### 파일 관리와 선택 기능

양쪽 `.env.example`과 실제 로컬 파일은 기본 연결, 주소, 기능 모드, 선택 기능으로 묶었다. 예제의 주석 항목을 전부 Vercel에 등록할 필요는 없다. 빈 로컬 placeholder는 기능 설정 완료를 의미하지 않으며 Vercel에 업로드하지 않았다.

- `CRON_SECRET`과 `PIPELINE_SECRET`은 기존 외부 호출자 인증 때문에 유지했다. 문의 메일 worker를 켤 때는 `CRON_SECRET`과 실제 스케줄러 호출을 함께 설정한다. 다른 worker의 인증 우선순위에도 영향을 주므로 한쪽 값만 추가/교체하지 않는다.
- 팝빌·Resend webhook secret, 알림톡 템플릿, 배송 사업자/승인 정보는 기능을 사용할 때 발신 측과 함께 설정한다. 이번 작업은 공급자 콘솔 연결을 완료하지 않았다. 팝빌 콜백의 proxy 인증 경로 문제도 별도 확인 대상이다.
- `STORAGE_*` integration 값, Kakao 설정 등은 외부 사용 여부가 확인되지 않아 보존했다. 앱 직접 참조 없음만으로 공급자 연결을 삭제하지 않았다.
- `NEXT_PUBLIC_APP_ENV`는 로컬 연결 환경 표시로 유지한다. Vercel에서는 기본 `VERCEL_ENV`를 사용하며 별도 등록하지 않는다.
- Supabase 공개/서버 키, Shopify Storefront/Admin 자격증명, 문의 실시간/메일 플래그, 서로 다른 용도의 서명 키는 통합하지 않는다.

### 다음 배포

1. 양쪽 코드와 예제·문서를 함께 커밋하고 사용자가 push한다. 실제 `.env.local`, `.env.production.local`은 Git 제외 상태를 유지한다.
2. 프론트 → Admin 순서로 같은 환경에 변경 코드를 배포한다. Preview 캐시 키가 달라 한쪽만 새 배포인 동안 캐시 갱신이 401일 수 있으므로, 양쪽 배포 완료 후 상품 미리보기, 팝빌 모드 표시, 문의 조회와 캐시 갱신을 확인한다. 양쪽 Preview 키를 함께 바꿨으므로 두 프로젝트 모두 새 배포가 필요하다.
3. Production 우체국 실제 접수 필요 여부를 결정하고 변경 코드로 운영 배포한다. 기존 코드 SHA를 그대로 재빌드하지 않는다.

검증 결과와 한계는 [실행 기록](platform-analysis/VALIDATION.md#환경변수-단순화-적용-검증)을 참조한다.

재검토에서 작가 프로필/이름 변경도 중앙 JSON 캐시 요청과 Next `after`를 사용하도록 보완했다. 프론트는 작가 목록과 상세 페이지의 다음 접근 시 캐시가 갱신되도록 무효화한다. 설정 주소의 path/query/hash·자격증명도 검사한다. [정밀 재검토 기록](platform-analysis/VALIDATION.md#환경변수-변경-정밀-재검토)에 남은 배포 조건과 검증 범위를 기록했다.

팝빌 callback은 이후 공식 X-Api-Key 인증과 정확한 proxy 예외, 원자 반영 RPC로 구현했다. Preview 키 등록은 완료됐으며 SQL 적용·배포·외부 콘솔 설정이 남았다. [현재 적용 절차](../../blank-seoul-admin/doc/notifications/TAX_INVOICE_REVERSE_ISSUANCE_GUIDE.md#b-p2-팝빌-웹훅-수신--2026-10-01-구현-기준)를 따른다.
