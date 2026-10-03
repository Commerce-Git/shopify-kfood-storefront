# Storefront 운영·개발 연결과 검증

공통 기준: [플랫폼 목차](platform-analysis/README.md), [운영 확인 항목](platform-analysis/OPERATIONS.md). Admin 구현은 [Shopify 연동 가이드](../../blank-seoul-admin/doc/Shopify_API_2026_Guide.md)를 참조한다.

### Admin 재고 위치 — 2026-10-03

`getPrimaryLocationId()`는 운영·테스트 모두 같은 코드로 Shopify `location(id: null)`의 기본 위치를 조회한다. `locations(first: 1)`은 정렬상 첫 위치일 뿐 기본 위치가 아니므로 사용하지 않는다. 서버 전역 위치 캐시를 제거하여 다른 스토어/설정의 ID를 재사용하지 않는다. `SHOPIFY_LOCATION_ID`를 명시한 경우 해당 스토어의 활성·온라인 주문 가능 위치인지 검증하며, 잘못된 ID를 기본 위치로 조용히 대체하지 않는다.

현재 운영 기본 위치는 `112811835704`, 테스트 기본 위치는 `89747128498` (`Shop location`)으로 확인했다. 둘 다 별도 override는 필요하지 않아 로컬/Vercel에 새 위치 변수를 추가하지 않았다. 테스트의 `My Custom Location`은 상품 연결이 없는 다른 위치로, 거기에 재고를 복제하거나 자동 활성화하지 않았다.

