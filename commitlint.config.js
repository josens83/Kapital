// 챕터 6: 배포 전 검증 자동화
// Commitlint 설정 - 커밋 메시지 규칙

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 커밋 타입 제한
    'type-enum': [
      2, // error level
      'always',
      [
        'feat', // 새 기능
        'fix', // 버그 수정
        'docs', // 문서 수정
        'style', // 코드 포맷팅 (기능 변경 없음)
        'refactor', // 리팩토링
        'test', // 테스트 추가/수정
        'chore', // 빌드, 설정 등
        'perf', // 성능 개선
        'ci', // CI 설정
        'revert', // 되돌리기
        'build', // 빌드 시스템 변경
      ],
    ],
    // 제목 최대 길이
    'subject-max-length': [2, 'always', 100],
    // 제목 빈 값 금지
    'subject-empty': [2, 'never'],
    // 타입 빈 값 금지
    'type-empty': [2, 'never'],
    // 본문 줄 최대 길이
    'body-max-line-length': [1, 'always', 200],
  },
};
