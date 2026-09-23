# Codex → Gemini → Codex 자동화 파이프라인

## 역할

1. **Codex 계획자**는 `REQUEST.md`, 저장소 규칙과 코드를 읽고 `COMMAND.md`에 구현 범위, 완료 기준, 필수 테스트를 작성합니다. 애플리케이션 코드는 수정하지 않습니다.
2. **Gemini 구현자**는 `COMMAND.md`에 따라 구현하고 필요한 테스트를 작성한 뒤 `REPORT.md`를 갱신합니다.
3. **로컬 검증기**는 AI와 독립적으로 `pipeline.config.json`의 명령을 실행하고 `TEST_RESULTS.json`을 작성합니다.
4. **Codex 검토자**는 `COMMAND.md`, `REPORT.md`, `TEST_RESULTS.json`, 실제 `git diff`를 확인하고 `REVIEW.md`에 `APPROVED` 또는 `CHANGES_REQUIRED` 판정을 기록합니다.
테스트가 실패하면 유료 Codex 검토를 생략하고 실패 증거를 Gemini에게 전달합니다.

5. 수정이 필요하면 Gemini가 `REVIEW.md`에 따라 수정합니다. 검증과 검토는 최대 반복 횟수까지 다시 실행됩니다.

## 준비

- Codex CLI가 설치되고 로그인되어 있어야 합니다.
- Antigravity CLI가 설치되고 구독 계정으로 로그인되어 있어야 합니다.
- 두 CLI가 각각 `codex`, `agy` 명령으로 실행되어야 합니다.
- 실행 전 작업 트리를 커밋하거나 별도 브랜치에 보관합니다. 기본 설정은 변경 사항이 있는 작업 트리에서 시작하지 않습니다.

전역 명령은 `~/.local/bin/agent-bridge`에 설치되어 있습니다. 새로운 Git 프로젝트에서는 루트에서 한 번 초기화합니다.

```bash
agent-bridge init
agent-bridge doctor
```

`init`은 프로젝트에 `.agent-bridge` 폴더와 프로젝트별 사용법을 담은 `README.md`와 `SAFETY.md`를 만들고, `package.json`에서 사용 가능한 검증 스크립트를 찾아 기본 설정에 추가합니다. 다시 `init`해도 기존 파일은 덮어쓰지 않고, 누락된 기본 문서와 설정만 생성합니다. 일부 파일만 생성된 상태에서도 재실행할 수 있습니다. 실행할 때마다 `.gitignore`의 런타임 로그 제외 규칙을 확인하고 없으면 추가합니다. `init`은 에이전트를 실행하거나 런타임 폴더를 만들지 않습니다. 명시적으로 `AGENT_BRIDGE_DIR`를 지정한 경우에만 기본 경로를 변경합니다. 처음 생성된 설정·문서를 검토하고 커밋한 뒤 실행합니다. Blank Seoul 프로젝트도 루트의 `.agent-bridge`를 사용합니다. `.agent-bridge-runtime`은 실행 로그와 임시 파일을 저장하는 별도 폴더입니다.

Antigravity CLI가 다른 경로에 있으면 `AGY_BIN`을, Codex CLI가 다른 경로에 있으면 `CODEX_BIN`을 지정할 수 있습니다.

```bash
AGY_BIN=/absolute/path/to/agy npm run agent:bridge -- --request-file .agent-bridge/REQUEST.md
```

## 실행

요청 파일을 사용하는 방법:

```bash
agent-bridge run --request-file .agent-bridge/REQUEST.md
```

요청을 바로 전달하는 방법:

```bash
agent-bridge run --request "로그인 사용자의 주문 조회 권한 검증을 보완해줘"
```

동작 확인만 하고 에이전트를 호출하지 않는 방법:

```bash
agent-bridge run --dry-run --allow-dirty
```

이 프로젝트에서는 기존 npm 별칭인 `npm run agent:bridge -- --request "..."`도 계속 사용할 수 있습니다.

`agent-bridge check`는 모델 호출 없이 등록된 테스트를 실행합니다. 기존 작업 중 검사만 할 때는 `agent-bridge check --allow-dirty`를 사용할 수 있습니다. `doctor`는 버전 확인이며 인증·모델 접근·전체 자동화의 성공을 확인하지 않습니다.

`--allow-dirty`는 기존 변경과 Gemini 변경의 경계를 흐리므로 평상시에는 사용하지 않습니다. 오케스트레이터는 Antigravity를 터미널 샌드박스에서 호출하며 구현 단계의 셸 명령 실행을 금지합니다. 테스트 명령은 Antigravity와 분리된 오케스트레이터가 `pipeline.config.json`에 등록된 항목만 실행합니다.

