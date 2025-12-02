import { createClient } from './supabase/server';

export interface DashboardData {
  net_worth: number;
  net_worth_change: number;
  net_worth_change_percent: number;
  month_income: number;
  month_expenses: number;
  month_budget: number;
  expense_by_category: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  recent_transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    account_name: string;
    category_name: string;
    icon: string;
    type: 'income' | 'expense' | 'transfer';
  }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  '식비': '#F97316',
  '주거비': '#8B5CF6',
  '교통비': '#3B82F6',
  '쇼핑': '#EC4899',
  '여가/문화': '#A855F7',
  '의료/건강': '#10B981',
  '교육': '#6366F1',
  '통신비': '#14B8A6',
  '구독서비스': '#EAB308',
  '기타': '#6B7280',
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  // 계정 목록 조회
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);

  // 현재 월 거래 내역 조회
  const { data: currentMonthLines } = await supabase
    .from('transaction_lines')
    .select(`
      *,
      account:accounts(*),
      journal_entry:journal_entries!inner(*)
    `)
    .eq('journal_entries.user_id', user.id)
    .eq('journal_entries.is_voided', false)
    .gte('journal_entries.entry_date', startOfMonth)
    .lte('journal_entries.entry_date', endOfMonth);

  // 모든 거래내역 (잔액 계산용)
  const { data: allLines } = await supabase
    .from('transaction_lines')
    .select(`
      *,
      account:accounts(*),
      journal_entry:journal_entries!inner(*)
    `)
    .eq('journal_entries.user_id', user.id)
    .eq('journal_entries.is_voided', false);

  // 잔액 계산
  const balances = new Map<string, number>();
  allLines?.forEach((line: any) => {
    const current = balances.get(line.account_id) || 0;
    balances.set(line.account_id, current + parseFloat(line.amount || '0'));
  });

  // 순자산 계산 (자산 - 부채)
  let totalAssets = 0;
  let totalLiabilities = 0;
  accounts?.forEach((account: any) => {
    const balance = balances.get(account.id) || 0;
    if (account.account_type === 'ASSET') {
      totalAssets += balance;
    } else if (account.account_type === 'LIABILITY') {
      totalLiabilities += Math.abs(balance);
    }
  });
  const netWorth = totalAssets - totalLiabilities;

  // 이번 달 수입/지출 계산
  let monthIncome = 0;
  let monthExpenses = 0;
  const expensesByCategory = new Map<string, number>();

  currentMonthLines?.forEach((line: any) => {
    const account = line.account;
    const amount = parseFloat(line.amount || '0');
    
    if (account?.account_type === 'INCOME') {
      monthIncome += Math.abs(amount);
    } else if (account?.account_type === 'EXPENSE') {
      monthExpenses += Math.abs(amount);
      const categoryName = account.name || '기타';
      expensesByCategory.set(
        categoryName,
        (expensesByCategory.get(categoryName) || 0) + Math.abs(amount)
      );
    }
  });

  // 카테고리별 지출 퍼센트 계산
  const expenseByCategoryArray = Array.from(expensesByCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: monthExpenses > 0 ? (amount / monthExpenses) * 100 : 0,
      color: CATEGORY_COLORS[category] || '#6B7280',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  // 예산 조회
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .lte('start_date', endOfMonth)
    .gte('end_date', startOfMonth);

  const totalBudget = budgets?.reduce((sum: number, b: any) => sum + parseFloat(b.amount || '0'), 0) || 0;

  // 최근 거래 조회
  const { data: recentEntries } = await supabase
    .from('journal_entries')
    .select(`
      *,
      transaction_lines(
        *,
        account:accounts(*)
      )
    `)
    .eq('user_id', user.id)
    .eq('is_voided', false)
    .order('entry_date', { ascending: false })
    .limit(10);

  const recentTransactions = recentEntries?.map((entry: any) => {
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
  }) || [];

  return {
    net_worth: netWorth,
    net_worth_change: 0, // TODO: Calculate from previous month
    net_worth_change_percent: 0,
    month_income: monthIncome,
    month_expenses: monthExpenses,
    month_budget: totalBudget || 4000000, // 기본 예산
    expense_by_category: expenseByCategoryArray,
    recent_transactions: recentTransactions.slice(0, 5),
  };
}

// 데모 데이터 (Supabase 연결 전 테스트용)
export function getDemoData(): DashboardData {
  return {
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
      { id: '1', date: '2025-01-15', description: '스타벅스', amount: -6500, account_name: '신한카드', category_name: '식비', icon: '☕', type: 'expense' },
      { id: '2', date: '2025-01-15', description: '점심 식사', amount: -9000, account_name: '현금', category_name: '식비', icon: '🍚', type: 'expense' },
      { id: '3', date: '2025-01-14', description: '급여 입금', amount: 4500000, account_name: '국민은행', category_name: '급여', icon: '💰', type: 'income' },
      { id: '4', date: '2025-01-13', description: '넷플릭스', amount: -17000, account_name: '신한카드', category_name: '구독서비스', icon: '📺', type: 'expense' },
      { id: '5', date: '2025-01-12', description: '마트 장보기', amount: -87000, account_name: '신한카드', category_name: '식료품', icon: '🛒', type: 'expense' },
    ],
  };
}
