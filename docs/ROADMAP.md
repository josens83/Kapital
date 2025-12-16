# Kapital 개선 로드맵

> 프로젝트 워크플로우 성숙도와 다음 단계 개선 사항을 정리합니다.

## 현재 워크플로우 성숙도

### 배포 안정성 (10/10점)

- [x] tsconfig.json에 forceConsistentCasingInFileNames 설정됨
- [x] TypeScript strict mode 활성화
- [x] GitHub Actions CI 파이프라인 구축됨
- [x] Husky pre-commit/pre-push hook 설정됨
- [x] 배포 전 검증 자동화 (npm run verify)

### AI 도구 활용 (10/10점)

- [x] CLAUDE.md 컨텍스트 파일 존재
- [x] 세션 노트 시스템 구축 (docs/session-notes/)
- [x] 프로젝트 구조 문서화
- [x] 코딩 컨벤션 명시
- [x] AI 협업 가이드 포함

### 프로젝트 관리 (10/10점)

- [x] 비전 문서 (docs/VISION.md) 존재
- [x] "목표 NOT" 섹션 정의됨
- [x] ADR 시스템 구축 (3개 ADR 작성됨)
- [x] 아키텍처 문서 (C4 다이어그램)
- [x] 주간/월간 점검 템플릿

**총점: 30/30점 - 마스터 레벨**

---

## 완료된 인프라

### CI/CD

| 항목               | 상태    | 파일 위치                       |
| ------------------ | ------- | ------------------------------- |
| CI 파이프라인      | ✅ 완료 | `.github/workflows/ci.yml`      |
| 배포 워크플로우    | ✅ 완료 | `.github/workflows/deploy.yml`  |
| PR Preview         | ✅ 완료 | `.github/workflows/preview.yml` |
| Pre-commit 검증    | ✅ 완료 | `.husky/pre-commit`             |
| Pre-push 검증      | ✅ 완료 | `.husky/pre-push`               |
| Commit 메시지 검증 | ✅ 완료 | `.husky/commit-msg`             |

### 문서화

| 항목              | 상태    | 파일 위치                           |
| ----------------- | ------- | ----------------------------------- |
| 프로젝트 컨텍스트 | ✅ 완료 | `CLAUDE.md`                         |
| 비전 문서         | ✅ 완료 | `docs/VISION.md`                    |
| 빠른 시작 가이드  | ✅ 완료 | `docs/QUICKSTART.md`                |
| 아키텍처 문서     | ✅ 완료 | `docs/architecture/c4-container.md` |
| ADR 시스템        | ✅ 완료 | `docs/adr/`                         |
| 배포 가이드       | ✅ 완료 | `docs/deployment/`                  |
| 점검 템플릿       | ✅ 완료 | `docs/reviews/`                     |
| 체크리스트        | ✅ 완료 | `docs/reviews/checklists.md`        |

### 배포 설정

| 항목             | 상태    | 파일 위치                              |
| ---------------- | ------- | -------------------------------------- |
| Vercel 설정      | ✅ 완료 | `apps/web/vercel.json`                 |
| Railway 설정     | ✅ 완료 | `railway.json`                         |
| Health Check API | ✅ 완료 | `apps/web/src/app/api/health/route.ts` |

---

## 다음 단계 개선 사항

### 우선순위 높음

#### 1. 테스트 자동화

```
현재: 테스트 없음
목표: 핵심 비즈니스 로직 테스트 커버리지 80%

작업:
□ Jest/Vitest 설정
□ 복식부기 계산 로직 단위 테스트
□ API 엔드포인트 통합 테스트
□ CI에 테스트 단계 추가
```

#### 2. E2E 테스트

```
현재: E2E 테스트 없음
목표: 핵심 사용자 플로우 자동화 테스트

작업:
□ Playwright 설정
□ 로그인/회원가입 테스트
□ 거래 입력 테스트
□ 재무제표 조회 테스트
```

#### 3. 모바일 앱 타입/린트 설정

```
현재: 스킵 중 (NativeWind, ESLint 설정 필요)
목표: 웹과 동일한 수준의 타입 안전성

작업:
□ NativeWind TypeScript 설정
□ ESLint + eslint-config-expo 설정
□ 모바일 CI 검증 활성화
```

### 우선순위 중간

