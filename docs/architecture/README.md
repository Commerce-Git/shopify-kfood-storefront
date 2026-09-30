# Architecture and Infrastructure Documentation

Blank Seoul의 시스템 구조와 인프라 검토 자료를 관리한다. 현재 목표와 확정 정책은 [공통 플랫폼 목차](../platform-analysis/README.md)를 기준으로 한다.

## 주요 문서

- [운영 테스트 환경 분리 수정 보고서](../platform-analysis/VALIDATION.md#운영-테스트-환경-분리-수정-보고서): 두 프로젝트의 실제 변경 커밋, 단위 테스트 288개와 타입 검사, 배포·외부 연동 미확인 범위.
- [프론트 환경 분리 가이드](../environment-isolation.md): 로컬·Vercel 변수, 수신거부 링크와 캐시 호환성, 적용 후 확인 절차.
- [기존 플랫폼 종합 기술 검토 보고서](platform_audit_and_environment_verification_report.md): 과거 작성 자료. 완전 격리·무결함·원격 검증 완료 주장은 현재 검증 결과로 간주하지 않으며 보고서 상단의 안내를 함께 읽는다.
