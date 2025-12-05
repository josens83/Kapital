'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Account {
  id: string;
  name: string;
  name_en: string | null;
  account_type: string;
  account_subtype: string | null;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

const TYPE_LABELS: Record<string, string> = {
  ASSET: '자산',
  LIABILITY: '부채',
  EQUITY: '자본',
  INCOME: '수입',
  EXPENSE: '지출',
};

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadAccount();
  }, [params.id]);

  const loadAccount = async () => {
    try {
      const supabase = createClient();

      // Load account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (accountError) throw accountError;
      setAccount(accountData);
      setEditName(accountData.name);

      // Load transactions for this account
      const { data: linesData } = await supabase
        .from('transaction_lines')
        .select(`
          id,
          amount,
          journal_entries (
            id,
            entry_date,
            description
          )
        `)
        .eq('account_id', params.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (linesData) {
        const txns: Transaction[] = linesData.map((line: any) => ({
          id: line.journal_entries?.id || line.id,
          date: line.journal_entries?.entry_date || '',
          description: line.journal_entries?.description || '',
          amount: Math.abs(line.amount),
          type: (line.amount > 0 ? 'debit' : 'credit') as 'debit' | 'credit',
        }));
        setTransactions(txns);

        // Calculate balance
        const total = linesData.reduce((sum: number, line: any) => sum + line.amount, 0);
        setBalance(total);
      }
    } catch (error) {
      console.error('Error loading account:', error);
      // Demo data
      setAccount({
        id: params.id as string,
        name: '국민은행',
        name_en: 'KB Bank',
        account_type: 'ASSET',
        account_subtype: 'checking',
        currency: 'KRW',
        icon: '🏦',
        color: '#FFB800',
        is_active: true,
      });
      setBalance(12500000);
      setTransactions([
        { id: '1', date: '2025-12-03', description: '스타벅스', amount: 6500, type: 'credit' },
        { id: '2', date: '2025-12-02', description: '급여 입금', amount: 4500000, type: 'debit' },
        { id: '3', date: '2025-12-01', description: '월세', amount: 800000, type: 'credit' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!account || !editName.trim()) return;

    try {
      const supabase = createClient();
      await supabase
        .from('accounts')
        .update({ name: editName.trim() })
        .eq('id', account.id);

      setAccount({ ...account, name: editName.trim() });
      setEditing(false);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    if (!confirm(`"${account.name}" 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      const supabase = createClient();
      await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', account.id);

      router.push('/accounts');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">계정을 찾을 수 없습니다</p>
        <Link href="/accounts" className="text-blue-600 hover:underline mt-2 inline-block">
          계정 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/accounts" className="mr-4 text-gray-500 hover:text-gray-700">
            ← 뒤로
          </Link>
          {editing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
          )}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: account.color || '#E5E7EB' }}
          >
            {account.icon || '💳'}
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">{TYPE_LABELS[account.account_type]}</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(balance)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-gray-500 text-sm">통화</p>
            <p className="font-medium text-gray-900">{account.currency}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">하위 유형</p>
            <p className="font-medium text-gray-900">{account.account_subtype || '-'}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">최근 거래</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            거래 내역이 없습니다
          </div>
        ) : (
          <div className="divide-y">
            {transactions.map((txn) => (
              <Link
                key={txn.id}
                href={`/transactions/${txn.id}`}
                className="flex items-center p-4 hover:bg-gray-50"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  txn.type === 'debit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span>{txn.type === 'debit' ? '↓' : '↑'}</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900">{txn.description}</p>
                  <p className="text-sm text-gray-500">{txn.date}</p>
                </div>
                <p className={`font-semibold ${
                  txn.type === 'debit' ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {txn.type === 'debit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
