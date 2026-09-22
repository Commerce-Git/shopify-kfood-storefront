# 📱 Blank Seoul 모바일 앱 설계 문서 디렉토리

본 디렉토리는 Blank Seoul의 모바일 애플리케이션(iOS / Android) 구축 전략, 시스템 아키텍처 및 구현 로드맵을 관리하는 문서 보관소입니다.

---

## 📑 문서 목록

1. [01. 모바일 앱 전략 및 시스템 아키텍처 설계서 (v1.1.0)](./01-mobile-app-strategy-and-architecture.md)
   - **배경 및 벤치마크**: 아이디어스 글로벌(idus Global) 모델 분석 및 Blank Seoul 차별점
   - **비즈니스 & 퍼널 전략**: 러셀 브런슨 기반 Web-First(획득) / Phygital 언박싱(전환) / App-Retention(재구매 LTV) 구조
   - **시스템 아키텍처**: Next.js(Remote URL Wrapper) + Capacitor Native Bridge + Supabase DB + 어드민 3-티어 연동 구조
   - **결제 최적화**: In-App Browser(SFSafari)를 통한 웹뷰 내 Apple Pay / Google Pay 완벽 호환
   - **핵심 네이티브 기능**: 푸시 알림, Live Activities(실시간 항공 배송 추적), 햅틱 피드백, Sign in with Apple
   - **앱스토어 심사 방어**: 가이드라인 4.2(최소 기능), 실물 상품 결제(수수료 30% 면제), Privacy Manifests 완벽 대응
   - **실행 로드맵**: Phase 1(현재 웹 최적화) ~ Phase 5(언박싱 QR 및 리텐션 가동)

---

## 🧭 핵심 가이드라인 요약
* **단일 백엔드 유지**: 모바일 앱 전용 백엔드를 신설하지 않고 기존 Supabase / Shopify 인프라를 단일 소스(Single Source of Truth)로 공유합니다.
* **어드민 영향도 0%**: 어드민 프로젝트는 모바일 앱 추가와 무관하게 동일한 데이터베이스 및 프로세스를 유지합니다.
* **피지컬-디지털(Phygital) 언박싱 퍼널**: 해외 배송된 실물 박스 내부의 QR 카드를 통해 자연스럽게 앱 설치와 재구매를 유도합니다.
* **애플 심사 사전 차단**: 단순 웹뷰 래핑 리젝을 방지하기 위해 햅틱, 푸시, Live Activities 등 네이티브 전용 기능을 결합합니다.
