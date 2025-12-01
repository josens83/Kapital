import { getSupabaseClient } from '../client';
import type {
  JournalEntry,
  TransactionLine,
  CreateTransactionInput,
  SimpleTransactionInput,
} from '../types';

export interface TransactionWithLines extends JournalEntry {
  transaction_lines: TransactionLine[];
}

// 거래 목록 조회
export async function getTransactions(
  userId: string,
  options?: {
    from?: string;
    to?: string;
    accountId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<TransactionWithLines[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('journal_entries')
    .select(`
      *,
      transaction_lines(*)
    `)
    .eq('user_id', userId)
    .eq('is_voided', false)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (options?.from) {
    query = query.gte('entry_date', options.from);
  }
  if (options?.to) {
    query = query.lte('entry_date', options.to);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;

  // accountId 필터가 있으면 해당 계정이 포함된 거래만 반환
  if (options?.accountId) {
    return (data as TransactionWithLines[]).filter(entry =>
      entry.transaction_lines.some(line => line.account_id === options.accountId)
    );
  }

  return data as TransactionWithLines[];
}

// 단일 거래 조회
export async function getTransaction(entryId: string): Promise<TransactionWithLines | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('journal_entries')
    .select(`
      *,
      transaction_lines(*)
    `)
    .eq('id', entryId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as TransactionWithLines;
}

// 복식부기 거래 생성 (완전한 분개)
export async function createTransaction(
  userId: string,
  input: CreateTransactionInput
): Promise<TransactionWithLines> {
  const supabase = getSupabaseClient();

  // 분개 균형 검증 (차변 합 = 대변 합)
  const sum = input.lines.reduce((acc, line) => acc + line.amount, 0);
  if (Math.abs(sum) > 0.0001) {
    throw new Error(`분개가 균형을 이루지 않습니다. 현재 합계: ${sum}`);
  }

  // 분개장 엔트리 생성
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      entry_date: input.entry_date,
      description: input.description,
      memo: input.memo,
      source: 'manual',
    })
    .select()
    .single();

  if (entryError) throw entryError;

  // 거래 라인 생성
  const lines = input.lines.map(line => ({
    journal_entry_id: entry.id,
    account_id: line.account_id,
    amount: line.amount,
    memo: line.memo,
  }));

  const { error: linesError } = await supabase.from('transaction_lines').insert(lines);

  if (linesError) {
    // 롤백: 분개장 엔트리 삭제
    await supabase.from('journal_entries').delete().eq('id', entry.id);
    throw linesError;
  }

  return getTransaction(entry.id) as Promise<TransactionWithLines>;
}

// 단순 거래 생성 (지출/수입)
// 시스템이 자동으로 복식부기 분개를 생성
export async function createSimpleTransaction(
  userId: string,
  input: SimpleTransactionInput
): Promise<TransactionWithLines> {
  // 지출: from_account(자산/부채) 감소, to_account(비용) 증가
  // 수입: from_account(수입) 감소, to_account(자산) 증가

  const lines = [
    { account_id: input.to_account_id, amount: Math.abs(input.amount), memo: input.memo },
    { account_id: input.from_account_id, amount: -Math.abs(input.amount), memo: input.memo },
  ];

  return createTransaction(userId, {
    entry_date: input.entry_date,
    description: input.description,
    memo: input.memo,
    lines,
  });
}

// 계좌 이체 생성
export async function createTransfer(
  userId: string,
  input: {
    entry_date: string;
    description: string;
    amount: number;
    from_account_id: string;
    to_account_id: string;
    memo?: string;
  }
): Promise<TransactionWithLines> {
  const lines = [
    { account_id: input.to_account_id, amount: Math.abs(input.amount) },
    { account_id: input.from_account_id, amount: -Math.abs(input.amount) },
  ];

  return createTransaction(userId, {
    entry_date: input.entry_date,
    description: input.description,
    memo: input.memo,
    lines,
  });
}

// 거래 수정
export async function updateTransaction(
  entryId: string,
  input: {
    entry_date?: string;
    description?: string;
    memo?: string;
    lines?: Array<{ account_id: string; amount: number; memo?: string }>;
  }
): Promise<TransactionWithLines> {
  const supabase = getSupabaseClient();

  // 기본 정보 업데이트
  const updateData: Record<string, unknown> = {};
  if (input.entry_date) updateData.entry_date = input.entry_date;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.memo !== undefined) updateData.memo = input.memo;

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase.from('journal_entries').update(updateData).eq('id', entryId);
    if (error) throw error;
  }

  // 라인 업데이트
  if (input.lines) {
    // 분개 균형 검증
    const sum = input.lines.reduce((acc, line) => acc + line.amount, 0);
    if (Math.abs(sum) > 0.0001) {
      throw new Error(`분개가 균형을 이루지 않습니다. 현재 합계: ${sum}`);
    }

    // 기존 라인 삭제
    const { error: deleteError } = await supabase
      .from('transaction_lines')
      .delete()
      .eq('journal_entry_id', entryId);
    if (deleteError) throw deleteError;

    // 새 라인 추가
    const lines = input.lines.map(line => ({
      journal_entry_id: entryId,
      account_id: line.account_id,
      amount: line.amount,
      memo: line.memo,
    }));

    const { error: insertError } = await supabase.from('transaction_lines').insert(lines);
    if (insertError) throw insertError;
  }

  return getTransaction(entryId) as Promise<TransactionWithLines>;
}

