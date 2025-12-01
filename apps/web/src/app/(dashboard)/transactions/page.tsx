'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kapital/ui';
import { formatCurrency, formatSmartDate } from '@kapital/utils';
import { Plus, Search, Filter, Download, ArrowUpDown } from 'lucide-react';

// 데모 데이터
const transactions = [
  { id: '1', date: '2025-01-15', description: '스타벅스', amount: -6500, account_name: '신한카드', category_name: '식비', icon: '☕', type: 'expense' },
  { id: '2', date: '2025-01-15', description: '점심 식사', amount: -9000, account_name: '현금', category_name: '식비', icon: '🍚', type: 'expense' },
  { id: '3', date: '2025-01-14', description: '급여 입금', amount: 4500000, account_name: '국민은행', category_name: '급여', icon: '💰', type: 'income' },
  { id: '4', date: '2025-01-13', description: '넷플릭스', amount: -17000, account_name: '신한카드', category_name: '구독서비스', icon: '📺', type: 'expense' },
  { id: '5', date: '2025-01-12', description: '마트 장보기', amount: -87000, account_name: '신한카드', category_name: '식료품', icon: '🛒', type: 'expense' },
  { id: '6', date: '2025-01-11', description: '교통카드 충전', amount: -50000, account_name: '신한카드', category_name: '교통비', icon: '🚇', type: 'expense' },
  { id: '7', date: '2025-01-10', description: '부업 수입', amount: 400000, account_name: '국민은행', category_name: '부업/프리랜서', icon: '💻', type: 'income' },
  { id: '8', date: '2025-01-09', description: '병원비', amount: -35000, account_name: '신한카드', category_name: '의료비', icon: '🏥', type: 'expense' },
  { id: '9', date: '2025-01-08', description: '영화 관람', amount: -28000, account_name: '현금', category_name: '여가/문화', icon: '🎬', type: 'expense' },
  { id: '10', date: '2025-01-07', description: '도서 구매', amount: -25000, account_name: '신한카드', category_name: '교육비', icon: '📚', type: 'expense' },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // 날짜별 그룹화
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

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
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="거래 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="income">수입</SelectItem>
                <SelectItem value="expense">지출</SelectItem>
                <SelectItem value="transfer">이체</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              내보내기
            </Button>
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
