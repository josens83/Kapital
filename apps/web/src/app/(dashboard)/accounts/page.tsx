'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Progress } from '@kapital/ui';
import { formatCurrency } from '@kapital/utils';
import { Plus, ChevronRight, Wallet, CreditCard, TrendingUp, Building } from 'lucide-react';

// 데모 데이터
const accountsData = {
  assets: {
    total: 53500000,
    categories: [
      {
        name: '현금 및 현금성 자산',
        total: 12650000,
        accounts: [
          { id: '1', name: '현금', balance: 150000, icon: '💵' },
          { id: '2', name: '국민은행', balance: 8500000, icon: '🏦' },
          { id: '3', name: '신한은행', balance: 4000000, icon: '🏦' },
        ],
      },
      {
        name: '투자 자산',
        total: 35850000,
        accounts: [
          { id: '4', name: '삼성전자', balance: 15000000, icon: '📈' },
          { id: '5', name: '비트코인', balance: 8000000, icon: '₿' },
          { id: '6', name: 'S&P 500 ETF', balance: 12850000, icon: '📊' },
        ],
      },
      {
        name: '기타 자산',
        total: 5000000,
        accounts: [
          { id: '7', name: '전세 보증금', balance: 5000000, icon: '🏠' },
        ],
      },
    ],
  },
  liabilities: {
    total: 8200000,
    categories: [
      {
        name: '신용카드',
        total: 1700000,
        accounts: [
          { id: '8', name: '신한카드', balance: 1200000, icon: '💳' },
          { id: '9', name: '삼성카드', balance: 500000, icon: '💳' },
        ],
      },
      {
        name: '대출',
        total: 6500000,
        accounts: [
          { id: '10', name: '학자금 대출', balance: 6500000, icon: '🎓' },
        ],
      },
    ],
  },
};

const netWorth = accountsData.assets.total - accountsData.liabilities.total;

export default function AccountsPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">계정 관리</h1>
          <p className="text-gray-500">자산과 부채를 관리하세요</p>
        </div>
        <Link href="/accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            계정 추가
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">총 자산</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500 font-currency">
              {formatCurrency(accountsData.assets.total)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">총 부채</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 font-currency">
              {formatCurrency(accountsData.liabilities.total)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">순자산</CardTitle>
            <Wallet className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-currency">
              {formatCurrency(netWorth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-emerald-500">●</span>
            자산
            <span className="text-sm font-normal text-gray-500 ml-2">
              {formatCurrency(accountsData.assets.total)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountsData.assets.categories.map((category) => (
            <div key={category.name} className="border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.name ? null : category.name
                  )
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500">{category.accounts.length}개 계정</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold font-currency text-emerald-600">
                    {formatCurrency(category.total)}
                  </span>
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedCategory === category.name ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedCategory === category.name && (
                <div className="border-t bg-gray-50">
                  {category.accounts.map((account) => (
                    <Link
                      key={account.id}
                      href={`/accounts/${account.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-100 transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{account.icon}</span>
                        <span className="text-gray-900">{account.name}</span>
                      </div>
                      <span className="font-medium font-currency">
                        {formatCurrency(account.balance)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Liabilities Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-red-500">●</span>
            부채
            <span className="text-sm font-normal text-gray-500 ml-2">
              {formatCurrency(accountsData.liabilities.total)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountsData.liabilities.categories.map((category) => (
            <div key={category.name} className="border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.name ? null : category.name
                  )
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500">{category.accounts.length}개 계정</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold font-currency text-red-600">
                    {formatCurrency(category.total)}
                  </span>
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedCategory === category.name ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedCategory === category.name && (
                <div className="border-t bg-gray-50">
                  {category.accounts.map((account) => (
                    <Link
                      key={account.id}
                      href={`/accounts/${account.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-100 transition-colors border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{account.icon}</span>
                        <span className="text-gray-900">{account.name}</span>
                      </div>
                      <span className="font-medium font-currency text-red-600">
                        {formatCurrency(account.balance)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
