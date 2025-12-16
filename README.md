# Kapital

![CI](https://github.com/josens83/Kapital/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/josens83/Kapital/actions/workflows/deploy.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

복식부기 기반 개인 재무관리 앱 - 웹/iOS/Android

## 소개

Kapital은 진정한 복식부기 회계를 일반인도 쉽게 사용할 수 있는 개인 재무관리 앱입니다.

### 핵심 기능

- **복식부기 회계**: 모든 거래가 차변과 대변으로 기록되어 정확한 재무 추적
- **자동 재무제표**: 재무상태표, 손익계산서, 현금흐름표 자동 생성
- **예산 관리**: 카테고리별 예산 설정 및 실시간 추적
- **다중 플랫폼**: 웹, iOS, Android 완벽 동기화

## 기술 스택

```
Frontend:
├── Mobile: Expo (React Native)
├── Web: Next.js 14 (App Router)
└── Shared: TypeScript, TailwindCSS

Backend:
├── Database: Supabase (PostgreSQL)
├── Auth: Supabase Auth
└── API: Supabase Edge Functions

Payments:
├── Global: Stripe
└── Mobile: RevenueCat
```

## 프로젝트 구조

```
kapital/
├── apps/
│   ├── web/          # Next.js 웹 앱
│   └── mobile/       # Expo 모바일 앱
├── packages/
│   ├── ui/           # 공유 UI 컴포넌트
│   ├── db/           # Supabase 클라이언트 및 타입
│   ├── utils/        # 공유 유틸리티 함수
│   └── tsconfig/     # TypeScript 설정
└── turbo.json        # Turborepo 설정
```

## 시작하기

### 필수 조건

- Node.js 18+
- npm 또는 pnpm

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (웹)
npm run dev:web

# 개발 서버 시작 (모바일)
npm run dev:mobile
```

### 환경 변수

각 앱 디렉토리에 `.env.local` 파일을 생성하세요:

**apps/web/.env.local**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**apps/mobile/.env**
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 마이그레이션 파일 실행:
   - `packages/db/supabase/migrations/001_initial_schema.sql`
   - `packages/db/supabase/migrations/002_seed_default_accounts.sql`

## 가격 정책

| 플랜 | 가격 | 기능 |
|------|------|------|
| 무료 | ₩0 | 3개 계좌, 월 50건 거래 |
| 프리미엄 | ₩8,500/월 | 무제한 계좌/거래, 모든 재무제표, 예산 관리 |
| 프리미엄+ | ₩12,500/월 | 은행 연동, 투자 추적, 가족 공유 |

## CI/CD

GitHub Actions를 통한 자동화 파이프라인:

| 워크플로우 | 트리거 | 설명 |
|-----------|--------|------|
| CI | push, PR | 타입체크, 린트, 빌드 검증 |
| Deploy | main 푸시 | 프로덕션 배포 |
| Preview | PR | 미리보기 환경 배포 |

### GitHub Secrets 설정

```
# 필수
NEXT_PUBLIC_SUPABASE_URL      - Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anon key

# Vercel 배포 (선택)
VERCEL_TOKEN      - Vercel 액세스 토큰
VERCEL_ORG_ID     - Vercel 조직 ID
VERCEL_PROJECT_ID - Vercel 프로젝트 ID

# 알림 (선택)
DISCORD_WEBHOOK   - Discord 웹훅 URL
SLACK_WEBHOOK     - Slack 웹훅 URL
```

## 라이선스

MIT License

## 기여

버그 리포트나 기능 제안은 [Issues](https://github.com/josens83/Kapital/issues)에 등록해주세요.
