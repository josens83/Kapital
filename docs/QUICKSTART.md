# Kapital 빠른 시작 가이드

> 새로운 개발자 또는 AI 도구가 프로젝트에 빠르게 적응할 수 있도록 돕는 가이드입니다.

## 30초 요약

```
Kapital = 복식부기 개인 재무관리 앱
├── Frontend: Next.js 14 + TypeScript + Tailwind
├── Mobile: Expo + React Native
├── Backend: Supabase (PostgreSQL + Auth + Realtime)
├── Monorepo: Turborepo + npm workspaces
└── Deploy: Vercel (web) + EAS (mobile)
```

## 즉시 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp apps/web/.env.example apps/web/.env.local
# .env.local 파일 편집하여 Supabase 키 입력

# 3. 개발 서버 실행
npm run dev:web
```

## 핵심 명령어

| 명령어               | 설명                          |
| -------------------- | ----------------------------- |
| `npm run dev:web`    | 웹 개발 서버 (localhost:3000) |
| `npm run dev:mobile` | 모바일 개발 서버              |
| `npm run build:web`  | 프로덕션 빌드                 |
| `npm run typecheck`  | TypeScript 타입 검사          |
| `npm run lint`       | ESLint 검사                   |
| `npm run verify`     | 전체 검증 (배포 전 필수)      |
| `npm run format`     | Prettier 포맷팅               |

## 프로젝트 구조 핵심

```
kapital/
├── apps/
│   ├── web/                    # Next.js 웹 앱
│   │   └── src/
│   │       ├── app/            # 페이지 (App Router)
│   │       ├── components/     # React 컴포넌트
│   │       └── lib/            # 유틸리티
│   └── mobile/                 # Expo 모바일 앱
│
├── packages/
│   ├── db/                     # Supabase 클라이언트 & 타입
│   ├── ui/                     # 공유 UI 컴포넌트
│   └── utils/                  # 공유 유틸리티
│
└── docs/                       # 문서
    ├── VISION.md               # 프로젝트 비전
    ├── adr/                    # 아키텍처 결정 기록
    └── deployment/             # 배포 가이드
```

## 핵심 파일 위치

| 목적                 | 파일 경로                              |
| -------------------- | -------------------------------------- |
| 프로젝트 컨텍스트    | `CLAUDE.md`                            |
| 프로젝트 비전        | `docs/VISION.md`                       |
| 아키텍처 다이어그램  | `docs/architecture/c4-container.md`    |
| Vercel 배포 설정     | `apps/web/vercel.json`                 |
| TypeScript 기본 설정 | `packages/tsconfig/base.json`          |
| CI/CD 파이프라인     | `.github/workflows/ci.yml`             |
| Pre-commit 설정      | `.husky/pre-commit`                    |
| Health Check API     | `apps/web/src/app/api/health/route.ts` |

## 개발 워크플로우

### 새 기능 개발

```
1. docs/reviews/feature-checklist.md로 비전 정렬 확인
2. 기능 브랜치 생성: git checkout -b feature/기능명
3. 코드 작성
4. npm run verify 실행
5. 커밋 (Conventional Commits 형식)
6. PR 생성
```

### 커밋 메시지 형식

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
chore: 빌드, 설정 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
```

### 배포 전 체크리스트

```
□ npm run verify 통과
□ 환경 변수 설정 확인
□ Health Check (/api/health) 정상 응답
□ 모바일 영향도 확인 (공유 패키지 변경 시)
```

## 복식부기 핵심 개념

### 계정 유형

| 유형 | 증가 시 | 감소 시 | 예시                 |
| ---- | ------- | ------- | -------------------- |
| 자산 | 차변    | 대변    | 현금, 은행계좌, 주식 |
| 부채 | 대변    | 차변    | 신용카드, 대출       |
| 자본 | 대변    | 차변    | 초기자본             |
| 수익 | 대변    | 차변    | 급여, 이자수익       |
| 비용 | 차변    | 대변    | 식비, 교통비, 월세   |

### 복식부기 원칙

```
모든 거래에서: 차변 합계 = 대변 합계

예시: 급여 300만원 입금
├── 차변: 은행계좌 (자산 증가) 3,000,000원
└── 대변: 급여 (수익 증가) 3,000,000원
```

### 데이터 모델

```
journal_entries (분개)
├── id, date, description
└── transaction_lines (거래 라인)
    ├── account_id (계정)
    ├── debit_amount (차변 금액)
    └── credit_amount (대변 금액)
```

## 문제 해결

### 빌드 실패

```bash
# 타입 오류 확인
npm run typecheck

# 린트 오류 확인
npm run lint

# 캐시 정리 후 재빌드
rm -rf apps/web/.next
npm run build:web
```

### Supabase 연결 오류

```bash
# 환경 변수 확인
cat apps/web/.env.local | grep SUPABASE

# Health Check로 DB 연결 확인
curl http://localhost:3000/api/health
```

### 모바일 빌드 오류

```bash
# Expo 캐시 정리
cd apps/mobile
npx expo start --clear
```

## 주요 문서 링크

- [프로젝트 비전](./VISION.md)
- [아키텍처 문서](./architecture/c4-container.md)
- [Vercel 배포 가이드](./deployment/vercel-guide.md)
- [Railway 배포 가이드](./deployment/railway-guide.md)
- [주간 점검 템플릿](./reviews/weekly-template.md)
- [기능 체크리스트](./reviews/feature-checklist.md)

## AI 도구 사용 시 참고

1. **컨텍스트 제공**: `CLAUDE.md` 파일 내용 먼저 공유
2. **1 태스크 = 1 세션**: 복잡한 작업은 세션 분리
3. **파일 경로 명시**: "src/app/api/transactions/route.ts에서..."
4. **기존 패턴 참조**: "accountService.ts 스타일로..."

---

_이 문서는 프로젝트에 빠르게 적응하기 위한 핵심 정보만 담고 있습니다._
_상세 정보는 각 섹션의 링크된 문서를 참조하세요._
