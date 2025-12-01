'use client';

import Link from 'next/link';
import { formatCurrency, formatSmartDate } from '@kapital/utils';
import { cn } from '@kapital/ui';

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

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // 날짜별로 그룹화
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
        <div key={date}>
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            {formatSmartDate(date)}
          </h4>
          <div className="space-y-2">
            {dayTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                href={`/transactions/${transaction.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
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
                    className={cn(
                      'font-bold font-currency',
                      transaction.type === 'income' ? 'text-emerald-500' : 'text-gray-900'
                    )}
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

      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          아직 거래 내역이 없습니다.
        </div>
      )}

      <div className="pt-4 border-t">
        <Link
          href="/transactions"
          className="text-sm text-primary hover:underline"
        >
          모든 거래 보기 →
        </Link>
      </div>
    </div>
  );
}
