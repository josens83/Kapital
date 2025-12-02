import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardData {
  net_worth: number;
  net_worth_change_percent: number;
  month_income: number;
  month_expenses: number;
  month_budget: number;
  recent_transactions: Array<{
    id: string;
    description: string;
    amount: number;
    icon: string;
    category: string;
  }>;
}

const defaultData: DashboardData = {
  net_worth: 0,
  net_worth_change_percent: 0,
  month_income: 0,
  month_expenses: 0,
  month_budget: 4000000,
  recent_transactions: [],
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setData(defaultData);
        return;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // 계정 조회
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // 모든 거래 내역 (잔액 계산용)
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

      // 순자산 계산
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

      // 이번 달 거래
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

      let monthIncome = 0;
      let monthExpenses = 0;

      currentMonthLines?.forEach((line: any) => {
        const account = line.account;
        const amount = parseFloat(line.amount || '0');
        
        if (account?.account_type === 'INCOME') {
          monthIncome += Math.abs(amount);
        } else if (account?.account_type === 'EXPENSE') {
          monthExpenses += Math.abs(amount);
        }
      });

      // 최근 거래
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
        .limit(5);

      const recentTransactions = recentEntries?.map((entry: any) => {
        const lines = entry.transaction_lines || [];
        const expenseLine = lines.find((l: any) => l.account?.account_type === 'EXPENSE');
        const incomeLine = lines.find((l: any) => l.account?.account_type === 'INCOME');
        
        let amount = 0;
        let icon = '💰';
        let category = '';

        if (expenseLine) {
          amount = -Math.abs(parseFloat(expenseLine.amount));
          icon = expenseLine.account?.icon || '💸';
          category = expenseLine.account?.name || '';
        } else if (incomeLine) {
          amount = Math.abs(parseFloat(incomeLine.amount));
          icon = incomeLine.account?.icon || '💵';
          category = incomeLine.account?.name || '';
        }

        return {
          id: entry.id,
          description: entry.description || '',
          amount,
          icon,
          category,
        };
      }) || [];

      // 예산 조회
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .lte('start_date', endOfMonth)
        .gte('end_date', startOfMonth);

      const totalBudget = budgets?.reduce((sum: number, b: any) => 
        sum + parseFloat(b.amount || '0'), 0
      ) || 4000000;

      setData({
        net_worth: totalAssets - totalLiabilities,
        net_worth_change_percent: 0, // TODO: 이전 달과 비교
        month_income: monthIncome,
        month_expenses: monthExpenses,
        month_budget: totalBudget,
        recent_transactions: recentTransactions,
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
