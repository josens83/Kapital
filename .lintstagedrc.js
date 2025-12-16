// 챕터 6: 배포 전 검증 자동화
// Turborepo 모노레포용 lint-staged 설정

module.exports = {
  // TypeScript 파일: 전체 프로젝트 타입 체크 (파일 인자 무시)
  '*.{ts,tsx}': [() => 'npm run typecheck', 'prettier --write'],

  // JavaScript 파일
  '*.{js,jsx,mjs,cjs}': ['prettier --write'],

  // JSON, Markdown, CSS 등
  '*.{json,md,css,scss}': ['prettier --write'],

  // YAML 파일 (GitHub Actions 등)
  '*.{yml,yaml}': ['prettier --write'],
};