## 단계별 모델 선택

`pipeline.config.json`의 `models`에서 계획, 구현·수정, 독립 검토 모델을 각각 지정합니다.

```json
{
  "models": {
    "codexPlan": "gpt-6-sol",
    "gemini": "gemini-3.8-flash",
    "codexReview": "gpt-6-sol"
  },
  "reasoningEffort": {
    "codexPlan": "high",
    "gemini": "high",
    "codexReview": "high"
  }
}
```

현재 기본 설정은 Codex 계획·검토에 `gpt-6-sol`과 `high`, Gemini 구현·수정에 `gemini-3.8-flash`와 `high`를 사용합니다. 세 단계의 추론 수준은 파일에서 `low`, `medium`, `high`로 바꿀 수 있습니다. `null` 또는 필드 생략은 해당 CLI의 기본 설정을 따릅니다. Codex 익스텐션 대화에서 선택한 모델과 별도 CLI 실행의 기본 모델은 같다고 가정하지 않습니다.

한 번의 실행에만 다른 모델을 적용할 수 있습니다. 아래 대문자 값은 실제 사용할 모델 ID로 교체합니다.

```bash
agent-bridge run --request "수행할 작업" \
  --plan-model PLAN_MODEL_ID \
  --gemini-model GEMINI_MODEL_ID \
  --review-model REVIEW_MODEL_ID \
  --plan-effort high \
  --gemini-effort high \
  --review-effort high
```

우선순위는 실행 옵션 → 프로젝트 설정 → 각 CLI 기본 설정입니다. 모델은 각 CLI의 `--model`로 전달되며, Codex 추론 강도는 `model_reasoning_effort`로 전달됩니다. Gemini 구현 단계는 Antigravity CLI의 모델 ID 규칙에 맞게 `gemini-3.8-flash`와 `high`를 `gemini-3.8-flash-high`로 조합하고 `--effort high`도 함께 전달합니다. 수정 반복에도 같은 모델과 추론 수준을 사용합니다. 실행 로그의 `STATE.json`에는 요청한 모델과 추론 수준을 기록합니다. 이는 서비스에서 실제 사용한 모델에 대한 응답 증명은 아닙니다.

`agent-bridge run --dry-run --allow-dirty` 출력으로 적용할 설정을 확인할 수 있습니다. 모델 ID의 실제 이용 가능 여부는 해당 CLI 호출 시 확인됩니다. 단위 회귀 테스트는 CLI 응답을 모의하므로, 실제 두 모델을 연결한 전체 무인 운영 성공은 별도의 통합 테스트로 확인해야 합니다.

## 프로젝트 범위

`workspaceRoot`는 `"."`이며 현재 Git 프로젝트 루트와 일치해야 합니다. 이 프로젝트에서는 `blank-seoul-storefront`만 작업 범위에 포함합니다. 상위 Downloads나 어드민 프로젝트를 추가하지 않습니다.

`antigravityProject` 기본값은 `null`이며, 현재 프로젝트에서는 `agent-bridge-storefront`로 설정했습니다. Antigravity에 이 폴더만 포함한 프로젝트를 만든 경우 해당 이름/ID를 넣으면 `--project`로 전달합니다. 설정 파일에 경로를 적는 것만으로 Antigravity의 도구 권한까지 변경되지는 않습니다. 별도 권한 설정은 `SAFETY.md`를 따릅니다.

## 판정과 종료 코드

- 모든 등록 테스트 통과 + 이번 실행에서 새로 받은 `Verdict: APPROVED`가 있어야 성공(종료 코드 0)입니다.
- 테스트 실패 시 Codex 검토를 생략하고 Gemini 수정 단계로 이동합니다. 테스트 기준을 낮춰 통과시키지 않습니다.
- 검토 결과가 `CHANGES_REQUIRED`여도 Gemini 수정 단계로 이동합니다.
- 구현 결과 JSON이 `SUCCESS`이고 새 보고서에 `Status: COMPLETED`가 있어야 테스트 단계로 이동합니다. 권한 대기, 비어 있는 보고서, 이전 승인 문서는 성공으로 처리하지 않습니다.
- 최대 반복 횟수 이후에도 승인되지 않거나 오류·시간 초과가 발생하면 종료 코드 1입니다.
- 로그와 단계별 문서는 `.agent-bridge-runtime/runs/<run-id>/`에 저장됩니다. `STATE.json`에 실행 상태·실패 이유, `TEST_RESULTS.json`에 테스트 종료 코드와 실패 출력 일부를 기록합니다.
- 기본 반복 횟수는 2, 명령별 제한 시간은 300초입니다. 테스트별 `timeoutMs`로 재정의할 수 있습니다.

