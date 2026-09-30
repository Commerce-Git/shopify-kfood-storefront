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

문의 API의 서버 설정 `ADMIN_API_URL`이 있으면 `NEXT_PUBLIC_ADMIN_API_URL`보다 우선한다. 두 값을 사용하는 경우 같은 Admin으로 지정한다. 상품 미리보기는 브라우저에서 `NEXT_PUBLIC_ADMIN_API_URL`의 정확한 origin과 실제 부모/팝업 창을 검사한다. 경로·쿼리·인증정보가 붙은 주소는 허용하지 않는다. 로컬은 localhost HTTP를 허용한다.

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
