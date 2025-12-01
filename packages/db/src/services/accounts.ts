import { getSupabaseClient } from '../client';
import type { Account, AccountType, AccountSubtype } from '../types';

export interface CreateAccountInput {
  name: string;
  name_en?: string;
  account_type: AccountType;
  account_subtype?: AccountSubtype;
  parent_id?: string;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountInput {
  name?: string;
  name_en?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  display_order?: number;
}

// 계정 목록 조회
export async function getAccounts(userId: string): Promise<Account[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Account[];
}

// 계정 유형별 조회
export async function getAccountsByType(userId: string, type: AccountType): Promise<Account[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('account_type', type)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Account[];
}

// 계정 트리 구조로 조회
export async function getAccountsTree(userId: string): Promise<AccountWithChildren[]> {
  const accounts = await getAccounts(userId);
  return buildAccountTree(accounts);
}

export interface AccountWithChildren extends Account {
  children: AccountWithChildren[];
}

function buildAccountTree(accounts: Account[]): AccountWithChildren[] {
  const accountMap = new Map<string, AccountWithChildren>();
  const roots: AccountWithChildren[] = [];

  // 모든 계정을 맵에 추가
  accounts.forEach(account => {
    accountMap.set(account.id, { ...account, children: [] });
  });

  // 부모-자식 관계 설정
  accounts.forEach(account => {
    const node = accountMap.get(account.id)!;
    if (account.parent_id && accountMap.has(account.parent_id)) {
      accountMap.get(account.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// 단일 계정 조회
export async function getAccount(accountId: string): Promise<Account | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Account;
}

// 계정 생성
export async function createAccount(userId: string, input: CreateAccountInput): Promise<Account> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name: input.name,
      name_en: input.name_en,
      account_type: input.account_type,
      account_subtype: input.account_subtype,
      parent_id: input.parent_id,
      currency: input.currency || 'KRW',
      icon: input.icon,
      color: input.color,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}

// 계정 수정
export async function updateAccount(accountId: string, input: UpdateAccountInput): Promise<Account> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('accounts')
    .update(input)
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}

// 계정 삭제 (소프트 삭제)
export async function deleteAccount(accountId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('accounts')
    .update({ is_active: false })
    .eq('id', accountId);

  if (error) throw error;
}

// 계정 잔액 조회
export async function getAccountBalance(accountId: string, asOfDate?: string): Promise<number> {
  const supabase = getSupabaseClient();
  const date = asOfDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.rpc('get_account_balance', {
    p_account_id: accountId,
    p_as_of_date: date,
  });

  if (error) throw error;
  return data || 0;
}

// 모든 계정 잔액 조회
export async function getAllAccountBalances(userId: string, asOfDate?: string): Promise<Map<string, number>> {
  const supabase = getSupabaseClient();
  const date = asOfDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transaction_lines')
    .select(`
      account_id,
      amount,
      journal_entries!inner(entry_date, is_voided)
    `)
    .lte('journal_entries.entry_date', date)
    .eq('journal_entries.is_voided', false);

  if (error) throw error;

  const balances = new Map<string, number>();

  data?.forEach((line: any) => {
    const current = balances.get(line.account_id) || 0;
    balances.set(line.account_id, current + parseFloat(line.amount));
  });

  return balances;
}

// 신용카드 계정 생성 (편의 함수)
export async function createCreditCardAccount(
  userId: string,
  name: string,
  options?: { icon?: string; color?: string }
): Promise<Account> {
  // 먼저 단기 부채 부모 계정 찾기
  const accounts = await getAccountsByType(userId, 'LIABILITY');
  const shortTermParent = accounts.find(a => a.name === '단기 부채');

  return createAccount(userId, {
    name,
    name_en: name,
    account_type: 'LIABILITY',
    account_subtype: 'credit_card',
    parent_id: shortTermParent?.id,
    icon: options?.icon || '💳',
    color: options?.color || '#EF4444',
  });
}

// 은행 계좌 생성 (편의 함수)
export async function createBankAccount(
  userId: string,
  name: string,
  options?: { icon?: string; color?: string }
): Promise<Account> {
  // 은행 계좌 부모 찾기
  const accounts = await getAccountsByType(userId, 'ASSET');
  const bankParent = accounts.find(a => a.name === '은행 계좌');

  return createAccount(userId, {
    name,
    name_en: name,
    account_type: 'ASSET',
    account_subtype: 'bank',
    parent_id: bankParent?.id,
    icon: options?.icon || '🏦',
    color: options?.color || '#3B82F6',
  });
}
