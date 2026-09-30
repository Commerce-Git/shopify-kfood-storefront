# 🏛️ Architecture & Infrastructure Documentation

이 디렉토리는 Blank Seoul 커머스 플랫폼의 **시스템 구조, 포트 아키텍처, 듀얼 DB 격리, Shopify 연동 파이프라인 및 인프라 검증 보고서**를 관리하는 전용 공간입니다.

---

## 📑 주요 문서 목록

1. **[platform_audit_and_environment_verification_report.md](./platform_audit_and_environment_verification_report.md)**
   * **Shopify Dev/Prod Parity (2026 OAuth Client Credentials Grant)** 검증
   * **로컬 5대 포트(3000~3004) 아키텍처** 및 프로세스 간섭 방지 설계
   * **Supabase 듀얼 DB(운영/테스트) 완전 격리** 및 토큰 식별자 구조
   * **Next.js 16 프로덕션 빌드 & 단위 테스트(274/274)** 전수 검증 결과
   * **Vercel 프로덕션/프리뷰 환경변수 세팅 가이드**
