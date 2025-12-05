'use client';

import { useState } from 'react';

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('transactions');
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        type: exportType,
        format,
      });

      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const response = await fetch(`/api/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kapital-${exportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('내보내기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">데이터 내보내기</h1>
        <p className="text-gray-500 mt-1">거래 내역을 파일로 다운로드합니다</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        {/* Export Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내보낼 데이터
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'transactions', label: '거래 내역', icon: '📋' },
              { value: 'accounts', label: '계정 목록', icon: '💳' },
              { value: 'budgets', label: '예산', icon: '📊' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setExportType(item.value)}
                className={`p-4 rounded-xl border-2 text-center transition-colors ${
                  exportType === item.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className={`text-sm font-medium ${
                  exportType === item.value ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range (for transactions) */}
        {exportType === 'transactions' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기간 (선택)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              기간을 선택하지 않으면 전체 데이터가 내보내집니다
            </p>
          </div>
        )}

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            파일 형식
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                format === 'csv'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">📄</div>
              <div className={`text-sm font-medium ${
                format === 'csv' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                CSV
              </div>
              <div className="text-xs text-gray-500">Excel 호환</div>
            </button>
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                format === 'json'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">📦</div>
              <div className={`text-sm font-medium ${
                format === 'json' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                JSON
              </div>
              <div className="text-xs text-gray-500">개발자용</div>
            </button>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              내보내는 중...
            </span>
          ) : (
            '📥 다운로드'
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 bg-yellow-50 rounded-xl p-4">
        <h4 className="font-medium text-yellow-900">📌 안내</h4>
        <ul className="text-yellow-700 text-sm mt-2 space-y-1">
          <li>• CSV 파일은 Excel, Google Sheets에서 열 수 있습니다</li>
          <li>• 내보낸 파일에는 개인 금융 정보가 포함됩니다</li>
          <li>• 파일을 안전한 곳에 보관해주세요</li>
        </ul>
      </div>
    </div>
  );
}