// 거래 무효화 (취소)
export async function voidTransaction(entryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('journal_entries')
    .update({
      is_voided: true,
      voided_at: new Date().toISOString(),
    })
    .eq('id', entryId);

  if (error) throw error;
}

// 거래 삭제 (하드 삭제 - 주의해서 사용)
export async function deleteTransaction(entryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  // cascade 설정으로 transaction_lines도 자동 삭제
  const { error } = await supabase.from('journal_entries').delete().eq('id', entryId);

  if (error) throw error;
}

// 최근 거래 조회 (대시보드용)
export async function getRecentTransactions(
  userId: string,
  limit: number = 10
): Promise<
  Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    account_name: string;
    category_name: string;
    icon: string;
    type: 'income' | 'expense' | 'transfer';
  }>
> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('journal_entries')
    .select(`
      id,
      entry_date,
      description,
      transaction_lines(
        amount,
        account:accounts(id, name, icon, account_type)
      )
    `)
    .eq('user_id', userId)
    .eq('is_voided', false)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((entry: any) => {
    const lines = entry.transaction_lines || [];
    const expenseLine = lines.find((l: any) => l.account?.account_type === 'EXPENSE');
    const incomeLine = lines.find((l: any) => l.account?.account_type === 'INCOME');
    const assetLine = lines.find((l: any) => l.account?.account_type === 'ASSET');

    let type: 'income' | 'expense' | 'transfer' = 'transfer';
    let amount = 0;
    let account_name = '';
    let category_name = '';
    let icon = '💰';

    if (expenseLine) {
      type = 'expense';
      amount = -Math.abs(expenseLine.amount);
      category_name = expenseLine.account?.name || '';
      icon = expenseLine.account?.icon || '💸';
      const paymentLine = lines.find((l: any) => l.account?.account_type !== 'EXPENSE');
      account_name = paymentLine?.account?.name || '';
    } else if (incomeLine) {
      type = 'income';
      amount = Math.abs(incomeLine.amount);
      category_name = incomeLine.account?.name || '';
      icon = incomeLine.account?.icon || '💵';
      const depositLine = lines.find((l: any) => l.account?.account_type !== 'INCOME');
      account_name = depositLine?.account?.name || '';
    } else if (assetLine) {
      type = 'transfer';
      amount = assetLine.amount;
      account_name = assetLine.account?.name || '';
      icon = '🔄';
    }

    return {
      id: entry.id,
      date: entry.entry_date,
      description: entry.description || '',
      amount,
      account_name,
      category_name,
      icon,
      type,
    };
  });
}

// 특정 월의 지출 합계
export async function getMonthlyExpenses(userId: string, year: number, month: number): Promise<number> {
  const supabase = getSupabaseClient();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
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

  if (error) throw error;

  return (data || []).reduce((sum: number, line: any) => sum + Math.abs(parseFloat(line.amount)), 0);
}

// 특정 월의 수입 합계
export async function getMonthlyIncome(userId: string, year: number, month: number): Promise<number> {
  const supabase = getSupabaseClient();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transaction_lines')
    .select(`
      amount,
      accounts!inner(account_type),
      journal_entries!inner(entry_date, is_voided, user_id)
    `)
    .eq('accounts.account_type', 'INCOME')
    .eq('journal_entries.user_id', userId)
    .eq('journal_entries.is_voided', false)
    .gte('journal_entries.entry_date', startDate)
    .lte('journal_entries.entry_date', endDate);

  if (error) throw error;

  return (data || []).reduce((sum: number, line: any) => sum + Math.abs(parseFloat(line.amount)), 0);
}
