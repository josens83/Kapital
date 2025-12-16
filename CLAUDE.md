# Project: Kapital

## 개요

Kapital은 복식부기 회계 원칙을 기반으로 한 개인 재무관리 앱입니다.
웹(Next.js), iOS, Android(Expo)를 지원하는 크로스 플랫폼 앱으로,
일반인도 쉽게 사용할 수 있는 진정한 복식부기 회계 시스템을 제공합니다.

## 기술 스택

```
Frontend:
├── Web: Next.js 14 (App Router) + TypeScript
├── Mobile: Expo (React Native) + TypeScript
├── Styling: Tailwind CSS, NativeWind (mobile)
└── UI Components: Radix UI, shadcn/ui 패턴

Backend:
├── Database: Supabase (PostgreSQL)
├── Auth: Supabase Auth (OAuth, Email)
├── API: Next.js API Routes + Supabase Edge Functions
└── Real-time: Supabase Realtime

Payments:
├── Web: Stripe
└── Mobile: RevenueCat

Build & DevOps:
├── Monorepo: Turborepo
├── CI/CD: GitHub Actions
├── Deployment: Vercel (web)
└── Mobile Build: EAS (Expo Application Services)
```

## 프로젝트 구조

```
kapital/
├── apps/
│   ├── web/                    # Next.js 웹 앱
│   │   ├── src/
│   │   │   ├── app/            # App Router 페이지
│   │   │   │   ├── (dashboard)/ # 인증 필요 페이지
│   │   │   │   ├── api/        # API 라우트
│   │   │   │   └── auth/       # 인증 관련
│   │   │   ├── components/     # React 컴포넌트
│   │   │   │   ├── ui/         # 재사용 UI (Button, Card 등)
│   │   │   │   ├── charts/     # 차트 컴포넌트
│   │   │   │   └── forms/      # 폼 컴포넌트
│   │   │   └── lib/            # 유틸리티, 설정
│   │   └── public/             # 정적 파일
│   │
│   └── mobile/                 # Expo 모바일 앱
│       └── src/
│           ├── app/            # Expo Router 페이지
│           ├── components/     # React Native 컴포넌트
│           └── lib/            # 유틸리티
│
├── packages/
│   ├── db/                     # Supabase 클라이언트 & 타입
│   │   ├── src/
│   │   │   ├── client.ts       # Supabase 클라이언트
│   │   │   ├── types.ts        # 공유 타입 정의
│   │   │   └── services/       # DB 서비스 레이어
│   │   └── supabase/
│   │       └── migrations/     # SQL 마이그레이션
│   │
│   ├── ui/                     # 공유 UI 컴포넌트
│   ├── utils/                  # 공유 유틸리티 함수
│   └── tsconfig/               # 공유 TypeScript 설정
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│
└── .husky/                     # Git Hooks
```

## 명령어

```bash
# 개발
npm run dev:web          # 웹 개발 서버 (http://localhost:3000)
npm run dev:mobile       # 모바일 개발 서버

# 빌드 & 검증
npm run build:web        # 웹 프로덕션 빌드
npm run typecheck        # TypeScript 타입 체크
npm run lint             # ESLint 검사
npm run verify           # 전체 검증 (typecheck + lint + build)

# 포맷팅
npm run format           # Prettier 포맷 적용
npm run format:check     # 포맷 검사만

# 데이터베이스
npm run db:migrate       # Supabase 마이그레이션
npm run db:seed          # 시드 데이터 삽입
```

## 코딩 컨벤션

### TypeScript

- strict mode 사용 (`noUncheckedIndexedAccess` 포함)
- 배열 인덱스 접근 시 null 체크 필수: `arr[0]` → `arr[0] ?? defaultValue`
- 절대 경로 import 사용: `@/components/...`

### React

- 함수형 컴포넌트 + React Hooks만 사용
- 서버 컴포넌트 우선, 필요시 'use client' 명시
- Props 타입은 인라인 또는 `interface ComponentNameProps`

### 스타일링

- Tailwind CSS 클래스 사용
- 컴포넌트 variants는 `class-variance-authority` (cva) 사용
- 다크 모드: `dark:` 접두사

### 파일 명명

- 컴포넌트: PascalCase (`UserCard.tsx`)
- 유틸리티: camelCase (`formatCurrency.ts`)
- 상수: UPPER_SNAKE_CASE

### 커밋 메시지

Conventional Commits 형식 필수:

- `feat:` 새 기능
- `fix:` 버그 수정
- `chore:` 빌드, 설정
- `docs:` 문서
- `refactor:` 리팩토링

## 핵심 도메인 개념

### 복식부기 원칙

- 모든 거래는 차변(Debit)과 대변(Credit)으로 기록
- 차변 합계 = 대변 합계 (항상)
- 계정 유형: 자산, 부채, 자본, 수익, 비용

### 데이터 모델

- `accounts`: 계정 (자산, 부채 등)
- `journal_entries`: 분개 (거래 헤더)
- `transaction_lines`: 거래 라인 (차변/대변 상세)
- `budgets`: 예산
- `recurring_transactions`: 반복 거래

## 주의사항

### 보안

- API 키는 `.env.local`에만 저장 (절대 커밋 금지)
- Supabase RLS(Row Level Security) 정책 확인 필수
- 사용자 데이터 접근 시 항상 `user_id` 필터링

### 빌드

- 배포 전 `npm run verify` 실행 필수
- Supabase 타입 변경 시: `npm run generate-types --workspace=@kapital/db`

### 모바일 (현재 제한사항)

- typecheck 스킵 중 (NativeWind 타입 설정 필요)
- lint 스킵 중 (ESLint 설정 필요)

## 환경 변수

### Web (apps/web/.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Mobile (apps/mobile/.env)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
REVENUECAT_API_KEY=
```

## 현재 작업 중

- CI/CD 파이프라인 구축 완료
- Pre-commit/Pre-push 검증 자동화 완료
- 모바일 앱 typecheck/lint 설정 예정

## AI 협업 가이드

### 세션 관리

- 1 태스크 = 1 세션 원칙 권장
- 긴 대화 후 컨텍스트 혼란 시 새 세션 시작

### 효과적인 요청 방법

1. 파일 경로 명시: "src/app/api/transactions/route.ts에서..."
2. 구체적 작업 설명: "에러 핸들링 추가해줘" (X) → "Prisma 오류와 중복 체크 실패 케이스 처리해줘" (O)
3. 기존 패턴 참조: "userService.ts 스타일로..."

### 권장 워크플로우

1. **Explore**: 코드 구조 파악 요청 (코드 작성 X)
2. **Plan**: 구현 계획 검토 후 승인
3. **Code**: 단계별 구현
4. **Commit**: 변경사항 정리 및 커밋
