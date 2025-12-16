'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@kapital/ui';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
}

interface RecurringTransaction {
  id: string;
  name: string;
  template_entry: {
    description: string;
    amount: number;
    from_account_id: string;
    to_account_id: string;
    type: 'expense' | 'income';
  };
  frequency: string;
  next_occurrence: string;
  is_active: boolean;
}

const FREQUENCIES = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'biweekly', label: '격주' },
  { value: 'monthly', label: '매월' },
  { value: 'quarterly', label: '분기별' },
  { value: 'yearly', label: '매년' },
];

export default function EditRecurringPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDate, setNextDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Load accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('id, name, type')
        .order('name');

      setAccounts(accountsData || []);

      // Load recurring transaction
      const { data: recurring, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setName(recurring.name);
      setDescription(recurring.template_entry?.description || '');
      setAmount(recurring.template_entry?.amount?.toString() || '');
      setType(recurring.template_entry?.type || 'expense');
      setFromAccount(recurring.template_entry?.from_account_id || '');
      setToAccount(recurring.template_entry?.to_account_id || '');
      setFrequency(recurring.frequency);
      setNextDate(recurring.next_occurrence);
      setIsActive(recurring.is_active);
    } catch (error) {
      console.error('Error loading data:', error);
      // Demo data
      setAccounts([
        { id: '1', name: '국민은행', type: 'asset' },
        { id: '2', name: '신한카드', type: 'liability' },
        { id: '3', name: '현금', type: 'asset' },
        { id: '4', name: '급여', type: 'income' },
        { id: '5', name: '식비', type: 'expense' },
        { id: '6', name: '주거비', type: 'expense' },
        { id: '7', name: '구독', type: 'expense' },
      ]);
      setName('넷플릭스');
      setDescription('월간 구독');
      setAmount('17000');
      setType('expense');
      setFromAccount('2');
      setToAccount('7');
      setFrequency('monthly');
      setNextDate(new Date().toISOString().split('T')[0]);
      setIsActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !amount || !fromAccount || !toAccount) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const templateEntry = {
        description: description || name,
        amount: parseFloat(amount),
        from_account_id: fromAccount,
        to_account_id: toAccount,
        type,
      };

      await supabase
        .from('recurring_transactions')
        .update({
          name,
          template_entry: templateEntry,
          frequency,
          next_occurrence: nextDate,
          is_active: isActive,
        })
        .eq('id', params.id);

      router.push('/recurring');
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      router.push('/recurring');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 반복 거래를 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', params.id);

      router.push('/recurring');
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      router.push('/recurring');
    }
  };

  const assetAccounts = accounts.filter(a => a.type === 'asset' || a.type === 'liability');
  const incomeAccounts = accounts.filter(a => a.type === 'income');
  const expenseAccounts = accounts.filter(a => a.type === 'expense');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/recurring">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">반복 거래 수정</h1>
            <p className="text-gray-500 mt-1">정기 거래 설정을 수정합니다</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          삭제
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">활성화</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isActive ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isActive ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                지출
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                수입
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 월급, 넷플릭스, 월세"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="거래 내역에 표시될 설명"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">금액 *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Accounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'expense' ? '출금 계좌 *' : '입금 계좌 *'}
              </label>
              <select
                value={type === 'expense' ? fromAccount : toAccount}
                onChange={(e) => type === 'expense' ? setFromAccount(e.target.value) : setToAccount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">선택</option>
                {assetAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === 'expense' ? '카테고리 *' : '수입원 *'}
              </label>
              <select
                value={type === 'expense' ? toAccount : fromAccount}
                onChange={(e) => type === 'expense' ? setToAccount(e.target.value) : setFromAccount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">선택</option>
                {(type === 'expense' ? expenseAccounts : incomeAccounts).map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">반복 주기 *</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Next Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">다음 실행일 *</label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
