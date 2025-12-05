'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface RecurringTransaction {
  id: string;
  name: string;
  template_entry: {
    description: string;
    amount: number;
    from_account_id: string;
    to_account_id: string;
  };
  frequency: string;
  next_occurrence: string;
  is_active: boolean;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: '매일',
  weekly: '매주',
  biweekly: '격주',
  monthly: '매월',
  quarterly: '분기별',
  yearly: '매년',
};

export default function RecurringTransactionsPage() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('next_occurrence', { ascending: true });

      if (error) throw error;
      setRecurring(data || []);
    } catch (error) {
      console.error('Error loading recurring transactions:', error);
      // Demo data
      setRecurring([
        {
          id: '1',
          name: '월급',
          template_entry: { description: '월급', amount: 4500000, from_account_id: '', to_account_id: '' },
          frequency: 'monthly',
          next_occurrence: '2025-12-25',
          is_active: true,
        },
        {
          id: '2',
          name: '넷플릭스',
          template_entry: { description: '넷플릭스 구독', amount: 17000, from_account_id: '', to_account_id: '' },
          frequency: 'monthly',
          next_occurrence: '2025-12-15',
          is_active: true,
        },
        {
          id: '3',
          name: '월세',
          template_entry: { description: '월세', amount: 800000, from_account_id: '', to_account_id: '' },
          frequency: 'monthly',
          next_occurrence: '2025-12-01',
          is_active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      await supabase
        .from('recurring_transactions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      setRecurring(recurring.map(r =>
        r.id === id ? { ...r, is_active: !currentStatus } : r
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deleteRecurring = async (id: string) => {
    if (!confirm('이 반복 거래를 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      setRecurring(recurring.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">반복 거래</h1>
          <p className="text-gray-500 mt-1">자동으로 기록되는 정기 거래를 관리합니다</p>
        </div>
        <Link
          href="/recurring/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 반복 거래 추가
        </Link>
      </div>

      {/* List */}
      {recurring.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h3 className="text-lg font-medium text-gray-900">반복 거래가 없습니다</h3>
          <p className="text-gray-500 mt-2">월급, 구독료, 월세 등 정기적인 거래를 추가하세요</p>
          <Link
            href="/recurring/new"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            반복 거래 추가
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주기
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  다음 실행
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recurring.map((item) => (
                <tr key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.template_entry.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.template_entry.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {FREQUENCY_LABELS[item.frequency] || item.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatDate(item.next_occurrence)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.is_active ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/recurring/${item.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => deleteRecurring(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="font-medium text-blue-900">💡 반복 거래란?</h4>
        <p className="text-blue-700 text-sm mt-1">
          월급, 월세, 구독료처럼 정기적으로 발생하는 거래를 설정하면 자동으로 기록됩니다.
          다음 실행일에 거래가 자동 생성되며, 앱 알림으로 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
