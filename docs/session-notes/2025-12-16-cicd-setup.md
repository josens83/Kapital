# 세션: CI/CD 파이프라인 및 검증 자동화 구축 (2025-12-16)

## 완료된 작업

- [x] GitHub Actions CI 워크플로우 구축 (병렬 실행, 캐싱)
- [x] 프로덕션 배포 워크플로우 (Vercel/Railway)
- [x] PR 미리보기 배포 워크플로우
- [x] Pre-commit hook (lint-staged + typecheck)
- [x] Pre-push hook (typecheck + lint + build)
- [x] Commitlint 설정 (커밋 메시지 규칙)
- [x] Prettier 설정
- [x] CLAUDE.md 프로젝트 컨텍스트 파일
- [x] TypeScript strict 설정 (noUncheckedIndexedAccess)

## 주요 결정사항

- **lint-staged에서 ESLint 제외**: Turborepo 모노레포에서 개별 파일 린트가 어려워 prettier만 실행
- **모바일 앱 typecheck/lint 스킵**: NativeWind 타입 설정과 ESLint 설정이 별도로 필요
- **Pre-push에서 빌드 검증**: 푸시 전 빌드 성공 확인으로 CI 실패 최소화
- **Conventional Commits 적용**: commitlint로 일관된 커밋 메시지 강제

## 변경된 파일

- `.github/workflows/ci.yml` - 병렬 실행 CI 파이프라인
- `.github/workflows/deploy.yml` - 프로덕션 배포
- `.github/workflows/preview.yml` - PR 미리보기 배포
- `.husky/pre-commit` - lint-staged 실행
- `.husky/pre-push` - 전체 검증
- `.husky/commit-msg` - commitlint 검증
- `.lintstagedrc.js` - lint-staged 설정
- `commitlint.config.js` - 커밋 메시지 규칙
- `.prettierrc` / `.prettierignore` - Prettier 설정
- `packages/tsconfig/base.json` - noUncheckedIndexedAccess 추가
- `CLAUDE.md` - 프로젝트 컨텍스트

## 미해결 이슈

- [ ] 모바일 앱 TypeScript 타입 체크 (NativeWind 타입 설정 필요)
- [ ] 모바일 앱 ESLint 설정 (eslint-config-expo 의존성 문제)
- [ ] Supabase 타입 생성 자동화 (@kapital/db)

## 다음 할 일

- [ ] 모바일 앱 개발 환경 정비
- [ ] Supabase 타입 생성 스크립트 완성
- [ ] E2E 테스트 설정 (Playwright/Cypress)

## 메모

- GitHub Secrets 설정 필요: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Discord/Slack 알림 원하면: `DISCORD_WEBHOOK`, `SLACK_WEBHOOK`
- 긴급 커밋 시 `--no-verify` 플래그 사용 가능
