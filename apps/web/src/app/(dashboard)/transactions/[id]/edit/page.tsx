'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kapital/ui';
import { ArrowLeft } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  account_type: string;
  icon: string | null;
}

interface TransactionData {
  id: string;
  entry_date: string;
  description: string;
  memo: string | null;
  lines: {
    id: string;
    account_id: string;
    amount: number;
  }[];
}

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Load accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('id, name, account_type, icon')
        .eq('is_active', true)
        .order('name');

      setAccounts(accountsData || []);

      // Load transaction
      const { data: entry, error } = await supabase
        .from('journal_entries')
        .select(`
          id,
          entry_date,
          description,
          memo,
          transaction_lines (
            id,
            account_id,
            amount,
            accounts (
              id,
              name,
              account_type
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setDescription(entry.description || '');
      setMemo(entry.memo || '');
      setDate(entry.entry_date);

      // Determine transaction type and accounts
      const lines = entry.transaction_lines || [];
      let detectedType: 'expense' | 'income' | 'transfer' = 'transfer';

      const expenseLine = lines.find((l: any) => l.accounts?.account_type === 'EXPENSE');
      const incomeLine = lines.find((l: any) => l.accounts?.account_type === 'INCOME');
      const debitLine = lines.find((l: any) => l.amount > 0);
      const creditLine = lines.find((l: any) => l.amount < 0);

      if (expenseLine) {
        detectedType = 'expense';
        setToAccount(expenseLine.account_id);
        setFromAccount(creditLine?.account_id || '');
        setAmount(Math.abs(expenseLine.amount).toString());
      } else if (incomeLine) {
        detectedType = 'income';
        setFromAccount(incomeLine.account_id);
        setToAccount(debitLine?.account_id || '');
        setAmount(Math.abs(incomeLine.amount).toString());
      } else {
        detectedType = 'transfer';
        setFromAccount(creditLine?.account_id || '');
        setToAccount(debitLine?.account_id || '');
        setAmount(Math.abs(debitLine?.amount || 0).toString());
      }

      setType(detectedType);
    } catch (error) {
      console.error('Error loading transaction:', error);
      // Demo data
      setAccounts([
        { id: '1', name: '국민은행', account_type: 'ASSET', icon: '🏦' },
        { id: '2', name: '신한카드', account_type: 'LIABILITY', icon: '💳' },
        { id: '3', name: '식비', account_type: 'EXPENSE', icon: '🍽️' },
        { id: '4', name: '급여', account_type: 'INCOME', icon: '💰' },
      ]);
      setDescription('스타벅스 커피');
      setMemo('아메리카노 2잔');
      setDate('2025-01-15');
      setAmount('13000');
      setType('expense');
      setFromAccount('2');
      setToAccount('3');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !fromAccount || !toAccount || !date) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // Update journal entry
      const { error: entryError } = await supabase
        .from('journal_entries')
        .update({
          description,
          memo: memo || null,
          entry_date: date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (entryError) throw entryError;

      // Delete existing lines and create new ones
      await supabase
        .from('transaction_lines')
        .delete()
        .eq('journal_entry_id', params.id);

      const parsedAmount = parseFloat(amount);
      const lines = [
        { journal_entry_id: params.id, account_id: toAccount, amount: parsedAmount },
        { journal_entry_id: params.id, account_id: fromAccount, amount: -parsedAmount },
      ];

      const { error: linesError } = await supabase
        .from('transaction_lines')
        .insert(lines);

      if (linesError) throw linesError;

      router.push(`/transactions/${params.id}`);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const assetAccounts = accounts.filter(a => a.account_type === 'ASSET' || a.account_type === 'LIABILITY');
  const expenseAccounts = accounts.filter(a => a.account_type === 'EXPENSE');
  const incomeAccounts = accounts.filter(a => a.account_type === 'INCOME');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/transactions/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">거래 수정</h1>
          <p className="text-gray-500">거래 정보를 수정합니다</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>거래 유형</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  지출
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    type === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  수입
                </button>
                <button
                  type="button"
                  onClick={() => setType('transfer')}
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    type === 'transfer'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  이체
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">설명 *</Label>
              <Input
                id="description"
                placeholder="거래 설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">금액 *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">날짜 *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Accounts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {type === 'expense' ? '결제 수단 *' : type === 'income' ? '입금 계좌 *' : '출금 계좌 *'}
                </Label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === 'income' ? incomeAccounts : assetAccounts).map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {type === 'expense' ? '카테고리 *' : type === 'income' ? '수입원 *' : '입금 계좌 *'}
                </Label>
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === 'expense' ? expenseAccounts : type === 'income' ? assetAccounts : assetAccounts).map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">메모</Label>
              <Input
                id="memo"
                placeholder="추가 메모 (선택)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
