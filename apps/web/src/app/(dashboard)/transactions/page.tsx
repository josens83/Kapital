'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kapital/ui';
import { formatCurrency, formatSmartDate } from '@kapital/utils';
import { Plus, Search, Filter, Download, ArrowUpDown, Calendar, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  account_name: string;
  category_name: string;
  icon: string;
  type: 'income' | 'expense' | 'transfer';
}

interface Account {
  id: string;
  name: string;
  account_type: string;
}

// 데모 데이터 (폴백용)
const demoTransactions: Transaction[] = [
  { id: '1', date: '2025-01-15', description: '스타벅스', amount: -6500, account_name: '신한카드', category_name: '식비', icon: '☕', type: 'expense' },
  { id: '2', date: '2025-01-15', description: '점심 식사', amount: -9000, account_name: '현금', category_name: '식비', icon: '🍚', type: 'expense' },
  { id: '3', date: '2025-01-14', description: '급여 입금', amount: 4500000, account_name: '국민은행', category_name: '급여', icon: '💰', type: 'income' },
  { id: '4', date: '2025-01-13', description: '넷플릭스', amount: -17000, account_name: '신한카드', category_name: '구독서비스', icon: '📺', type: 'expense' },
  { id: '5', date: '2025-01-12', description: '마트 장보기', amount: -87000, account_name: '신한카드', category_name: '식료품', icon: '🛒', type: 'expense' },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setTransactions(demoTransactions);
        return;
      }

      // 계정 목록 조회
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('id, name, account_type')
        .eq('user_id', user.id)
        .eq('is_active', true);

      setAccounts(accountsData || []);

      // 거래내역 조회
      let query = supabase
        .from('journal_entries')
        .select(`
          id,
          entry_date,
          description,
          memo,
          transaction_lines(
            id,
            amount,
            account:accounts(id, name, icon, account_type)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_voided', false)
        .order('entry_date', { ascending: false })
        .limit(100);

      if (startDate) {
        query = query.gte('entry_date', startDate);
      }
      if (endDate) {
        query = query.lte('entry_date', endDate);
      }

      const { data: entries, error } = await query;

      if (error) throw error;

      // 거래내역 변환
      const txns: Transaction[] = (entries || []).map((entry: any) => {
        const lines = entry.transaction_lines || [];
        const primaryLine = lines[0];
        const account = primaryLine?.account;
        const amount = parseFloat(primaryLine?.amount || '0');

        let type: 'income' | 'expense' | 'transfer' = 'expense';
        if (account?.account_type === 'INCOME') {
          type = 'income';
        } else if (account?.account_type === 'ASSET' && amount > 0) {
          type = 'income';
        }

        return {
          id: entry.id,
          date: entry.entry_date,
          description: entry.description || '',
          amount: amount,
          account_name: account?.name || '',
          category_name: account?.name || '',
          icon: account?.icon || '📝',
          type,
        };
      });

      setTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions(demoTransactions);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.account_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesAccount = accountFilter === 'all' || t.account_name === accounts.find(a => a.id === accountFilter)?.name;
    return matchesSearch && matchesType && matchesAccount;
  });

  const handleExport = () => {
    const csvRows = ['날짜,설명,금액,계정,카테고리,유형'];
    filteredTransactions.forEach(t => {
      csvRows.push(`${t.date},"${t.description}",${t.amount},"${t.account_name}","${t.category_name}",${t.type}`);
    });
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 날짜별 그룹화
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">거래내역</h1>
          <p className="text-gray-500">모든 수입과 지출을 확인하세요</p>
        </div>
        <Link href="/transactions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            거래 추가
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* First Row: Search and Type */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="거래 검색..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="거래 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  <SelectItem value="income">수입</SelectItem>
                  <SelectItem value="expense">지출</SelectItem>
                  <SelectItem value="transfer">이체</SelectItem>
                </SelectContent>
              </Select>
              {accounts.length > 0 && (
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="계정 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 계정</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Second Row: Date Range and Export */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="시작일"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-[150px]"
                />
                <span className="text-gray-400">~</span>
                <Input
                  type="date"
                  placeholder="종료일"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-[150px]"
                />
              </div>
              <div className="flex gap-2 ml-auto">
                {(startDate || endDate || typeFilter !== 'all' || accountFilter !== 'all' || searchQuery) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setAccountFilter('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    필터 초기화
                  </Button>
                )}
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  내보내기
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-500">
            총 {filteredTransactions.length}건의 거래
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500">
                    {formatSmartDate(date)}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {dayTransactions.length}건
                  </span>
                </div>
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => (
                    <Link
                      key={transaction.id}
                      href={`/transactions/${transaction.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                          {transaction.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.account_name} • {transaction.category_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold font-currency text-lg ${
                            transaction.type === 'income' ? 'text-emerald-500' : 'text-gray-900'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : ''}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
