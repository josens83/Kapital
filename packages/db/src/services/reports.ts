import { getSupabaseClient } from '../client';
import type { BalanceSheetData, IncomeStatementData, CashFlowData, DashboardData } from '../types';
import { getAccountsByType, getAllAccountBalances } from './accounts';
import { getRecentTransactions, getMonthlyExpenses, getMonthlyIncome } from './transactions';

// 재무상태표 (Balance Sheet) 생성
export async function getBalanceSheet(userId: string, asOfDate?: string): Promise<BalanceSheetData> {
  const date = asOfDate || new Date().toISOString().split('T')[0];
  const supabase = getSupabaseClient();

  // 모든 계정과 잔액 가져오기
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .in('account_type', ['ASSET', 'LIABILITY', 'EQUITY'])
    .order('display_order');

  if (error) throw error;

  const balances = await getAllAccountBalances(userId, date);

  // 자산 분류
  const assetAccounts = accounts?.filter(a => a.account_type === 'ASSET') || [];
  const assetCategories = groupAccountsByParent(assetAccounts, balances);
  const totalAssets = assetCategories.reduce((sum, cat) => sum + cat.balance, 0);

  // 부채 분류
  const liabilityAccounts = accounts?.filter(a => a.account_type === 'LIABILITY') || [];
  const liabilityCategories = groupAccountsByParent(liabilityAccounts, balances);
  const totalLiabilities = Math.abs(liabilityCategories.reduce((sum, cat) => sum + cat.balance, 0));

  // 순자산 계산
  const netWorth = totalAssets - totalLiabilities;

  return {
    date,
    assets: {
      total: totalAssets,
      categories: assetCategories,
    },
    liabilities: {
      total: totalLiabilities,
      categories: liabilityCategories.map(cat => ({
        ...cat,
        balance: Math.abs(cat.balance),
        accounts: cat.accounts.map(a => ({ ...a, balance: Math.abs(a.balance) })),
      })),
    },
    equity: {
      total: netWorth,
      net_worth: netWorth,
    },
  };
}