상품 신규 등록과 이후 재고 변경은 공통 `setBatchInventoryQuantities`로 `available` 수량을 반영한다. 오류·응답 누락은 완료로 처리하지 않는다. 이 수정은 작가 판매 가능 수량의 Shopify 반영이며 물류 실물 입출고 원장을 변경하지 않는다. [복구·검증](platform-analysis/VALIDATION.md#2026-10-03-shopify-테스트-재고-동기화-복구).

### Admin 상품 공개 채널 — 2026-10-03

Admin 서버의 `SHOPIFY_PUBLICATION_IDS`는 쉼표로 구분한 판매 채널 GID 목록이며 필수다. `SHOPIFY_STORE_URL`에 속한 ID만 허용하고 프론트 Storefront 토큰에 연결된 Headless 채널을 포함한다. 상품 생성 전에 현재 스토어에서 채널을 조회·검증하고, 공개 mutation의 오류와 각 채널의 실제 공개 상태까지 확인한 뒤 `registered`로 저장한다. 중간 공개 실패 후 재시도할 때 같은 상품을 업데이트하도록 생성된 Shopify 상품 ID를 먼저 저장한다. ID 저장 자체가 실패하면 원격 상품 ID를 포함한 오류를 반환하므로 재등록 전에 수동 연결 확인이 필요하다.

| Admin 환경 | 스토어 | 공개 대상 Publication ID (각 값에 `gid://shopify/Publication/` 접두사) |
| --- | --- | --- |
| `.env.local` / Vercel Preview | `blank-seoul-dev.myshopify.com` | `225834336434`, `225834369202`, `225834401970`, `225834533042` |
| `.env.production.local` / Vercel Production | `tv7r0x-zn.myshopify.com` | `293098946872`, `293098979640`, `295843135800`, `298715676984` |

테스트 Headless 채널은 `Blank Seoul Dev Headless` (`225834533042`), 운영은 `kfood-storefront` (`295843135800`)다. 새 채널을 임의로 모두 공개하지 않으며 위 설정은 기존 운영 네 채널 정책과 테스트 대응 채널을 명시한다. 스토어/채널 변경 시 목록을 함께 변경해야 한다. Storefront 프로젝트에는 이 서버 변수를 추가하지 않는다.

로컬 두 파일과 Vercel Admin Production/Preview 등록·저장값 재조회 대조를 완료했다. 새 코드는 사용자 push/배포 후 반영된다. 추가 SQL은 없다. 기존 테스트 상품 `15406484291762`만 공개 복구했으며 운영 상품 변경은 하지 않았다. 검증 상세는 [검증 기록](platform-analysis/VALIDATION.md#2026-10-03-shopify-테스트-판매-채널-공개-복구)을 따른다.

## 연결값

**보호된 Admin Preview의 문의 연결(2026-10-02):** 프론트 dev Preview는 서버 전용 `ADMIN_API_PROTECTION_BYPASS`에 **Admin 프로젝트의** 자동화 접근키를 사용한다. dev 브랜치 Preview 범위에 encrypted 변수로 등록·재조회했고 프론트 문의 프록시에서 HTTPS 업스트림 헤더로만 전달한다. 프론트의 보호 키나 로그인 쿠키로 대체하지 않는다. `NEXT_PUBLIC_` 접두사는 붙이지 않으며 현재 localhost/보호되지 않은 Production에는 등록할 필요 없다. 사용자 재배포 후 `e76ddc2`의 실제 고객 Preview에서 문의 작성·회신·실시간 수신·연결 복구를 확인해 기존 503의 해결을 검증했다. 프론트 브라우저 시험에만 쓴 임시 접근키는 폐기했으며 Admin 기존 접근키를 사용하는 서버 변수는 유지한다. [실제 시험·후속 단계](platform-analysis/INQUIRY_DELIVERY.md#2026-10-02-실제-문의-시험과-preview-연결-보완).

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

### Supabase Auth URL Configuration — 2026-10-01 적용

사용자의 직접 조회·수정 요청에 따라 CLI의 저장된 자격증명으로 Supabase Management API의 `site_url`과 `uri_allow_list`만 수정하고 GET으로 재확인했다. 이는 Supabase 서버에 저장된 **원격 설정**이며, 로컬 `.env`와 Vercel 환경변수는 별도다. SQL/마이그레이션 적용과 Git push는 수행하지 않았다. URL 설정의 변경 전 값은 Git 밖 비공개 파일에 보관했고 관리 토큰을 앱 env에 넣지 않았다.

| 환경 / 프로젝트 | Site URL | 로컬 허용 주소 |
| --- | --- | --- |
| 운영 `feezosccyvecmrhqrkgl` | `https://blankseoul.com` | `http://localhost:3000/**` (프론트), `http://localhost:3002/**` (Admin) |
| 테스트 `zijvqethklunvydtqmak` | `https://blank-seoul-storefront-git-dev-thec9rqwer-4072s-projects.vercel.app` | `http://localhost:3001/**` (프론트), `http://localhost:3003/**` (Admin) |

운영 Redirect URLs의 배포 주소는 현재 코드의 callback 경로로 지정했다:

```text
https://blankseoul.com/auth/callback
https://blank-seoul-storefront.vercel.app/auth/callback
https://blank-seoul-admin.vercel.app/api/auth/callback
https://blank-seoul-admin.vercel.app/api/auth/callback?next=/artist
https://blank-seoul-admin-git-main-thec9rqwer-4072s-projects.vercel.app/api/auth/callback
https://blank-seoul-admin-git-main-thec9rqwer-4072s-projects.vercel.app/api/auth/callback?next=/artist
```

2026-10-01 사용자 로그인 시작 주소 확인 후 Vercel API로 Admin `git-main` alias가 `main` 브랜치의 Production/READY 배포에 연결됨을 확인했다. 이 주소는 운영 Supabase를 쓰는 것이 맞으며 테스트용 주소는 `git-dev`다. 누락됐던 운영 `git-main` callback 2개만 추가하고, 새 OAuth 취소 요청으로 main Admin·main 작가 next·기존 운영 Admin callback 복귀를 확인했다. 변경 전 URL 설정은 기존 Git 밖 비공개 백업의 history에 보관했다. 테스트 설정은 변경하지 않았다.

테스트 Redirect URLs의 배포 주소는 현재 사용하는 dev 브랜치의 고정 Preview 두 개다:

```text
https://blank-seoul-storefront-git-dev-thec9rqwer-4072s-projects.vercel.app/**
https://blank-seoul-admin-git-dev-thec9rqwer-4072s-projects.vercel.app/**
```

테스트 목록에서 운영 주소와 운영 로컬 포트 3000/3002를 제거했고 운영 목록에서 테스트 포트 3001을 제거했다. 임의의 다른 Preview 배포 URL은 허용하지 않으므로 위 고정 주소로 로그인 시험한다. 다른 브랜치/도메인 또는 callback 경로를 사용할 때에는 해당 프로젝트의 목록도 함께 갱신한다. 두 프로젝트가 같은 localhost 호스트를 사용하는 만큼 이 목록은 로그인 복귀 계약이며 DB·권한 격리 전체를 보장하는 장치로 해석하지 않는다.

Site URL은 기본 복귀 주소, Redirect URLs는 코드가 지정한 복귀 주소의 허용 목록이다. 이 변경은 새 로그인 요청에 적용되며 코드/env 변경을 위한 Vercel 재배포가 필요하지 않다. 기존 로그인 진행을 이어서 시험하지 말고 새 로그인부터 시작한다. 테스트 Google Provider는 기존 false를 유지했으므로 Google 기반 관리자·프론트 로그인은 별도 Provider 설정이 필요하다. [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Auth 설정 변경 API](https://supabase.com/docs/reference/api/v1-update-auth-service-config), [실행 확인과 한계](platform-analysis/VALIDATION.md#supabase-auth-url-원격-수정--2026-10-01).

**관리자 인가:** Google 로그인 성공만으로 관리자 권한을 부여하지 않는다. Admin 서버는 `app_metadata.role === "admin"` 또는 `app_metadata.roles`의 admin 항목을 검사한다. 운영에서는 사용자가 지정한 기존 Google 연결 계정 2개에 이 권한을 등록하고 재조회했다. 프로젝트 전체 회원 가입은 구매자/작가와 공유하므로 유지하며, 다른 계정의 관리자 접근은 권한 검사로 차단한다. 권한 변경 뒤 새 로그인으로 확인한다. [권한 등록·callback 보완의 검증 범위](platform-analysis/VALIDATION.md#운영-관리자-google-로그인-검토권한-등록--2026-10-01).

**테스트 관리자 등록 후속 상태:** dev Preview에서 Google 로그인 뒤 다시 로그인 화면으로 돌아오는 보고를 확인했다. 테스트 DB에는 승인된 Google 계정 2개의 로그인 기록이 있었지만 admin role이 없었다. 동일한 승인 대상 2개에만 테스트 Auth Admin API로 `app_metadata.role: admin`을 등록하고 기존 metadata·Google identity 보존을 재조회했다. 운영과 테스트 권한은 별도로 등록하며 OAuth 앱 공유로 자동 복사되지 않는다. 새 Google 로그인 후 대시보드 접근 확인이 남았다. 아래 초기 테스트 관리자 0명 기록은 등록 전 관찰이다.

**사용자 확인 완료:** 권한 등록 후 사용자가 dev Preview의 로그인과 관리자 대시보드 접근이 잘 작동한다고 확인했다. 로그인 인수 확인은 완료했으며 이전 문단의 접근 미확인은 등록 당시 상태다. Google 콘솔의 기존 Secret 비활성화/삭제는 별도 미수행이다.

**Preview 관리자 Google 로그인 준비:** 2026-10-01 사용자 오류 보고 후 재조회에서도 테스트 Provider는 disabled이며 Google Client ID/Secret이 비어 있었다. 기존 운영 Google OAuth 클라이언트로 테스트 callback을 요청하면 Google의 redirect_uri_mismatch를 반환했다. Google Auth Platform → Clients → 해당 Web OAuth client의 Authorized redirect URIs에 `https://zijvqethklunvydtqmak.supabase.co/auth/v1/callback`을 먼저 추가해야 한다. 이는 Supabase Redirect URLs에 등록하는 Admin `/api/auth/callback` 주소와 다른, Google → Supabase 구간이다. 이후 테스트 Supabase Google Provider에 기존 OAuth 앱의 Client ID/Secret을 설정하고 활성화한다. 로그인 앱을 공유해도 두 Supabase 프로젝트의 사용자·세션·관리자 권한은 자동 공유되지 않는다. 현재 테스트 관리자 수는 0이므로 실제 로그인 뒤 승인된 대상의 테스트 권한 등록도 필요하다. [오류 재현과 설정 상태](platform-analysis/VALIDATION.md#preview-google-로그인-설정-누락-확인--2026-10-01), [Supabase Google 공식 설정](https://supabase.com/docs/guides/auth/social-login/auth-google).

**같은 날 후속 상태:** 사용자가 Google callback 추가를 완료했고, 기존 OAuth 클라이언트로 Google 로그인 화면까지 진행됨을 확인했다. Supabase 조회 API의 Secret 응답을 원본 Client Secret으로 복사할 수 있다는 설명은 잘못된 것으로 정정했다. 첫 연결 시도는 검증 불일치 뒤 Provider를 다시 비활성화했다. 이후 사용자가 같은 OAuth 클라이언트에 새 Secret을 추가해 제공했고, 이 원본으로 **테스트 Google Provider를 true로 설정**했다. 실제 Auth settings의 Google=true와 authorize/PKCE authorize의 302→Google 및 테스트 Supabase callback을 확인했다. 사용자 계정의 실제 로그인·세션 교환·테스트 관리자 권한은 아직 미검증이다. 초기 원격 설정은 Secret을 표준 입력에서 메모리로 받아 수행했다. 이후 사용자 보관 요청에 따라 아래 로컬 관리값을 저장했다. 운영 Provider/Secret은 변경하지 않았다.

**Google Secret 로컬 보관:** 사용자 요청으로 Admin `.env.local`과 `.env.production.local`에 서버 전용 `GOOGLE_OAUTH_CLIENT_SECRET`을 저장했다. 두 파일은 Git에서 제외되고 권한 600이며 `.env.example`에는 이름만 주석으로 추가했다. 이 변수는 애플리케이션 실행 코드에서 사용하지 않는 Supabase 설정 관리용 참고값이다. Vercel에 등록하거나 프론트로 공개할 필요가 없다. `.env.local`은 테스트 Provider에 적용된 새 값, `.env.production.local`은 아직 운영에 적용하지 않은 새 값의 보관이라는 주석을 넣었다. 파일 수정은 원격 Supabase 설정을 자동 변경하지 않는다. 새 Secret의 원문은 이 문서에 기록하지 않는다.

**운영 Google Secret 교체 후속 상태:** 사용자 교체 요청으로 운영 Supabase의 `external_google_secret`만 로컬에 보관한 새 원본값으로 PATCH했다. 다른 운영 Auth 필드가 변경되지 않음을 재조회했고, 운영·테스트 authorize/PKCE의 302→Google 및 각 Supabase callback을 확인했다. Google token endpoint에 잘못된 시험 authorization code를 전송한 비교 검사에서 새 Secret은 `invalid_grant`, 잘못된 Secret 대조군은 `invalid_client`를 반환했다. 이는 새 자격증명 수락 근거이며 실제 계정 로그인·세션 교환 완료 증거는 아니다. Supabase 조회 API의 보호된 Secret 응답은 서로 달라 원문 저장값 일치 검증에 사용하지 않았다. 위의 운영 미적용 기록은 교체 전 상태이며, 현재 `.env.production.local` 주석도 적용 완료로 갱신했다. Vercel 재배포는 필요 없다.

**실제 로그인 후속 확인:** 사용자가 dev Preview와 운영 Google 관리자 로그인의 성공을 각각 확인했다. 기존 Secret 비활성화/삭제는 아직 수행하지 않았다.

**기존 Google Secret 정리:** 운영·테스트에서 실제 새 Google 로그인 성공을 확인하고 다른 사용처도 새 값으로 전환했는지 확인한 뒤 이전 Secret을 비활성화한다. 오류가 없으면 삭제한다. [Google 공식 교체 절차](https://support.google.com/cloud/answer/15549257?hl=en)의 적용→확인→비활성화→삭제 순서를 따른다. Google 콘솔의 이전 Secret 비활성화·삭제는 수행하지 않았다.

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

### 2026-10-01 Production 누락 보완 이후 기준

SQL 적용·기존 변경 배포·팝빌 테스트 콘솔 설정은 사용자 완료 보고다. 다음 표는 이후의 Vercel **등록값**이며 이번 코드 보완은 사용자 push/새 배포가 필요하다.

| 설정 | Preview | Production |
| --- | --- | --- |
| `EPOST_USE_PROD` | `false` 유지 | `false` 신규 등록 |
| `POPBILL_WEBHOOK_SECRET` | 테스트용 유지 | 로컬 운영 파일의 별도 키를 Sensitive로 등록 |
| `POPBILL_IS_TEST` | `true` 유지 | 기존 `false` 유지 — 실제 팝빌 환경 |
| `INQUIRY_EMAIL_ENABLED` | `false` 유지 | `false` 유지 |
| `INQUIRY_REALTIME_ENABLED` | `true` 유지 | `false` 유지 |
| 프론트 `NEXT_PUBLIC_STORE_LAUNCH_STATUS` | `preview` 유지 | `preview` 유지 |

Admin의 `BIZ_REG_NO`, `EPOST_KPACKET_APPR_NO`, `EPOST_EMS_APPR_NO`, `SHIPPER_NAME`, `SHIPPER_ADDRESS`, `SHIPPER_CITY`는 각 환경의 기존 로컬 값을 양쪽에 등록했다. 공급자 발급·승인 유효성까지 확인한 것은 아니다. 기존 `EPOST_APPR_NO`는 호환을 위해 보존했다.

- Production의 팝빌 웹훅 설정은 Git 밖의 `/Users/junseoha/.config/blank-seoul/popbill-production-webhook.private.json`에 저장했다. 새 Admin 배포 후 운영 팝빌 사이트에 URL/API Key를 별도로 등록해야 한다.
- 이후 쓰기 보호 구현에서 로컬 `.env.production.local`의 `POPBILL_IS_TEST`도 원격 Production과 같은 **false**로 변경했다. `.env.local`은 true다. 로컬 운영 실행에서 실제 팝빌 모드가 사용되므로 시험 발행은 테스트 DB에 연결된 개발 구성에서 진행한다. 이 파일 변경으로 외부 호출을 실행한 것은 아니다.
- `EPOST_USE_PROD=false`는 우체국 운영 접수 허용을 끈다. 이번 수정은 실제/알 수 없는 등기번호의 취소에도 같은 허용 검사를 적용한다. 기존 문서의 DEV 번호(`MG`/`ML` + 숫자 9개 + `KR`) 취소는 허용한다.
- `CRON_SECRET`을 임의 추가하지 않았다. Admin 일부 worker는 이를 `PIPELINE_SECRET`보다 우선하므로 기존 호출자의 Bearer 값도 함께 바꿔야 한다. 문의 메일을 켤 때 키·스케줄러·실제 발송 시험을 함께 구성한다. GitHub 파이프라인은 현재 코드에서 비활성화돼 있고 외부 cron 서비스 등록은 미확인이다.
- 프론트 `RESEND_WEBHOOK_SECRET`은 양쪽 미등록이다. Resend 해당 endpoint의 signing secret을 받아 등록해야 한다. 임의 생성값이나 `RESEND_API_KEY`로 대신할 수 없다. [공식 서명 검증 안내](https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests)
- 작가 승인·세금계산서·인증서 안내 알림톡 템플릿과 명시적 채널 ID는 미등록이다. 일부 경로는 LMS로 대체하므로 알림 전체가 꺼졌다고 해석하지 않는다. 승인된 템플릿/발신 설정 확인 후 사용한다.
- `SHOPIFY_WEBHOOK_SECRET`은 앱 secret을 사용하는 기존 fallback, 수동 `SHOPIFY_ACCESS_TOKEN`은 OAuth 사용, 시간대·운영 알림 이메일은 코드 기본값 때문에 필수 누락으로 분류하지 않는다. 번역·AI 키는 해당 선택 기능 사용 시 필요하다.
- `STORAGE_*` Supabase 통합 생성 변수는 삭제하지 않았다. 실제 앱의 기본 DB 연결 변수와 구분한다.

**외부 서비스 분리 한계:** Admin의 Resend와 17TRACK 자격증명은 Preview/Production에서 동일하다. 문의 메일 플래그는 다른 OTP/알림 메일을 일괄 차단하지 않으며, 17TRACK에는 이 코드의 별도 시험 서버 분기가 없다. 팝빌 키 공유는 `POPBILL_IS_TEST` 분기로 API 환경을 나누지만, 이것이 모든 외부 전송을 테스트 처리한다는 뜻은 아니다. 현재 구성은 외부 서비스 전체가 격리된 환경으로 판정하지 않는다.

**키 교체 필요:** 팝빌 클라이언트의 하드코딩 기본 키가 현재 Vercel의 `POPBILL_SECRET_KEY`와 일치했다. 코드에서 제거했으나 Git 이력에 남아 있으므로 팝빌에서 연동 키를 교체한 뒤 Admin 양쪽 로컬 파일과 Vercel Preview/Production에 반영해야 한다. 이 키는 `POPBILL_WEBHOOK_SECRET`과 별개다. 공급자 키 교체는 수행하지 않았다.


### 2026-10-03 일일 주문 요약 설정

사용자 요청(D026)에 따라 주문 자동 알림은 한국 09:00 기준으로 작가별 하루 한 번 종합한다. Admin에서 `20261003_01_artist_order_digest.sql` → `20261003_02_artist_order_digest_batches.sql` → `20261003_03_artist_order_digest_start_at_nine.sql` 순서로 운영·테스트 DB에 직접 적용한 후 배포해야 한다. 01·02를 이미 적용했다면 03만 추가 적용한다. 별도 심사한 **운영** 알림톡 코드 `POPBILL_KAKAO_TEMPLATE_ORDER_DIGEST`를 로컬·Vercel Preview/Production에 등록한다. 미등록이면 주문 공개는 진행하고 자동 알림은 건너뛴다. 예약 호출자는 사용자 선택에 따라 cron-job.org 하나를 사용한다. Production API에는 현재 원격에 등록된 `PIPELINE_SECRET` Bearer 헤더로 호출한다. 2026-10-03 재조회에서 Admin Preview/Production의 `CRON_SECRET`은 없고 `PIPELINE_SECRET`은 있음을 확인했다. 로컬에는 `CRON_SECRET`도 있으므로 로컬 호출에는 그 값이 우선한다. 새 키를 추가하면 기존 호출자 인증이 바뀔 수 있어 임의 추가하지 않는다. 초기 권장 예약 창은 Asia/Seoul 09:00~10:59 매분이며, 집계 기준·준비 시작은 09:00이며, 집계 저장 완료 후 발송한다. 이후 호출은 저장된 남은 묶음과 결과 조회를 이어 처리하며 완료된 묶음을 재발송하지 않는다. Vercel 크론 설정은 제거했고 Preview는 별도 호출 시험이다. 202 응답은 실행 요청 접수이며 실제 발송 결과는 DB·서버 로그에서 확인한다. 같은 인증으로 `?status=1`을 조회하면 실행 없이 준비 수·남은 묶음·접수/전송 결과를 확인한다. 이전 `POPBILL_KAKAO_TEST_PHONES`는 미사용이므로 삭제 가능하다. 01·02 SQL 적용은 사용자 보고 후 필요 테이블·함수 존재를 확인했고 예약은 비활성 등록했다. 후속 03 SQL 실행 완료도 사용자 확인으로 기록했다. 템플릿 승인·변수 등록·배포·실제 수신·예약 활성화는 남아 있다. [알림 적용 순서·예약 한계](../../blank-seoul-admin/doc/notifications/KAKAO_POPBILL_SETUP_AND_OPERATIONS_GUIDE.md#작가별-일일-주문-알림-2026-10-03)를 따른다.

### 2026-10-01 외부 오류 복구 구현의 적용 조건

팝빌 일반 API·SMS/OTP는 공통 모드 검증을 사용하고 Preview/development에서 POPBILL_IS_TEST=false를 차단한다. 개별 isTest 인자는 서버 모드와 같아야 한다. **2026-10-03 사용자 확인에 따른 카카오톡 예외:** 카카오톡은 팝빌 운영 계정·실제 포인트를 사용해야 한다는 안내에 따라 별도 SDK 인스턴스로 항상 운영 API를 호출하도록 보완했다. 세금계산서·계좌 확인·SMS는 기존 모드를 유지한다. 사용자 단순화 요청에 따라 번호 사전 등록 제한을 제거했다. Production·Preview·로컬 모두 입력한 유효한 수신번호로 발송하며 `POPBILL_KAKAO_TEST_PHONES`는 사용하지 않는다. 관리자의 시험 발송은 실제 포인트 차감을 별도 확인한다. 이는 로컬 구현이며 새 배포·실제 수신은 미검증이다. [알림 설정 원본](../../blank-seoul-admin/doc/notifications/KAKAO_POPBILL_SETUP_AND_OPERATIONS_GUIDE.md#카카오톡-api-상품-권한-오류와-적용-설정)을 따른다. 누락 설정/권한 오류를 Mock 성공으로 처리하지 않는다.

새 Vercel 변수는 추가하지 않았다. Admin SQL 01(기적용) → 02(세금계산서 쓰기 보호), 03(배송 반영 작업)을 **새 코드 배포 전에** 각 DB에 수동 적용해야 한다. 프론트 실행 코드는 이번에 변경하지 않았다. 배송 worker는 기존 CRON_SECRET/PIPELINE_SECRET 인증을 사용하며 예약 호출자 설정이 필요하다. [팝빌 적용 원본](../../blank-seoul-admin/doc/notifications/TAX_INVOICE_REVERSE_ISSUANCE_GUIDE.md#세금계산서-쓰기-보호--현재-적용-기준), [배송 복구 원본](../../blank-seoul-admin/doc/logistics/ARTIST_LOGISTICS_WORKFLOW.md#7-배송-완료-외부-반영복구-계약)을 따른다.

### 2026-10-03 Vercel 환경·주문 예약 재검토

사용자 요청으로 Admin/Storefront의 Production·Preview 공통 등록 목록과 dev 기준 내려받은 값을 재조회했다. 네 배포 모두 READY이며 Admin main/dev는 `428ab8e`다. 새 일일 요약 변경은 아직 로컬에 있다. 최초 검토는 읽기 전용이며, 이후 사용자 실행 요청으로 아래 시험 회원 ID의 프로젝트 위치만 수정했다. 기존 예약은 보존했고 후속 실행 요청으로 새 요약 예약만 비활성 등록했다.

- 두 프로젝트 모두 Production은 운영 Supabase `feezosccyvecmrhqrkgl`·운영 Shopify, Preview는 테스트 Supabase `zijvqethklunvydtqmak`·개발 Shopify다. 내려받을 수 있는 Supabase anon/service-role JWT의 프로젝트·역할도 일치한다. 이 대조를 모든 API의 실제 권한 검증으로 해석하지 않는다.
- 같은 환경의 Admin/Storefront 캐시 갱신 키는 같고 Production/Preview 간에는 다르다. 고정 프론트↔어드민 주소도 각 환경에 맞는다. Sensitive 변수는 등록 여부만 확인하며 원문 값 일치까지 확인한 것은 아니다.
- **발견 및 수정 완료:** `POPBILL_TEST_SUPPLIER_USER_ID=thec9rqwertest`가 Storefront Preview에 잘못 등록돼 있어 사용자 실행 요청 후 Admin Preview에 추가하고 Storefront에서 제거했다. Admin dev 기준 값을 내려받아 일치를 확인했고, 원격 재조회에서 Admin Preview에만 존재하며 양쪽 프로젝트의 다른 변수는 변하지 않았음을 확인했다. Admin 로컬 `.env.local`은 이미 같은 값이고 다른 로컬 환경에는 없다. Production에는 등록하지 않았다. 환경변수 저장은 완료됐으며 실제 배포 앱 반영에는 사용자 Preview 재배포가 필요하다.
- 심사중인 일일 요약·세금계산서 템플릿 코드는 아직 원격에 없다. 승인 후 Admin 양쪽의 `POPBILL_KAKAO_TEMPLATE_ORDER_DIGEST=026100000103`, Preview의 `POPBILL_KAKAO_TEMPLATE_TAX_INVOICE=026100000102`, Production의 같은 키 `026100000104`를 연결한다. 기존 `POPBILL_KAKAO_TEMPLATE_ORDER=026090000102`는 아직 단건 시험 코드가 사용하므로 일일 코드로 덮어쓰거나 삭제하지 않는다.
- Admin의 `POPBILL_IS_TEST`는 Production false/Preview true, `BYPASS_AUTH`는 양쪽 false, `EPOST_USE_PROD`는 양쪽 false다. `INQUIRY_REALTIME_ENABLED`는 Production false/Preview true이며 `INQUIRY_EMAIL_ENABLED`는 양쪽 false다. 출시 정책과 별개인 현재 기능 활성화 상태로 기록하며 이번에 바꾸지 않았다.
- Storefront의 `NEXT_PUBLIC_STORE_LAUNCH_STATUS`는 양쪽 preview다. 배포 환경 이름과 독립된 판매 정책이다. `RESEND_WEBHOOK_SECRET`은 양쪽 미등록으로 메일 이벤트 웹훅을 사용하려면 공급자가 발급한 서명키 등록이 필요하다. 일반 메일 발송 키와 다르며 일일 주문 알림 크론의 필수 변수는 아니다.
- **주문 예약 보존·요약 분리 완료(코드는 미배포):** 기존 `8031098`은 `/api/cron/send-artist-emails`를 종일 30분마다 호출하며, Shopify 동기화 `8440379`와 함께 설정을 그대로 유지했다. 사용자 3시간 공개 요구에 따라 로컬의 기존 GET은 공개만 수행하고, 새 `/api/cron/process-artist-order-digests`가 요약 집계·발송·결과 조회를 수행한다. cron-job.org API로 `8567586` (`BLANK SEOUL Artist Daily Order Digest`)을 Asia/Seoul 09:00~10:59 매분·비활성으로 생성하고 인증 헤더·시간·기존 예약 보존을 재조회했다. 후속 09:00 집계 시작용 03 SQL의 운영·테스트 실행 완료는 사용자 확인으로 기록했고, 사용자 배포·템플릿 승인과 연결·실제 수신 시험 후 활성화한다. [현재 등록값](../../blank-seoul-admin/doc/notifications/KAKAO_POPBILL_SETUP_AND_OPERATIONS_GUIDE.md#cron-joborg-등록값)을 따른다.
- cron-job.org 계정 관리 키는 사용자 요청으로 Admin `.env.local`과 `.env.production.local`에 같은 `CRON_JOB_ORG_API_KEY` 값으로 보관했다. Next.js 실행용 변수가 아니므로 Vercel에는 등록하지 않는다. 예약이 우리 API를 호출할 때 쓰는 `PIPELINE_SECRET`과 구분한다. 계정 관리 키로 실제 예약 목록·상세 읽기 조회를 성공했다.


### 2026-10-03 주문 요약 코드 배포 확인

사용자 push 후 Admin Production/main (`dpl_Beo8sfjqDoH1ipty4HB5bLKmWuvi`)과 Preview/dev (`dpl_6CbZxwjZeM2FrKWuPW8hD7y3UUAQ`) 모두 커밋 `ad29ecb30f047516395048202dbae8317c9ed51d`·READY를 관리 API로 확인했다. 양쪽 새 `/api/cron/process-artist-order-digests?status=1`은 인증 누락·불일치에 401, 정상 배포용 키에 200을 반환했고 작업·묶음은 0건이다. Preview에는 Vercel 보호 우회 헤더를 함께 사용했다. 현재 원격 `PIPELINE_SECRET`은 양쪽 공통 등록이다. 로컬 Preview 키는 원격과 달라 인증에 실패했고 기존 예약의 정상 비공개 헤더로 성공을 확인했다. 키나 원격 설정을 바꾸지 않았다. 주문 공개 API 실행·발송·포인트 사용은 없었다. 요약 예약 `8567586`은 비활성, 기존 두 예약은 활성 상태다. 다음 작업은 [Admin TODO](../../blank-seoul-admin/TODO.md)를 따른다.
