# ADR 0002: Turborepo 모노레포 구조 선택

## 상태

Accepted

## 날짜

2024-11-15

## 맥락

Kapital은 웹(Next.js)과 모바일(Expo) 두 플랫폼을 지원해야 합니다.
두 앱 간에 공유되는 코드가 상당합니다:

- 타입 정의
- 유틸리티 함수
- Supabase 클라이언트 및 서비스 레이어
- UI 컴포넌트 (일부)

코드 공유와 일관된 개발 경험을 위한 프로젝트 구조가 필요합니다.

## 고려한 옵션들

### 옵션 1: Turborepo 모노레포

- 장점:
  - 강력한 캐싱으로 빌드 속도 향상
  - Vercel 생태계와 긴밀한 통합
  - 설정이 비교적 간단
  - 병렬 태스크 실행
- 단점:
  - npm workspaces 의존
  - pnpm 대비 캐싱 설정 복잡

### 옵션 2: Nx

- 장점:
  - 강력한 의존성 그래프
  - 영향받는 프로젝트만 빌드
  - 플러그인 생태계 풍부
- 단점:
  - 학습 곡선 가파름
  - 1인 프로젝트에 과도한 복잡성
  - 설정 파일이 많음

### 옵션 3: 멀티 레포 (별도 저장소)

- 장점:
  - 독립적인 배포/버저닝
  - 단순한 구조
- 단점:
  - 코드 공유 어려움 (npm 패키지로 배포 필요)
  - 동기화 오버헤드
  - 일관된 개발 경험 어려움

### 옵션 4: Lerna + npm workspaces

- 장점:
  - 오래된 도구로 레퍼런스 풍부
  - 버저닝/배포 기능 내장
- 단점:
  - Turborepo 대비 캐싱 기능 부족
  - 유지보수 불확실성 (Nx로 인수됨)

## 결정

**Turborepo + npm workspaces** 선택

핵심 이유:

1. **적절한 복잡성**: 1인 프로젝트에 맞는 수준의 도구
2. **빌드 캐싱**: CI/CD에서 불필요한 재빌드 방지
3. **Vercel 통합**: 웹 배포 플랫폼과 자연스러운 연동
4. **점진적 도입**: 필요에 따라 설정 확장 가능

## 결과

### 긍정적

- 웹/모바일 간 코드 공유 용이 (`@kapital/db`, `@kapital/utils`)
- `npm run typecheck`로 전체 프로젝트 한 번에 검증
- 캐싱으로 CI 빌드 시간 50% 단축
- 일관된 린트/포맷 설정

### 부정적

- 초기 설정에 시간 소요
- tsconfig 상속 구조 복잡
- 모바일 앱 특유의 설정 (NativeWind 등)과 충돌

### 리스크

- Turborepo 메이저 업데이트 시 마이그레이션 필요
- 패키지 간 순환 의존성 주의 필요

## 프로젝트 구조

```
kapital/
├── apps/
│   ├── web/              # Next.js 웹 앱
│   └── mobile/           # Expo 모바일 앱
├── packages/
│   ├── db/               # Supabase 클라이언트, 서비스
│   ├── ui/               # 공유 UI 컴포넌트
│   ├── utils/            # 유틸리티 함수
│   └── tsconfig/         # 공유 TypeScript 설정
├── turbo.json            # Turborepo 설정
└── package.json          # 루트 워크스페이스 설정
```

## 참고 자료

- [Turborepo 공식 문서](https://turbo.build/repo/docs)
- [Turborepo vs Nx 비교](https://turbo.build/repo/docs/getting-started/turborepo-vs-nx)
- [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
