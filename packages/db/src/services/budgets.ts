import { getSupabaseClient } from '../client';
import type { Budget, BudgetPeriod } from '../types';

export interface CreateBudgetInput {
  name: string;
  account_id?: string;
  amount: number;
  currency?: string;
  period_type?: BudgetPeriod;
  start_date: string;
  end_date?: string;
}

export interface UpdateBudgetInput {
  name?: string;
  amount?: number;
  is_active?: boolean;
  end_date?: string;
}

export interface BudgetWithProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  account_name?: string;
}

// 예산 목록 조회
export async function getBudgets(userId: string): Promise<Budget[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Budget[];
}

// 예산 + 진행률 조회
export async function getBudgetsWithProgress(userId: string): Promise<BudgetWithProgress[]> {
  const supabase = getSupabaseClient();

  const { data: budgets, error } = await supabase
    .from('budgets')
    .select(`
      *,
      accounts(name)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const today = new Date();
  const result: BudgetWithProgress[] = [];

  for (const budget of budgets || []) {
    const { startDate, endDate } = getBudgetPeriodDates(budget.period_type, budget.start_date);

    // 해당 기간 지출 합계 계산
    let spent = 0;

    if (budget.account_id) {
      // 특정 계정에 대한 예산
      const { data: lines } = await supabase
        .from('transaction_lines')
        .select(`
          amount,
          journal_entries!inner(entry_date, is_voided, user_id)
        `)
        .eq('account_id', budget.account_id)
        .eq('journal_entries.user_id', userId)
        .eq('journal_entries.is_voided', false)
        .gte('journal_entries.entry_date', startDate)
        .lte('journal_entries.entry_date', endDate);

      spent = (lines || []).reduce((sum: number, line: any) => sum + Math.abs(parseFloat(line.amount)), 0);
    } else {
      // 전체 지출 예산
      const { data: lines } = await supabase
        .from('transaction_lines')
        .select(`
          amount,
          accounts!inner(account_type),
          journal_entries!inner(entry_date, is_voided, user_id)
        `)
        .eq('accounts.account_type', 'EXPENSE')
        .eq('journal_entries.user_id', userId)
        .eq('journal_entries.is_voided', false)
        .gte('journal_entries.entry_date', startDate)
        .lte('journal_entries.entry_date', endDate);

      spent = (lines || []).reduce((sum: number, line: any) => sum + Math.abs(parseFloat(line.amount)), 0);
    }

    const remaining = Math.max(0, parseFloat(String(budget.amount)) - spent);
    const percentage = parseFloat(String(budget.amount)) > 0
      ? (spent / parseFloat(String(budget.amount))) * 100
      : 0;

    result.push({
      ...budget,
      spent,
      remaining,
      percentage,
      account_name: (budget as any).accounts?.name,
    });
  }

  return result;
}

// 단일 예산 조회
export async function getBudget(budgetId: string): Promise<Budget | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', budgetId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Budget;
}

// 예산 생성
export async function createBudget(userId: string, input: CreateBudgetInput): Promise<Budget> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: userId,
      name: input.name,
      account_id: input.account_id,
      amount: input.amount,
      currency: input.currency || 'KRW',
      period_type: input.period_type || 'monthly',
      start_date: input.start_date,
      end_date: input.end_date,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
}

// 예산 수정
export async function updateBudget(budgetId: string, input: UpdateBudgetInput): Promise<Budget> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('budgets')
    .update(input)
    .eq('id', budgetId)
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
}

// 예산 삭제 (소프트 삭제)
export async function deleteBudget(budgetId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('budgets')
    .update({ is_active: false })
    .eq('id', budgetId);

  if (error) throw error;
}

// 예산 알림 확인 (80% 또는 100% 초과)
export async function checkBudgetAlerts(
  userId: string
): Promise<Array<{ budget: Budget; type: 'warning' | 'exceeded'; percentage: number }>> {
  const budgets = await getBudgetsWithProgress(userId);
  const alerts: Array<{ budget: Budget; type: 'warning' | 'exceeded'; percentage: number }> = [];

  for (const budget of budgets) {
    if (budget.percentage >= 100) {
      alerts.push({ budget, type: 'exceeded', percentage: budget.percentage });
    } else if (budget.percentage >= 80) {
      alerts.push({ budget, type: 'warning', percentage: budget.percentage });
    }
  }

  return alerts;
}

// 헬퍼 함수: 예산 기간의 시작/종료 날짜 계산
function getBudgetPeriodDates(
  periodType: string,
  startDate: string
): { startDate: string; endDate: string } {
  const today = new Date();
  const start = new Date(startDate);

  switch (periodType) {
    case 'weekly': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return {
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
      };
    }
    case 'monthly': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0],
      };
    }
    case 'quarterly': {
      const quarter = Math.floor(today.getMonth() / 3);
      const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);
      return {
        startDate: quarterStart.toISOString().split('T')[0],
        endDate: quarterEnd.toISOString().split('T')[0],
      };
    }
    case 'yearly': {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      return {
        startDate: yearStart.toISOString().split('T')[0],
        endDate: yearEnd.toISOString().split('T')[0],
      };
    }
    default:
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      };
  }
}

// 카테고리별 예산 vs 실제 지출 비교
export async function getBudgetVsActual(
  userId: string,
  year: number,
  month: number
): Promise<Array<{
  category: string;
  budget: number;
  actual: number;
  difference: number;
  percentage: number;
}>> {
  const supabase = getSupabaseClient();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  // 활성 예산 가져오기
  const { data: budgets } = await supabase
    .from('budgets')
    .select(`
      amount,
      accounts(name)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('period_type', 'monthly')
    .not('account_id', 'is', null);

  // 카테고리별 실제 지출
  const { data: expenses } = await supabase
    .from('transaction_lines')
    .select(`
      amount,
      accounts!inner(name, account_type)
    `)
    .eq('accounts.account_type', 'EXPENSE');

  const categoryBudgets = new Map<string, number>();
  const categoryActuals = new Map<string, number>();

  (budgets || []).forEach((b: any) => {
    if (b.accounts?.name) {
      categoryBudgets.set(b.accounts.name, parseFloat(String(b.amount)));
    }
  });

  (expenses || []).forEach((e: any) => {
    const name = e.accounts.name;
    const current = categoryActuals.get(name) || 0;
    categoryActuals.set(name, current + Math.abs(parseFloat(e.amount)));
  });

  const categories = new Set([...categoryBudgets.keys(), ...categoryActuals.keys()]);

  return Array.from(categories).map(category => {
    const budget = categoryBudgets.get(category) || 0;
    const actual = categoryActuals.get(category) || 0;
    const difference = budget - actual;
    const percentage = budget > 0 ? (actual / budget) * 100 : 0;

    return { category, budget, actual, difference, percentage };
  });
}