// 손익계산서 (Income Statement) 생성
export async function getIncomeStatement(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<IncomeStatementData> {
  const supabase = getSupabaseClient();

  // 수익/비용 계정 가져오기
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .in('account_type', ['INCOME', 'EXPENSE'])
    .order('display_order');

  if (accountsError) throw accountsError;

  // 기간 내 거래 라인 가져오기
  const { data: lines, error: linesError } = await supabase
    .from('transaction_lines')
    .select(`
      amount,
      account_id,
      journal_entries!inner(entry_date, is_voided, user_id)
    `)
    .eq('journal_entries.user_id', userId)
    .eq('journal_entries.is_voided', false)
    .gte('journal_entries.entry_date', fromDate)
    .lte('journal_entries.entry_date', toDate);

  if (linesError) throw linesError;

  // 계정별 금액 집계
  const accountTotals = new Map<string, number>();
  (lines || []).forEach((line: any) => {
    const current = accountTotals.get(line.account_id) || 0;
    accountTotals.set(line.account_id, current + parseFloat(line.amount));
  });

  // 수익 분류
  const incomeAccounts = accounts?.filter(a => a.account_type === 'INCOME') || [];
  const incomeCategories = groupAccountsWithTotals(incomeAccounts, accountTotals);
  const totalIncome = Math.abs(incomeCategories.reduce((sum, cat) => sum + cat.amount, 0));

  // 비용 분류
  const expenseAccounts = accounts?.filter(a => a.account_type === 'EXPENSE') || [];
  const expenseCategories = groupAccountsWithTotals(expenseAccounts, accountTotals);
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

  return {
    from_date: fromDate,
    to_date: toDate,
    income: {
      total: totalIncome,
      categories: incomeCategories.map(cat => ({
        ...cat,
        amount: Math.abs(cat.amount),
        accounts: cat.accounts.map(a => ({ ...a, amount: Math.abs(a.amount) })),
      })),
    },
    expenses: {
      total: totalExpenses,
      categories: expenseCategories,
    },
    net_income: totalIncome - totalExpenses,
  };
}

// 현금흐름표 (Cash Flow Statement) 생성
export async function getCashFlowStatement(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<CashFlowData> {
  const supabase = getSupabaseClient();

  // 현금성 자산 계정 ID 가져오기
  const { data: cashAccounts, error: cashError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('account_type', 'ASSET')
    .in('account_subtype', ['cash', 'bank', 'savings']);

  if (cashError) throw cashError;
  const cashAccountIds = (cashAccounts || []).map(a => a.id);

  // 기초 현금 잔액
  const prevDate = new Date(fromDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = prevDate.toISOString().split('T')[0];

  let beginningCash = 0;
  for (const id of cashAccountIds) {
    const { data } = await supabase.rpc('get_account_balance', {
      p_account_id: id,
      p_as_of_date: prevDateStr,
    });
    beginningCash += data || 0;
  }

  // 기말 현금 잔액
  let endingCash = 0;
  for (const id of cashAccountIds) {
    const { data } = await supabase.rpc('get_account_balance', {
      p_account_id: id,
      p_as_of_date: toDate,
    });
    endingCash += data || 0;
  }

  // 영업활동 현금흐름 (수입 - 비용)
  const { data: operatingLines, error: opError } = await supabase
    .from('transaction_lines')
    .select(`
      amount,
      accounts!inner(account_type),
      journal_entries!inner(entry_date, is_voided, user_id)
    `)
    .eq('journal_entries.user_id', userId)
    .eq('journal_entries.is_voided', false)
    .gte('journal_entries.entry_date', fromDate)
    .lte('journal_entries.entry_date', toDate)
    .in('accounts.account_type', ['INCOME', 'EXPENSE']);

  if (opError) throw opError;

  let operatingInflow = 0;
  let operatingOutflow = 0;
  (operatingLines || []).forEach((line: any) => {
    const amount = parseFloat(line.amount);
    if (line.accounts.account_type === 'INCOME') {
      operatingInflow += Math.abs(amount);
    } else {
      operatingOutflow += Math.abs(amount);
    }
  });

  // 투자/재무활동은 Phase 2에서 구현
  const investingInflow = 0;
  const investingOutflow = 0;
  const financingInflow = 0;
  const financingOutflow = 0;

  return {
    from_date: fromDate,
    to_date: toDate,
    operating: {
      inflow: operatingInflow,
      outflow: operatingOutflow,
      net: operatingInflow - operatingOutflow,
    },
    investing: {
      inflow: investingInflow,
      outflow: investingOutflow,
      net: investingInflow - investingOutflow,
    },
    financing: {
      inflow: financingInflow,
      outflow: financingOutflow,
      net: financingInflow - financingOutflow,
    },
    beginning_cash: beginningCash,
    ending_cash: endingCash,
    net_change: endingCash - beginningCash,
  };
}

// 대시보드 데이터 생성
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = getSupabaseClient();
  const today = new Date();
  const thisMonth = today.getMonth() + 1;
  const thisYear = today.getFullYear();
  const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
  const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

  // 현재 순자산
  const { data: netWorth } = await supabase.rpc('get_net_worth', {
    p_user_id: userId,
  });

  // 지난달 순자산
  const lastMonthEnd = new Date(thisYear, thisMonth - 1, 0).toISOString().split('T')[0];
  const { data: prevNetWorth } = await supabase.rpc('get_net_worth', {
    p_user_id: userId,
    p_as_of_date: lastMonthEnd,
  });

  const netWorthChange = (netWorth || 0) - (prevNetWorth || 0);
  const netWorthChangePercent = prevNetWorth ? (netWorthChange / prevNetWorth) * 100 : 0;

  // 이번 달 수입/지출
  const monthIncome = await getMonthlyIncome(userId, thisYear, thisMonth);
  const monthExpenses = await getMonthlyExpenses(userId, thisYear, thisMonth);

  // 이번 달 예산 총액
  const { data: budgets } = await supabase
    .from('budgets')
    .select('amount')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('period_type', 'monthly');

  const monthBudget = (budgets || []).reduce((sum, b) => sum + parseFloat(String(b.amount)), 0);

  // 카테고리별 지출
  const startDate = `${thisYear}-${String(thisMonth).padStart(2, '0')}-01`;
  const endDate = new Date(thisYear, thisMonth, 0).toISOString().split('T')[0];

  const { data: categoryExpenses } = await supabase
    .from('transaction_lines')
    .select(`
      amount,
      accounts!inner(name, icon, color, account_type)
    `)
    .eq('accounts.account_type', 'EXPENSE');

  const categoryTotals = new Map<string, { amount: number; icon: string; color: string }>();
  (categoryExpenses || []).forEach((line: any) => {
    const name = line.accounts.name;
    const current = categoryTotals.get(name) || { amount: 0, icon: line.accounts.icon, color: line.accounts.color };
    current.amount += Math.abs(parseFloat(line.amount));
    categoryTotals.set(name, current);
  });

  const totalExpenseAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0);

  const expenseByCategory = Array.from(categoryTotals.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenseAmount > 0 ? (data.amount / totalExpenseAmount) * 100 : 0,
      color: data.color || '#6B7280',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  // 최근 거래
  const recentTransactions = await getRecentTransactions(userId, 10);

  return {
    net_worth: netWorth || 0,
    net_worth_change: netWorthChange,
    net_worth_change_percent: netWorthChangePercent,
    month_income: monthIncome,
    month_expenses: monthExpenses,
    month_budget: monthBudget,
    expense_by_category: expenseByCategory,
    recent_transactions: recentTransactions,
  };
}

// 순자산 추이 데이터
export async function getNetWorthTrend(
  userId: string,
  months: number = 12
): Promise<Array<{ date: string; net_worth: number }>> {
  const supabase = getSupabaseClient();
  const result: Array<{ date: string; net_worth: number }> = [];

  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 0);
    const dateStr = date.toISOString().split('T')[0];

    const { data } = await supabase.rpc('get_net_worth', {
      p_user_id: userId,
      p_as_of_date: dateStr,
    });

    result.push({
      date: dateStr,
      net_worth: data || 0,
    });
  }

  return result;
}

// 헬퍼 함수: 계정을 부모 기준으로 그룹화
function groupAccountsByParent(
  accounts: any[],
  balances: Map<string, number>
): Array<{ name: string; balance: number; accounts: Array<{ name: string; balance: number }> }> {
  const parentMap = new Map<string, { name: string; accounts: any[] }>();

  // 부모 계정 먼저 설정
  accounts.filter(a => !a.parent_id).forEach(a => {
    parentMap.set(a.id, { name: a.name, accounts: [] });
  });

  // 자식 계정 분류
  accounts.filter(a => a.parent_id).forEach(a => {
    const parent = parentMap.get(a.parent_id);
    if (parent) {
      parent.accounts.push(a);
    }
  });

  return Array.from(parentMap.entries()).map(([parentId, data]) => {
    const childBalances = data.accounts.map(child => ({
      name: child.name,
      balance: balances.get(child.id) || 0,
    }));

    const parentBalance = balances.get(parentId) || 0;
    const totalBalance = parentBalance + childBalances.reduce((sum, c) => sum + c.balance, 0);

    return {
      name: data.name,
      balance: totalBalance,
      accounts: childBalances.filter(c => c.balance !== 0),
    };
  }).filter(cat => cat.balance !== 0);
}

// 헬퍼 함수: 계정 금액 합계로 그룹화
function groupAccountsWithTotals(
  accounts: any[],
  totals: Map<string, number>
): Array<{ name: string; amount: number; accounts: Array<{ name: string; amount: number }> }> {
  const parentMap = new Map<string, { name: string; accounts: any[] }>();

  accounts.filter(a => !a.parent_id).forEach(a => {
    parentMap.set(a.id, { name: a.name, accounts: [] });
  });

  accounts.filter(a => a.parent_id).forEach(a => {
    const parent = parentMap.get(a.parent_id);
    if (parent) {
      parent.accounts.push(a);
    }
  });

  return Array.from(parentMap.entries()).map(([parentId, data]) => {
    const childAmounts = data.accounts.map(child => ({
      name: child.name,
      amount: totals.get(child.id) || 0,
    }));

    const parentAmount = totals.get(parentId) || 0;
    const totalAmount = parentAmount + childAmounts.reduce((sum, c) => sum + c.amount, 0);

    return {
      name: data.name,
      amount: totalAmount,
      accounts: childAmounts.filter(c => c.amount !== 0),
    };
  }).filter(cat => cat.amount !== 0);
}
