// Kapital 데이터베이스 타입 정의

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export type AccountSubtype =
  // Asset subtypes
  | 'cash' | 'bank' | 'savings' | 'investment' | 'crypto' | 'receivable' | 'deposit' | 'other_asset'
  // Liability subtypes
  | 'credit_card' | 'loan' | 'mortgage' | 'payable' | 'other_liability'
  // Equity subtypes
  | 'retained_earnings' | 'opening_balance'
  // Income subtypes
  | 'salary' | 'bonus' | 'freelance' | 'investment_income' | 'interest' | 'other_income'
  // Expense subtypes
  | 'housing' | 'utilities' | 'food' | 'groceries' | 'dining' | 'transportation'
  | 'healthcare' | 'education' | 'entertainment' | 'shopping' | 'travel' | 'other_expense';

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export type TransactionSource = 'manual' | 'bank_sync' | 'recurring' | 'import';

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface User {
  id: string;
  email: string;
  name: string | null;
  default_currency: string;
  locale: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  name_en: string | null;
  account_type: AccountType;
  account_subtype: AccountSubtype | null;
  parent_id: string | null;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  is_system: boolean;
  display_order: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  description: string | null;
  memo: string | null;
  is_voided: boolean;
  voided_at: string | null;
  source: TransactionSource;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  amount: number; // 양수 = 차변(Debit), 음수 = 대변(Credit)
  currency: string;
  exchange_rate: number;
  memo: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  amount: number;
  currency: string;
  period_type: BudgetPeriod;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  name: string;
  template_entry: {
    description: string;
    lines: Array<{
      account_id: string;
      amount: number;
      memo?: string;
    }>;
  };
  frequency: RecurringFrequency;
  next_occurrence: string;
  last_processed: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BalanceSnapshot {
  id: string;
  user_id: string;
  account_id: string;
  snapshot_date: string;
  balance: number;
  currency: string;
  created_at: string;
}

export interface AssetPrice {
  id: string;
  account_id: string;
  price_date: string;
  price: number;
  currency: string;
  source: string | null;
  created_at: string;
}

// API 요청/응답 타입
export interface CreateTransactionInput {
  entry_date: string;
  description: string;
  memo?: string;
  lines: Array<{
    account_id: string;
    amount: number;
    memo?: string;
  }>;
}

export interface SimpleTransactionInput {
  entry_date: string;
  description: string;
  amount: number;
  from_account_id: string; // 출금 계정 (신용카드, 현금 등)
  to_account_id: string;   // 지출/수입 카테고리
  memo?: string;
}

export interface BalanceSheetData {
  date: string;
  assets: {
    total: number;
    categories: Array<{
      name: string;
      balance: number;
      accounts: Array<{ name: string; balance: number }>;
    }>;
  };
  liabilities: {
    total: number;
    categories: Array<{
      name: string;
      balance: number;
      accounts: Array<{ name: string; balance: number }>;
    }>;
  };
  equity: {
    total: number;
    net_worth: number;
  };
}

export interface IncomeStatementData {
  from_date: string;
  to_date: string;
  income: {
    total: number;
    categories: Array<{
      name: string;
      amount: number;
      accounts: Array<{ name: string; amount: number }>;
    }>;
  };
  expenses: {
    total: number;
    categories: Array<{
      name: string;
      amount: number;
      accounts: Array<{ name: string; amount: number }>;
    }>;
  };
  net_income: number;
}

export interface CashFlowData {
  from_date: string;
  to_date: string;
  operating: {
    inflow: number;
    outflow: number;
    net: number;
  };
  investing: {
    inflow: number;
    outflow: number;
    net: number;
  };
  financing: {
    inflow: number;
    outflow: number;
    net: number;
  };
  beginning_cash: number;
  ending_cash: number;
  net_change: number;
}

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
  }>;
}
