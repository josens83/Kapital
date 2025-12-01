import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@kapital/utils';

export default function ReportsScreen() {
  const [selectedTab, setSelectedTab] = useState<'balance' | 'income' | 'cashflow'>('balance');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">재무제표</Text>
      </View>

      {/* Tab Selector */}
      <View className="px-5 py-3">
        <View className="flex-row bg-gray-200 rounded-xl p-1">
          {[
            { key: 'balance', label: '재무상태표' },
            { key: 'income', label: '손익계산서' },
            { key: 'cashflow', label: '현금흐름표' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as any)}
              className={`flex-1 py-2 rounded-lg ${
                selectedTab === tab.key ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  selectedTab === tab.key ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {selectedTab === 'balance' && <BalanceSheet />}
        {selectedTab === 'income' && <IncomeStatement />}
        {selectedTab === 'cashflow' && <CashFlowStatement />}
      </ScrollView>
    </SafeAreaView>
  );
}

function BalanceSheet() {
  return (
    <View className="mt-2">
      {/* Date */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-gray-500 text-sm">기준일</Text>
        <Text className="text-gray-900 font-semibold">2025년 1월 31일</Text>
      </View>

      {/* Assets */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-emerald-600 font-semibold mb-3">자산</Text>
        <View className="space-y-2">
          <ReportRow label="현금 및 현금성 자산" amount={12500000} />
          <ReportRow label="은행 예금" amount={28000000} />
          <ReportRow label="투자 자산" amount={8000000} />
          <ReportRow label="기타 자산" amount={5000000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="자산 총계" amount={53500000} bold />
        </View>
      </View>

      {/* Liabilities */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-red-600 font-semibold mb-3">부채</Text>
        <View className="space-y-2">
          <ReportRow label="신용카드 미결제" amount={1200000} />
          <ReportRow label="대출금" amount={7000000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="부채 총계" amount={8200000} bold />
        </View>
      </View>

      {/* Net Worth */}
      <View className="bg-primary-600 rounded-xl p-4 shadow-sm mb-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold">순자산</Text>
          <Text className="text-white text-xl font-bold">
            {formatCurrency(45300000)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function IncomeStatement() {
  return (
    <View className="mt-2">
      {/* Period */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-gray-500 text-sm">기간</Text>
        <Text className="text-gray-900 font-semibold">2025년 1월</Text>
      </View>

      {/* Income */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-emerald-600 font-semibold mb-3">수익</Text>
        <View className="space-y-2">
          <ReportRow label="급여" amount={5000000} />
          <ReportRow label="부업 수입" amount={400000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="수익 총계" amount={5400000} bold />
        </View>
      </View>

      {/* Expenses */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-red-600 font-semibold mb-3">비용</Text>
        <View className="space-y-2">
          <ReportRow label="주거비" amount={1000000} />
          <ReportRow label="식비" amount={650000} />
          <ReportRow label="교통비" amount={200000} />
          <ReportRow label="기타" amount={350000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="비용 총계" amount={2200000} bold />
        </View>
      </View>

      {/* Net Income */}
      <View className="bg-emerald-500 rounded-xl p-4 shadow-sm mb-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold">순이익</Text>
          <Text className="text-white text-xl font-bold">
            {formatCurrency(3200000)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function CashFlowStatement() {
  return (
    <View className="mt-2">
      {/* Period */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-gray-500 text-sm">기간</Text>
        <Text className="text-gray-900 font-semibold">2025년 1월</Text>
      </View>

      {/* Operating */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-primary-600 font-semibold mb-3">영업활동 현금흐름</Text>
        <View className="space-y-2">
          <ReportRow label="현금 유입" amount={5400000} positive />
          <ReportRow label="현금 유출" amount={2200000} negative />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="순 현금흐름" amount={3200000} bold positive />
        </View>
      </View>

      {/* Summary */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <View className="space-y-2">
          <ReportRow label="기초 현금" amount={12000000} />
          <ReportRow label="순 현금 변동" amount={3200000} positive />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="기말 현금" amount={15200000} bold />
        </View>
      </View>
    </View>
  );
}

function ReportRow({
  label,
  amount,
  bold,
  positive,
  negative,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-1">
      <Text className={`${bold ? 'font-semibold' : ''} text-gray-700`}>{label}</Text>
      <Text
        className={`font-currency ${
          bold ? 'font-bold' : 'font-medium'
        } ${
          positive ? 'text-emerald-500' : negative ? 'text-red-500' : 'text-gray-900'
        }`}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}
