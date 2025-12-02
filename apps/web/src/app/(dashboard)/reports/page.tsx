'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kapital/ui';
import { formatCurrency } from '@kapital/utils';
import { Download, FileText, TrendingUp, DollarSign, ArrowDownUp } from 'lucide-react';

// 데모 데이터
const balanceSheetData = {
  date: '2025-01-31',
  assets: {
    total: 53500000,
    items: [
      { name: '현금 및 현금성 자산', amount: 12650000 },
      { name: '은행 예금', amount: 28000000 },
      { name: '투자 자산', amount: 8000000 },
      { name: '기타 자산', amount: 4850000 },
    ],
  },
  liabilities: {
    total: 8200000,
    items: [
      { name: '신용카드 미결제', amount: 1700000 },
      { name: '단기 대출', amount: 6500000 },
    ],
  },
  equity: 45300000,
};

const incomeStatementData = {
  period: '2025년 1월',
  income: {
    total: 5400000,
    items: [
      { name: '급여', amount: 5000000 },
      { name: '부업/프리랜서', amount: 400000 },
    ],
  },
  expenses: {
    total: 2200000,
    items: [
      { name: '주거비', amount: 1000000 },
      { name: '식비', amount: 650000 },
      { name: '교통비', amount: 200000 },
      { name: '통신비', amount: 100000 },
      { name: '기타', amount: 250000 },
    ],
  },
  netIncome: 3200000,
};

const cashFlowData = {
  period: '2025년 1월',
  operating: {
    inflow: 5400000,
    outflow: 2200000,
    net: 3200000,
  },
  investing: {
    inflow: 0,
    outflow: 500000,
    net: -500000,
  },
  financing: {
    inflow: 0,
    outflow: 200000,
    net: -200000,
  },
  beginningCash: 10150000,
  endingCash: 12650000,
  netChange: 2500000,
};

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">재무제표</h1>
          <p className="text-gray-500">재무상태표, 손익계산서, 현금흐름표를 확인하세요</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">2025년 1월</SelectItem>
              <SelectItem value="2024-12">2024년 12월</SelectItem>
              <SelectItem value="2024-11">2024년 11월</SelectItem>
              <SelectItem value="2024-10">2024년 10월</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            PDF 다운로드
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="balance-sheet">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            재무상태표
          </TabsTrigger>
          <TabsTrigger value="income-statement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            손익계산서
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4" />
            현금흐름표
          </TabsTrigger>
        </TabsList>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-center">
                재무상태표
                <p className="text-sm font-normal text-gray-500 mt-1">
                  {balanceSheetData.date} 기준
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-x">
                {/* Assets */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-emerald-600 mb-4">자산</h3>
                  <div className="space-y-3">
                    {balanceSheetData.assets.items.map((item) => (
                      <div key={item.name} className="flex justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-currency">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>자산 총계</span>
                      <span className="text-emerald-600 font-currency">
                        {formatCurrency(balanceSheetData.assets.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">부채</h3>
                  <div className="space-y-3">
                    {balanceSheetData.liabilities.items.map((item) => (
                      <div key={item.name} className="flex justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-currency">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>부채 총계</span>
                      <span className="text-red-600 font-currency">
                        {formatCurrency(balanceSheetData.liabilities.total)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-primary mt-6 mb-4">자본</h3>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>순자산 (자산 - 부채)</span>
                    <span className="text-primary font-currency">
                      {formatCurrency(balanceSheetData.equity)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Statement */}
        <TabsContent value="income-statement" className="space-y-4">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-center">
                손익계산서
                <p className="text-sm font-normal text-gray-500 mt-1">
                  {incomeStatementData.period}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Income */}
                <div>
                  <h3 className="text-lg font-semibold text-emerald-600 mb-4">수익</h3>
                  <div className="space-y-3 pl-4">
                    {incomeStatementData.income.items.map((item) => (
                      <div key={item.name} className="flex justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-currency">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>수익 총계</span>
                      <span className="text-emerald-600 font-currency">
                        {formatCurrency(incomeStatementData.income.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-4">비용</h3>
                  <div className="space-y-3 pl-4">
                    {incomeStatementData.expenses.items.map((item) => (
                      <div key={item.name} className="flex justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-currency">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>비용 총계</span>
                      <span className="text-red-600 font-currency">
                        {formatCurrency(incomeStatementData.expenses.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Income */}
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">순이익</span>
                    <span className="text-2xl font-bold text-primary font-currency">
                      {formatCurrency(incomeStatementData.netIncome)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow */}
        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-center">
                현금흐름표
                <p className="text-sm font-normal text-gray-500 mt-1">
                  {cashFlowData.period}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Operating Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">영업활동 현금흐름</h3>
                  <div className="space-y-3 pl-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">현금 유입</span>
                      <span className="text-emerald-600 font-currency">
                        +{formatCurrency(cashFlowData.operating.inflow)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">현금 유출</span>
                      <span className="text-red-600 font-currency">
                        -{formatCurrency(cashFlowData.operating.outflow)}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>순 현금흐름</span>
                      <span className="font-currency">{formatCurrency(cashFlowData.operating.net)}</span>
                    </div>
                  </div>
                </div>

                {/* Investing Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">투자활동 현금흐름</h3>
                  <div className="space-y-3 pl-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">현금 유입</span>
                      <span className="font-currency">{formatCurrency(cashFlowData.investing.inflow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">현금 유출</span>
                      <span className="text-red-600 font-currency">
                        -{formatCurrency(cashFlowData.investing.outflow)}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>순 현금흐름</span>
                      <span className="text-red-600 font-currency">{formatCurrency(cashFlowData.investing.net)}</span>
                    </div>
                  </div>
                </div>

                {/* Financing Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">재무활동 현금흐름</h3>
                  <div className="space-y-3 pl-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">현금 유입</span>
                      <span className="font-currency">{formatCurrency(cashFlowData.financing.inflow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">현금 유출</span>
                      <span className="text-red-600 font-currency">
                        -{formatCurrency(cashFlowData.financing.outflow)}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>순 현금흐름</span>
                      <span className="text-red-600 font-currency">{formatCurrency(cashFlowData.financing.net)}</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">기초 현금</span>
                    <span className="font-currency">{formatCurrency(cashFlowData.beginningCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">현금 순변동</span>
                    <span className="text-emerald-600 font-currency">
                      +{formatCurrency(cashFlowData.netChange)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>기말 현금</span>
                    <span className="text-primary font-currency">
                      {formatCurrency(cashFlowData.endingCash)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
