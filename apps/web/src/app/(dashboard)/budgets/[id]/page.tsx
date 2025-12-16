'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@kapital/ui';
import { formatCurrency, formatPercent, formatDate } from '@kapital/utils';
import { ArrowLeft, Edit, Trash2, Target, TrendingUp, TrendingDown, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  icon: string;
  color: string;
  startDate: string;
  transactions: Transaction[];
}

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadBudget();
  }, [params.id]);

  const loadBudget = async () => {
    try {
      const supabase = createClient();

      // Load budget
      const { data: budgetData, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      // Load transactions for this category
      const { data: transactionsData } = await supabase
        .from('journal_entries')
        .select(`
          id,
          entry_date,
          description,
          transaction_lines (amount)
        `)
        .order('entry_date', { ascending: false })
        .limit(10);

      const transactions = transactionsData?.map((t: any) => ({
        id: t.id,
        date: t.entry_date,
        description: t.description,
        amount: Math.abs(t.transaction_lines?.[0]?.amount || 0),
      })) || [];

      setBudget({
        ...budgetData,
        transactions,
      });
      setEditAmount(budgetData.amount.toString());
    } catch (error) {
      console.error('Error loading budget:', error);
      // Demo data
      setBudget({
        id: params.id as string,
        name: '식비',
        category: '식비',
        amount: 800000,
        spent: 650000,
        icon: '🍽️',
        color: '#F97316',
        startDate: '2025-01-01',
        transactions: [
          { id: '1', date: '2025-01-15', description: '스타벅스', amount: 6500 },
          { id: '2', date: '2025-01-15', description: '점심 식사', amount: 9000 },
          { id: '3', date: '2025-01-14', description: '마트 장보기', amount: 87000 },
          { id: '4', date: '2025-01-12', description: '저녁 외식', amount: 45000 },
          { id: '5', date: '2025-01-10', description: '배달 음식', amount: 28000 },
        ],
      });
      setEditAmount('800000');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!budget || !editAmount) return;

    try {
      const supabase = createClient();
      await supabase
        .from('budgets')
        .update({ amount: parseInt(editAmount) })
        .eq('id', budget.id);

      setBudget({ ...budget, amount: parseInt(editAmount) });
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating budget:', error);
      // Update locally for demo
      setBudget({ ...budget, amount: parseInt(editAmount) });
      setShowEditDialog(false);
    }
  };

  const handleDelete = async () => {
    if (!budget) return;
    if (!confirm(`"${budget.name}" 예산을 삭제하시겠습니까?`)) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase
        .from('budgets')
        .delete()
        .eq('id', budget.id);

      router.push('/budgets');
    } catch (error) {
      console.error('Error deleting budget:', error);
      router.push('/budgets');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">예산을 찾을 수 없습니다</p>
        <Link href="/budgets" className="text-primary hover:underline mt-2 inline-block">
          예산 목록으로
        </Link>
      </div>
    );
  }

  const percentage = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = percentage >= 100;
  const isWarning = percentage >= 80 && percentage < 100;
  const dailyAverage = budget.spent / new Date().getDate();
  const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const projectedSpend = budget.spent + (dailyAverage * daysRemaining);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/budgets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${budget.color}20` }}
            >
              {budget.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
              <p className="text-gray-500">월간 예산</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </Button>
          <Button variant="outline" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      {/* Budget Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">예산</p>
              <p className="text-3xl font-bold font-currency">{formatCurrency(budget.amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">사용</p>
              <p className="text-3xl font-bold font-currency text-red-500">{formatCurrency(budget.spent)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">남은 금액</p>
              <p className={`text-3xl font-bold font-currency ${remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(Math.abs(remaining))}
                {remaining < 0 && <span className="text-sm ml-1">초과</span>}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">사용률</span>
              <div className="flex items-center gap-2">
                {isOverBudget ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : isWarning ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
                <span className="font-medium">{formatPercent(percentage, { decimals: 1 })}</span>
              </div>
            </div>
            <Progress
              value={Math.min(percentage, 100)}
              className="h-4"
              indicatorClassName={
                isOverBudget ? 'bg-red-500' :
                isWarning ? 'bg-yellow-500' : 'bg-emerald-500'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">일 평균 지출</p>
                <p className="text-xl font-bold font-currency">{formatCurrency(dailyAverage)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              현재 추세로 월말까지 약 {formatCurrency(projectedSpend)} 사용 예상
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">남은 일수</p>
                <p className="text-xl font-bold">{daysRemaining}일</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              하루 {formatCurrency(remaining > 0 ? remaining / daysRemaining : 0)} 사용 가능
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            최근 거래
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budget.transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">해당 카테고리의 거래 내역이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {budget.transactions.map((txn) => (
                <Link
                  key={txn.id}
                  href={`/transactions/${txn.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{txn.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(txn.date)}</p>
                  </div>
                  <p className="font-semibold font-currency text-gray-900">
                    -{formatCurrency(txn.amount)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Budget Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예산 수정</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editAmount">월 예산 금액</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₩
              </span>
              <Input
                id="editAmount"
                type="number"
                className="pl-8"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateBudget}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
