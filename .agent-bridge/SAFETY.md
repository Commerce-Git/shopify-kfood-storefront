# 프로젝트 권한과 수동 작업

작업 루트: /Users/junseoha/Downloads/blank-seoul-storefront

- Antigravity Project의 Folders에는 위 프로젝트만 등록합니다. Downloads 전체나 다른 프로젝트를 추가하지 않습니다.
- Permission Settings는 Default(샌드박스 내부 실행)로 설정합니다. Turbo, 전체 권한 우회, unsandboxed 허용은 사용하지 않습니다.
- MCP의 Supabase SQL 실행, 배포, Git push는 자동 작업에서 제외합니다. CLI 프로젝트에서도 해당 MCP를 비활성화하거나 Deny로 설정합니다. 터미널 샌드박스는 MCP 호출을 통제하지 않습니다.
- SQL 파일 작성과 검토는 가능하지만 실제 SQL 실행·마이그레이션 적용·Git push는 사용자가 직접 합니다. 필요한 수동 작업은 REPORT.md에 기록합니다.
- Codex 계획/검토는 read-only이며 결과 문서는 오케스트레이터가 저장합니다.
- 테스트는 macOS sandbox-exec에서 네트워크 없이 실행합니다. 쓰기는 프로젝트와 실행별 임시 폴더로 제한되며 .git, 브리지 제어 파일, .env 접근은 차단됩니다. 미지원 OS나 샌드박스 시작 실패 시 일반 실행으로 전환하지 않습니다.
- 현재 agy 호출은 --sandbox를 사용하지만 사용자/프로젝트 권한과 MCP를 자동으로 감사하지 않습니다. 범위 제한을 완전히 검증했다는 뜻이 아닙니다.
- doctor는 CLI 버전만 확인합니다. 인증·모델 호출·파일 구현은 별도 통합 테스트가 필요합니다.

공식 안내: https://antigravity.google/docs/sandbox?tab=cli

## 2026-09-23 적용 상태

- 전용 Antigravity 프로젝트 `agent-bridge-storefront`: Folders는 위 storefront 한 폴더만 등록.
- CLI 신뢰 폴더에 storefront 추가. 파일 Allow는 해당 경로만 추가했으며 기존 어드민 설정은 보존.
- `.env.local` 등 현재 루트의 `.env*` 경로 읽기와 `.git`, `.codex`, `.agents`, `.gemini` 쓰기 Deny 추가.
- CLI 설정 백업: `~/.gemini/antigravity-cli/settings.before-agent-bridge.json`.
- `agy mcp list`: 등록된 MCP 서버 없음. 자동 실행기는 이 상태를 매번 확인하고 서버가 추가되면 중단.
- 전역 셸·MCP 자동 승인 또는 전체 권한 우회는 추가하지 않음. SQL·Git push는 계속 수동.

CLI 파일 권한은 `~/.gemini/antigravity-cli/settings.json`에서 관리됩니다. 새 `.env` 파일이 생기면 해당 파일 Deny도 추가해야 합니다. 로컬 테스트의 OS 샌드박스는 파일명 패턴으로 `.env*`를 별도 차단합니다.

권한 스키마: https://antigravity.google/docs/permissions