## 권한과 검증의 경계

- SQL 파일 작성·검토는 가능하지만 Supabase SQL 실행, 마이그레이션 적용, Git push, 배포는 수동입니다. 필요한 명령은 `REPORT.md`에 기록합니다.
- Codex 계획·검토는 `read-only`, 승인 정책 `never`로 실행하며 문서는 오케스트레이터가 저장합니다. 개인 CLI 설정은 무시합니다.
- Antigravity는 `--sandbox --mode=accept-edits`로 실행합니다. 셸·MCP·외부 작업 금지는 지시에도 포함하지만 지시만으로 도구를 차단하는 것은 아닙니다. 프로젝트 폴더와 MCP 권한을 별도로 제한해야 합니다. 전체 권한 우회 옵션은 사용하지 않습니다.
- 테스트는 macOS `sandbox-exec`에서 네트워크 없이 실행합니다. 프로젝트 밖 쓰기, `.git`과 브리지 제어 파일 수정, `.env` 읽기 및 쓰기를 차단하고 API 키 등 부모 환경 변수를 전달하지 않습니다. 시스템 실행 파일과 라이브러리는 읽을 수 있습니다.
- 이 테스트 격리는 현재 macOS 전용입니다. 다른 OS에서는 검증된 격리 구현을 추가하기 전까지 실행을 중단합니다.
- 외부 API, `.env`, 포트 바인딩이 필요한 테스트나 빌드는 실패할 수 있습니다. 오프라인 테스트용 fixture와 설정을 먼저 준비하고, 실서비스 검증은 별도로 수행합니다. 자동으로 권한을 확대하지 않습니다.
- 단계 전후 파일 내용·모드와 HEAD를 비교합니다. Codex/테스트의 예상 밖 코드 수정, Gemini의 설정·패키지·권한 파일 수정을 발견하면 중단합니다. Git에서 무시한 파일 전체를 감시하는 기능은 아니며 변경을 자동 되돌리지 않습니다.
- `--allow-dirty`는 기존 사용자 변경의 보존을 완전히 보장하지 않습니다. 자동 구현은 깨끗한 작업 트리에서 실행하는 것이 좋습니다.

## 중단과 재실행

동일 프로젝트의 중복 실행은 `.agent-bridge-runtime/LOCK.json`으로 차단합니다. 시간 초과나 Ctrl-C 시 자식 프로세스 그룹을 종료하고 실행 상태를 기록합니다.

강제 종료 후 잠금이 남았다면 `LOCK.json`의 PID가 실제로 종료됐는지 확인한 다음 잠금을 수동 제거합니다. 먼저 실패 로그와 실제 diff를 검토하고 요청 또는 설정을 수정한 뒤 다시 실행합니다. 전체 파이프라인을 재실행하면 새 실행 ID를 사용하며 이전 승인을 재사용하지 않습니다.

## Storefront의 오프라인 검증

이 프로젝트의 build 검사는 `scripts/build-offline.mjs`로 실행합니다. 반드시 `agent-bridge check`를 통해 호출합니다. 직접 실행은 거부하며, 실제 격리는 실행기의 macOS 프로파일이 담당합니다.

- Inter·Outfit 폰트는 `app/fonts`에 라이선스와 함께 포함되어 빌드 시 다운로드하지 않습니다.
- `.env.local`은 읽지 않으며, 테스트용 Supabase URL·키와 `offline.invalid` Shopify 도메인을 사용합니다.
- Turbopack의 PostCSS 처리는 로컬 포트를 필요로 하므로, 네트워크 전체 차단 검사에서는 webpack을 사용합니다. 일반 `npm run build`는 기존 Turbopack 빌드입니다.
- 결과는 `.next-offline`에 저장됩니다. 외부 데이터 요청 실패 후 빈 데이터로 렌더링하는 경로도 있으므로 컴파일·정적 페이지 생성 검사이며, 실서비스 데이터나 정상 결제 동작을 증명하지 않습니다. 이 결과를 배포하지 않습니다.
- `.next-offline`의 생성 타입 경로는 `tsconfig.json`에 명시하여 검사가 설정 파일을 변경하지 않게 합니다.

## MCP 사전 검사

CLI 1.2.9에는 실행별 MCP 비활성화 옵션이 없어, 자동 실행 전에 `agy mcp list`가 `No MCP servers configured.`를 반환하는지 확인합니다. 서버가 있거나 출력 형식이 달라지면 모델 호출 전에 중단합니다. Gemini 반복 단계 직전에도 재확인합니다. 전역 MCP 설정은 실행기가 수정하지 않습니다. 단순 disabled 상태만으로는 통과하지 않을 수 있습니다.
