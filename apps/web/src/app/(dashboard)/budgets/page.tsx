'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kapital/ui';
import { formatCurrency, formatPercent } from '@kapital/utils';
import { Plus, Target, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';

// 데모 데이터
const budgetsData = [
  { id: '1', name: '식비', category: '식비', amount: 800000, spent: 650000, icon: '🍽️', color: '#F97316' },
  { id: '2', name: '교통비', category: '교통비', amount: 300000, spent: 200000, icon: '🚗', color: '#3B82F6' },
  { id: '3', name: '쇼핑', category: '쇼핑', amount: 500000, spent: 480000, icon: '🛍️', color: '#EC4899' },
  { id: '4', name: '여가/문화', category: '여가/문화', amount: 400000, spent: 320000, icon: '🎬', color: '#A855F7' },
  { id: '5', name: '구독서비스', category: '구독서비스', amount: 100000, spent: 67000, icon: '📺', color: '#6366F1' },
  { id: '6', name: '의료비', category: '의료비', amount: 200000, spent: 35000, icon: '🏥', color: '#10B981' },
];

const categories = [
  { value: 'food', label: '식비', icon: '🍽️' },
  { value: 'transportation', label: '교통비', icon: '🚗' },
  { value: 'shopping', label: '쇼핑', icon: '🛍️' },
  { value: 'entertainment', label: '여가/문화', icon: '🎬' },
  { value: 'subscription', label: '구독서비스', icon: '📺' },
  { value: 'healthcare', label: '의료비', icon: '🏥' },
  { value: 'housing', label: '주거비', icon: '🏠' },
  { value: 'utilities', label: '공과금', icon: '💡' },
  { value: 'education', label: '교육비', icon: '📚' },
  { value: 'other', label: '기타', icon: '📦' },
];

export default function BudgetsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: '', category: '', amount: '' });

  const totalBudget = budgetsData.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsData.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = (totalSpent / totalBudget) * 100;

  const handleAddBudget = () => {
    console.log('New budget:', newBudget);
    setShowAddDialog(false);
    setNewBudget({ name: '', category: '', amount: '' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">예산 관리</h1>
          <p className="text-gray-500">월별 예산을 설정하고 지출을 추적하세요</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          예산 추가
        </Button>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            이번 달 예산 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div>
              <p className="text-sm text-gray-500">총 예산</p>
              <p className="text-2xl font-bold font-currency">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">사용 금액</p>
              <p className="text-2xl font-bold font-currency text-red-500">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">남은 금액</p>
              <p className="text-2xl font-bold font-currency text-emerald-500">{formatCurrency(totalRemaining)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">전체 사용률</span>
              <span className="font-medium">{formatPercent(overallPercentage, { decimals: 0 })}</span>
            </div>
            <Progress
              value={overallPercentage}
              className="h-3"
              indicatorClassName={
                overallPercentage > 90 ? 'bg-red-500' :
                overallPercentage > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget List */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgetsData.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          const remaining = budget.amount - budget.spent;
          const isOverBudget = percentage >= 100;
          const isWarning = percentage >= 80 && percentage < 100;

          return (
            <Link key={budget.id} href={`/budgets/${budget.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${budget.color}20` }}
                        >
                          {budget.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverBudget ? (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">초과</span>
                          </div>
                        ) : isWarning ? (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">주의</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">정상</span>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-2"
                        indicatorClassName={
                          isOverBudget ? 'bg-red-500' :
                          isWarning ? 'bg-yellow-500' : 'bg-emerald-500'
                        }
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {formatPercent(percentage, { decimals: 0 })} 사용
                        </span>
                        <span className={remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                          {remaining >= 0 ? `${formatCurrency(remaining)} 남음` : `${formatCurrency(Math.abs(remaining))} 초과`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Add Budget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 예산 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budgetName">예산 이름</Label>
              <Input
                id="budgetName"
                placeholder="예: 식비"
                value={newBudget.name}
                onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={newBudget.category}
                onValueChange={(v) => setNewBudget({ ...newBudget, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">월 예산 금액</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₩
                </span>
                <Input
                  id="budgetAmount"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddBudget}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
