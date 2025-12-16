'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@kapital/ui';
import { formatCurrency, formatDate } from '@kapital/utils';
import { ArrowLeft, Edit, Trash2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Receipt } from 'lucide-react';

interface TransactionLine {
  id: string;
  account_id: string;
  account_name: string;
  amount: number;
  line_type: 'debit' | 'credit';
}

interface Transaction {
  id: string;
  entry_date: string;
  description: string;
  memo: string | null;
  transaction_type: 'expense' | 'income' | 'transfer';
  category_name: string | null;
  category_icon: string | null;
  lines: TransactionLine[];
  created_at: string;
  updated_at: string;
}

const TYPE_CONFIG = {
  expense: { label: '지출', icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-100' },
  income: { label: '수입', icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  transfer: { label: '이체', icon: ArrowLeftRight, color: 'text-blue-500', bg: 'bg-blue-100' },
};

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [params.id]);

  const loadTransaction = async () => {
    try {
      const supabase = createClient();

      // Load journal entry with lines
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .select(`
          id,
          entry_date,
          description,
          memo,
          created_at,
          updated_at,
          transaction_lines (
            id,
            account_id,
            amount,
            accounts (
              id,
              name
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (entryError) throw entryError;

      // Determine transaction type and category
      let transactionType: 'expense' | 'income' | 'transfer' = 'expense';
      const lines: TransactionLine[] = entry.transaction_lines.map((line: any) => ({
        id: line.id,
        account_id: line.account_id,
        account_name: line.accounts?.name || '알 수 없음',
        amount: Math.abs(line.amount),
        line_type: line.amount > 0 ? 'debit' : 'credit',
      }));

      // Simple type detection
      const hasExpenseAccount = lines.some(l => l.account_name.includes('지출') || l.account_name.includes('비용'));
      const hasIncomeAccount = lines.some(l => l.account_name.includes('수입') || l.account_name.includes('급여'));

      if (hasIncomeAccount) transactionType = 'income';
      else if (hasExpenseAccount) transactionType = 'expense';
      else transactionType = 'transfer';

      setTransaction({
        id: entry.id,
        entry_date: entry.entry_date,
        description: entry.description,
        memo: entry.memo,
        transaction_type: transactionType,
        category_name: null,
        category_icon: null,
        lines,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      });
    } catch (error) {
      console.error('Error loading transaction:', error);
      // Demo data
      setTransaction({
        id: params.id as string,
        entry_date: '2025-01-15',
        description: '스타벅스 커피',
        memo: '아메리카노 2잔',
        transaction_type: 'expense',
        category_name: '식비',
        category_icon: '☕',
        lines: [
          { id: '1', account_id: 'a1', account_name: '식비', amount: 13000, line_type: 'debit' },
          { id: '2', account_id: 'a2', account_name: '신한카드', amount: 13000, line_type: 'credit' },
        ],
        created_at: '2025-01-15T10:30:00Z',
        updated_at: '2025-01-15T10:30:00Z',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    if (!confirm('이 거래를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setDeleting(true);
    try {
      const supabase = createClient();

      // Delete transaction lines first
      await supabase
        .from('transaction_lines')
        .delete()
        .eq('journal_entry_id', transaction.id);

      // Delete journal entry
      await supabase
        .from('journal_entries')
        .delete()
        .eq('id', transaction.id);

      router.push('/transactions');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">거래를 찾을 수 없습니다</p>
        <Link href="/transactions" className="text-primary hover:underline mt-2 inline-block">
          거래 목록으로
        </Link>
      </div>
    );
  }

  const config = TYPE_CONFIG[transaction.transaction_type];
  const TypeIcon = config.icon;
  const totalAmount = transaction.lines.reduce((sum, line) => {
    return line.line_type === 'debit' ? sum + line.amount : sum;
  }, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">거래 상세</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/transactions/${transaction.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.bg}`}>
              {transaction.category_icon ? (
                <span className="text-3xl">{transaction.category_icon}</span>
              ) : (
                <TypeIcon className={`h-8 w-8 ${config.color}`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
                {transaction.category_name && (
                  <span className="text-sm text-gray-500">{transaction.category_name}</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {transaction.description}
              </h2>
              <p className="text-sm text-gray-500">
                {formatDate(transaction.entry_date)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${config.color}`}>
                {transaction.transaction_type === 'income' ? '+' : '-'}
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {transaction.memo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{transaction.memo}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal Entry (Double-Entry) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5" />
            분개 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">계정</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-gray-500">차변(Debit)</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-gray-500">대변(Credit)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transaction.lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/accounts/${line.account_id}`}
                        className="text-primary hover:underline"
                      >
                        {line.account_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {line.line_type === 'debit' ? formatCurrency(line.amount) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {line.line_type === 'credit' ? formatCurrency(line.amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">합계</th>
                  <td className="px-4 py-2 text-right font-mono font-medium">
                    {formatCurrency(transaction.lines.filter(l => l.line_type === 'debit').reduce((s, l) => s + l.amount, 0))}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-medium">
                    {formatCurrency(transaction.lines.filter(l => l.line_type === 'credit').reduce((s, l) => s + l.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            * 복식부기 원칙에 따라 차변과 대변의 합계는 항상 일치합니다.
          </p>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">생성일</p>
              <p className="font-medium">{new Date(transaction.created_at).toLocaleString('ko-KR')}</p>
            </div>
            <div>
              <p className="text-gray-500">수정일</p>
              <p className="font-medium">{new Date(transaction.updated_at).toLocaleString('ko-KR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