#### 4. 모니터링 & 알림

```
작업:
□ Sentry 에러 트래킹 설정
□ Vercel Analytics 활성화
□ 에러 알림 (Slack/Discord)
□ 성능 모니터링
```

#### 5. 번들 최적화

```
작업:
□ @next/bundle-analyzer 설정
□ 불필요한 의존성 제거
□ 코드 스플리팅 최적화
□ 이미지 최적화 검토
```

#### 6. 백업 & 복구 전략

```
작업:
□ Supabase 자동 백업 확인
□ 데이터 내보내기 기능 검토
□ 재해 복구 계획 문서화
```

### 우선순위 낮음

#### 7. 접근성 (a11y)

```
작업:
□ axe-core 린트 규칙 추가
□ 키보드 네비게이션 검토
□ 스크린 리더 호환성 테스트
```

#### 8. 국제화 (i18n)

```
작업:
□ next-intl 또는 react-i18next 설정
□ 영어 번역 파일 생성
□ 언어 전환 UI 추가
```

#### 9. PWA 지원

```
작업:
□ next-pwa 설정
□ 오프라인 기능 추가
□ 앱 설치 프롬프트
```

---

## 기술 부채 현황

| 부채                          | 심각도 | 예상 시간 | 계획    |
| ----------------------------- | ------ | --------- | ------- |
| 모바일 typecheck 스킵 중      | 중간   | 4h        | 다음 달 |
| 모바일 lint 스킵 중           | 중간   | 2h        | 다음 달 |
| @kapital/db typecheck 스킵 중 | 낮음   | 1h        | 나중에  |
| 테스트 코드 없음              | 높음   | 8h+       | 다음 달 |
| metadataBase 경고             | 낮음   | 30m       | 다음 주 |

---

## 추천 도구 목록

### 이미 사용 중

| 영역         | 도구                  |
| ------------ | --------------------- |
| Monorepo     | Turborepo             |
| CI/CD        | GitHub Actions        |
| 커밋 검증    | Husky + lint-staged   |
| 배포         | Vercel                |
| 데이터베이스 | Supabase (PostgreSQL) |
| 코드 포맷팅  | Prettier              |
| 커밋 메시지  | Commitlint            |

### 도입 권장

| 영역          | 도구                  | 우선순위 |
| ------------- | --------------------- | -------- |
| 단위 테스트   | Vitest                | 높음     |
| E2E 테스트    | Playwright            | 높음     |
| 에러 트래킹   | Sentry                | 중간     |
| 번들 분석     | @next/bundle-analyzer | 중간     |
| API 검증      | Zod                   | 중간     |
| 타입 안전 API | tRPC                  | 낮음     |

---

## 정기 점검 일정

| 주기   | 내용           | 소요 시간 | 템플릿                              |
| ------ | -------------- | --------- | ----------------------------------- |
| 매주   | 진행 상황 점검 | 15분      | `docs/reviews/weekly-template.md`   |
| 매월   | 비전/ADR 검토  | 1시간     | `docs/reviews/monthly-template.md`  |
| 기능별 | 비전 정렬 체크 | 10분      | `docs/reviews/feature-checklist.md` |

---

## 마일스톤

### v1.0.0 - MVP (2025 Q1)

- [x] 기본 복식부기 기능
- [x] 계정 관리 (CRUD)
- [x] 거래 입력/편집/삭제
- [x] 재무제표 (재무상태표, 손익계산서)
- [x] 대시보드
- [x] 예산 관리
- [x] 반복 거래
- [x] CI/CD 파이프라인
- [x] 문서화 시스템
- [ ] 테스트 커버리지 80%
- [ ] 프로덕션 배포

### v1.5.0 - 모바일 (2025 Q2)

- [ ] iOS 앱 완성
- [ ] Android 앱 완성
- [ ] 실시간 동기화
- [ ] 푸시 알림
- [ ] 모바일 typecheck/lint 활성화

### v2.0.0 - 연동 (2025 Q3)

- [ ] 오픈뱅킹 연동
- [ ] 자동 거래 분류
- [ ] 투자 자산 추적

---

_이 문서는 프로젝트의 현재 상태와 개선 방향을 정리합니다._
_월간 점검 시 이 문서를 업데이트하세요._
_최종 수정: 2025-12-16_
