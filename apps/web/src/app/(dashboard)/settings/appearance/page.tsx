'use client';

import { useTheme } from '@/lib/theme';

export default function AppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    { value: 'light', label: '라이트', icon: '☀️', description: '밝은 테마' },
    { value: 'dark', label: '다크', icon: '🌙', description: '어두운 테마' },
    { value: 'system', label: '시스템', icon: '💻', description: '기기 설정 따르기' },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">화면 설정</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">테마 및 디스플레이 설정을 변경합니다</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4">테마</h2>

        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                theme === t.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className={`font-medium ${
                theme === t.value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {t.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t.description}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">현재 적용된 테마</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {resolvedTheme === 'dark' ? '🌙 다크' : '☀️ 라이트'}
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4">미리보기</h2>

        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300">💰</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium text-gray-900 dark:text-white">샘플 거래</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">신한카드 • 식비</div>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">-₩25,000</div>
          </div>

          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-300">📈</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium text-gray-900 dark:text-white">월급</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">국민은행 • 급여</div>
            </div>
            <div className="font-semibold text-green-600 dark:text-green-400">+₩4,500,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}
