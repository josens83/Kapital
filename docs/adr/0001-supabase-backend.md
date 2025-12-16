# ADR 0001: Supabase를 Backend-as-a-Service로 선택

## 상태

Accepted

## 날짜

2024-11-01

## 맥락

Kapital은 1인 개발 프로젝트로, 백엔드 인프라 구축과 유지보수에 드는 시간을 최소화해야 합니다.
필요한 백엔드 기능:

- PostgreSQL 데이터베이스 (복식부기 데이터의 관계형 저장)
- 사용자 인증 (OAuth, 이메일/비밀번호)
- Row Level Security (사용자별 데이터 격리)
- 실시간 동기화 (멀티 디바이스 지원)
- 파일 저장 (영수증 이미지 등)

## 고려한 옵션들

### 옵션 1: Supabase

- 장점:
  - PostgreSQL 기반으로 복잡한 관계형 쿼리 가능
  - 내장 Auth, Storage, Realtime 기능
  - Row Level Security로 서버리스 환경에서도 보안 유지
  - 관대한 무료 티어
  - TypeScript 지원 우수
- 단점:
  - Vendor lock-in 위험
  - 복잡한 비즈니스 로직은 Edge Functions 필요

### 옵션 2: Firebase

- 장점:
  - Google 생태계 통합
  - 모바일 SDK 성숙도 높음
  - 대규모 확장성 검증됨
- 단점:
  - NoSQL (Firestore)로 복식부기 데이터 모델링 어려움
  - 복잡한 쿼리 제한
  - 비용 예측 어려움

### 옵션 3: 자체 백엔드 (Node.js + PostgreSQL)

- 장점:
  - 완전한 제어권
  - Vendor lock-in 없음
  - 커스터마이징 자유도
- 단점:
  - 인프라 구축/유지보수 부담
  - 인증, 실시간 기능 직접 구현 필요
  - 1인 개발에 과도한 오버헤드

### 옵션 4: PlanetScale + Clerk

- 장점:
  - MySQL 기반으로 익숙함
  - Clerk의 우수한 인증 UX
- 단점:
  - 두 서비스 통합 복잡성
  - 실시간 기능 별도 구현 필요
  - 비용 분산

## 결정

**Supabase** 선택

핵심 이유:

1. **PostgreSQL**: 복식부기의 차변/대변 균형 검증, 복잡한 재무제표 쿼리에 적합
2. **통합 솔루션**: Auth, DB, Storage, Realtime이 하나의 대시보드에서 관리
3. **Row Level Security**: 서버리스 환경에서도 사용자 데이터 격리 가능
4. **개발 속도**: 백엔드 구축 시간 대폭 단축
5. **마이그레이션 용이**: 표준 PostgreSQL이므로 필요시 자체 서버로 이전 가능

## 결과

### 긍정적

- 2주 만에 인증 + DB + API 구조 완성
- RLS 정책으로 모든 API에서 자동 데이터 격리
- Supabase CLI로 로컬 개발 환경 구축 용이
- 타입 생성 (`supabase gen types`)으로 타입 안전성 확보

### 부정적

- Supabase 특유의 학습 곡선 존재
- Edge Functions 디버깅이 로컬보다 어려움
- 일부 고급 PostgreSQL 기능 제한

### 리스크

- Supabase 서비스 중단 시 마이그레이션 필요 (PostgreSQL이므로 위험도 낮음)
- 트래픽 증가 시 비용 예측 필요

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase vs Firebase 비교](https://supabase.com/alternatives/supabase-vs-firebase)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
