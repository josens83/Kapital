'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from '@kapital/ui';
import { getTodayISO } from '@kapital/utils';
import { ArrowLeft, Plus, Minus, ArrowLeftRight, Loader2 } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  icon: string;
  account_type: string;
}

interface AccountsGrouped {
  asset: Account[];
  liability: Account[];
  income: Account[];
  expense: Account[];
}

// 기본 데모 계정 (API 로딩 전 또는 실패 시)
const defaultAccounts: AccountsGrouped = {
  asset: [
    { id: 'demo-1', name: '현금', icon: '💵', account_type: 'ASSET' },
    { id: 'demo-2', name: '국민은행', icon: '🏦', account_type: 'ASSET' },
  ],
  liability: [
    { id: 'demo-3', name: '신한카드', icon: '💳', account_type: 'LIABILITY' },
  ],
  income: [
    { id: 'demo-4', name: '급여', icon: '💼', account_type: 'INCOME' },
    { id: 'demo-5', name: '부업/프리랜서', icon: '💻', account_type: 'INCOME' },
  ],
  expense: [
    { id: 'demo-6', name: '식비', icon: '🍽️', account_type: 'EXPENSE' },
    { id: 'demo-7', name: '교통비', icon: '🚗', account_type: 'EXPENSE' },
    { id: 'demo-8', name: '주거비', icon: '🏠', account_type: 'EXPENSE' },
    { id: 'demo-9', name: '쇼핑', icon: '🛍️', account_type: 'EXPENSE' },
  ],
};

type TransactionType = 'expense' | 'income' | 'transfer';

export default function NewTransactionPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountsGrouped>(defaultAccounts);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 계정 목록 로드
  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/accounts');
        if (res.ok) {
          const data = await res.json();
          if (data.asset?.length || data.expense?.length) {
            setAccounts(data);
          }
        }
      } catch (err) {
        console.error('Failed to load accounts:', err);
      } finally {
        setAccountsLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          description,
          date,
          fromAccount,
          toAccount,
          memo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      router.push('/transactions');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const paymentAccounts = [...accounts.asset, ...accounts.liability];
  const categoryAccounts = type === 'expense' ? accounts.expense : accounts.income;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 거래 추가</h1>
          <p className="text-gray-500">수입, 지출, 이체를 기록하세요</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Transaction Type Tabs */}
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="expense" className="flex items-center gap-2">
                  <Minus className="h-4 w-4" />
                  지출
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  수입
                </TabsTrigger>
                <TabsTrigger value="transfer" className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  이체
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">금액</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₩
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  className="pl-8 text-2xl font-bold font-currency"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">내용</Label>
              <Input
                id="description"
                placeholder="거래 내용을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">날짜</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* From Account (Payment Method) */}
            <div className="space-y-2">
              <Label>
                {type === 'expense' ? '결제 수단' : type === 'income' ? '입금 계좌' : '출금 계좌'}
              </Label>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="계좌를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <span className="flex items-center gap-2">
                          <span>{account.icon}</span>
                          <span>{account.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* To Account (Category or Transfer Target) */}
            <div className="space-y-2">
              <Label>
                {type === 'transfer' ? '입금 계좌' : '카테고리'}
              </Label>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder={type === 'transfer' ? '입금 계좌를 선택하세요' : '카테고리를 선택하세요'} />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'transfer' ? (
                      paymentAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <span className="flex items-center gap-2">
                            <span>{account.icon}</span>
                            <span>{account.name}</span>
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      categoryAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <span className="flex items-center gap-2">
                            <span>{account.icon}</span>
                            <span>{account.name}</span>
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">메모 (선택)</Label>
              <Input
                id="memo"
                placeholder="추가 메모를 입력하세요"
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
              <Button type="submit" className="flex-1" loading={loading}>
                저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
