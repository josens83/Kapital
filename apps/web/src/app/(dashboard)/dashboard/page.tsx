import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@kapital/ui';
import { formatCurrency, formatPercent } from '@kapital/utils';
import { TrendingUp, TrendingDown, Wallet, ArrowDownRight, ArrowUpRight, Target } from 'lucide-react';
import { NetWorthChart } from '@/components/charts/net-worth-chart';
import { ExpenseCategoryChart } from '@/components/charts/expense-category-chart';
import { RecentTransactions } from '@/components/recent-transactions';
import { getDashboardData, getDemoData } from '@/lib/dashboard-data';

export default async function DashboardPage() {
  let dashboardData;

  try {
    dashboardData = await getDashboardData();
  } catch (error) {
    // Supabase 연결 실패 시 데모 데이터 사용
    console.error('Failed to fetch dashboard data:', error);
    dashboardData = getDemoData();
  }

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
