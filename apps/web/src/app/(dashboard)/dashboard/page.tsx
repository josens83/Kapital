import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@kapital/ui';
import { formatCurrency, formatPercent, getChangeIcon } from '@kapital/utils';
import { TrendingUp, TrendingDown, Wallet, ArrowDownRight, ArrowUpRight, Target } from 'lucide-react';
import { NetWorthChart } from '@/components/charts/net-worth-chart';
import { ExpenseCategoryChart } from '@/components/charts/expense-category-chart';
import { RecentTransactions } from '@/components/recent-transactions';

export default async function DashboardPage() {
  // 데모 데이터 (실제로는 Supabase에서 가져옴)
  const dashboardData = {
    net_worth: 45230000,
    net_worth_change: 1020000,
    net_worth_change_percent: 2.3,
    month_income: 5400000,
    month_expenses: 3200000,
    month_budget: 4000000,
    expense_by_category: [
      { category: '식비', amount: 650000, percentage: 20.3, color: '#F97316' },
      { category: '주거비', amount: 1000000, percentage: 31.3, color: '#8B5CF6' },
      { category: '교통비', amount: 200000, percentage: 6.3, color: '#3B82F6' },
      { category: '쇼핑', amount: 350000, percentage: 10.9, color: '#EC4899' },
      { category: '여가/문화', amount: 400000, percentage: 12.5, color: '#A855F7' },
      { category: '기타', amount: 600000, percentage: 18.8, color: '#6B7280' },
    ],
    recent_transactions: [
      { id: '1', date: '2025-01-15', description: '스타벅스', amount: -6500, account_name: '신한카드', category_name: '식비', icon: '☕', type: 'expense' as const },
      { id: '2', date: '2025-01-15', description: '점심 식사', amount: -9000, account_name: '현금', category_name: '식비', icon: '🍚', type: 'expense' as const },
      { id: '3', date: '2025-01-14', description: '급여 입금', amount: 4500000, account_name: '국민은행', category_name: '급여', icon: '💰', type: 'income' as const },
      { id: '4', date: '2025-01-13', description: '넷플릭스', amount: -17000, account_name: '신한카드', category_name: '구독서비스', icon: '📺', type: 'expense' as const },
      { id: '5', date: '2025-01-12', description: '마트 장보기', amount: -87000, account_name: '신한카드', category_name: '식료품', icon: '🛒', type: 'expense' as const },
    ],
  };

  const budgetUsagePercent = (dashboardData.month_expenses / dashboardData.month_budget) * 100;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500">재정 현황을 한눈에 확인하세요</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Net Worth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">순자산</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-currency">
              {formatCurrency(dashboardData.net_worth)}
            </div>
            <p className={`text-xs ${dashboardData.net_worth_change >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center mt-1`}>
              {dashboardData.net_worth_change >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercent(dashboardData.net_worth_change_percent, { showSign: true })} 전월 대비
            </p>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">이번 달 수입</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-currency text-emerald-500">
              {formatCurrency(dashboardData.month_income)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              급여 + 부업 수입
            </p>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">이번 달 지출</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-currency text-red-500">
              {formatCurrency(dashboardData.month_expenses)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              예산의 {budgetUsagePercent.toFixed(0)}% 사용
            </p>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">예산 현황</CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-currency">
              {formatCurrency(dashboardData.month_budget - dashboardData.month_expenses)}
            </div>
            <Progress
              value={budgetUsagePercent}
              className="mt-2 h-2"
              indicatorClassName={budgetUsagePercent > 90 ? 'bg-red-500' : budgetUsagePercent > 70 ? 'bg-yellow-500' : 'bg-emerald-500'}
            />
            <p className="text-xs text-gray-500 mt-1">
              남은 예산
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Net Worth Trend */}
        <Card>
          <CardHeader>
            <CardTitle>순자산 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorthChart />
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseCategoryChart data={dashboardData.expense_by_category} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>최근 거래</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions transactions={dashboardData.recent_transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
