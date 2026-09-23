# Agent Bridge — Frontend

이 폴더는 Codex와 Gemini를 순차 실행해 구현과 독립 검토를 자동화하기 위한 작업 공간입니다.

## 공통 프로젝트 기준

장기 목적과 운영 원칙은 [프로젝트 방향성 및 요구사항](../docs/platform-analysis/PROJECT_DIRECTION.md)에서 관리합니다. 프론트·어드민 공통 작업을 계획할 때 해당 문서의 요구사항 ID, 확정/미결정 상태, 검증 기준을 확인하고 `COMMAND.md`와 `REPORT.md`에 관련 ID를 기록합니다. 문서에 적힌 두 프로젝트 수정 지원은 후속 구현 요구사항이며, 현재 실행기의 단일 루트 권한이 자동으로 확대된 것은 아닙니다.

## 작업 파일

작업 계획은 [플랫폼 분석 기준 문서](../docs/platform-analysis/README.md)의 현재 초점에서 시작합니다. 최신 사용자 요청에 관련 요구사항·모듈·여정/계약 ID, 대상 저장소·완료 검증을 연결합니다. 결함 수정 작업에만 해당 결함 ID를 추가합니다. 문서 분석 요청을 임의로 구현 작업으로 전환하지 않습니다.

기존 `COMMAND.md`·`REPORT.md`·`REVIEW.md`는 해당 실행의 기록입니다. 파일 존재만으로 현재 지시나 검증 완료로 보지 않고 요청·실행 ID·대상 커밋을 대조합니다. 현재 사업 범위와 확정 결정은 공통 목표 문서를 따르며 과거 전략으로 다시 결정하지 않습니다.

- `REQUEST.md`: 사용자가 달성하려는 목표와 제약 조건.
- `COMMAND.md`: Gemini에게 전달할 현재 작업 지시. 작업 범위, 완료 기준, 검증 명령을 적습니다.
- `REPORT.md`: Gemini가 실제로 수행한 결과 보고. 변경 파일, 검증 결과, 남은 문제를 사실대로 적습니다.
- `TEST_RESULTS.json`: 오케스트레이터가 직접 실행한 검증 결과. 에이전트의 자기 보고보다 우선합니다.
- `REVIEW.md`: Codex가 실제 diff와 검증 결과를 확인한 독립 검토 결과.
- `pipeline.config.json`: 프로젝트 범위, 모델·추론 강도, 검증 명령과 제한 시간.
- `SAFETY.md`: 프로젝트 권한, MCP 설정과 SQL·Git push 수동 실행 안내.
- `PIPELINE.md`: 설치, 실행, 안전 규칙 및 실패 복구 방법.

## 사용 순서

1. `REQUEST.md`에 목표를 작성하거나 실행 명령의 `--request` 옵션으로 전달합니다.
2. `agent-bridge run`을 실행합니다.
3. Codex가 `COMMAND.md`를 작성하고 Gemini가 구현과 `REPORT.md` 작성을 수행합니다.
4. 오케스트레이터가 테스트를 별도로 실행해 `TEST_RESULTS.json`을 만듭니다.
5. 테스트 실패 시 Gemini가 수정합니다. 모두 통과한 경우 Codex가 실제 diff를 검토하고 `REVIEW.md`에 판정을 기록합니다. 수정 요청이면 설정된 횟수만큼 Gemini 수정 단계가 반복됩니다.

상세 사용법은 `PIPELINE.md`를 참고합니다. 비밀키, 고객 이메일, 주문 정보 등 민감한 값은 브리지 문서와 로그에 기록하지 않습니다.

다른 프로젝트에서는 프로젝트 루트에서 `agent-bridge init`을 먼저 실행합니다.

## 먼저 확인하기

```bash
agent-bridge doctor
agent-bridge run --dry-run
agent-bridge check
```

`doctor`는 설치 여부만 확인합니다. `check`는 모델 호출 없이 등록된 테스트를 실행합니다. 초기 생성 파일은 검토 후 커밋하고 실행하세요. 기존 변경을 유지한 채 검사하려면 `check --allow-dirty`를 사용합니다.

자동 수정 범위는 이 Git 프로젝트 루트입니다. SQL 파일 작성은 가능하며 **Supabase SQL 실행·마이그레이션 적용·Git push는 사용자가 직접** 합니다. Antigravity 프로젝트 폴더와 MCP 권한은 `SAFETY.md`에 따라 별도로 설정해야 합니다.

최종 성공은 테스트 전체 통과와 같은 실행의 새 `APPROVED` 판정이 모두 있어야 합니다. 실행 기록은 `.agent-bridge-runtime/runs/`에 남습니다.

현재 storefront의 검증 빌드는 네트워크 없이 webpack과 테스트용 환경값을 사용하며 `.next-offline`에 저장됩니다. 일반 배포 빌드와 분리되어 있습니다. MCP 서버가 구성되어 있으면 자동 구현은 중단됩니다. 실제 모델 통합 테스트 결과와 제한은 `AUDIT.md`를 참고하세요.
