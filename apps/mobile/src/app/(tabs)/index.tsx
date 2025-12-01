import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency, formatPercent } from '@kapital/utils';

// 데모 데이터
const dashboardData = {
  net_worth: 45230000,
  net_worth_change_percent: 2.3,
  month_income: 5400000,
  month_expenses: 3200000,
  month_budget: 4000000,
  recent_transactions: [
    { id: '1', description: '스타벅스', amount: -6500, icon: '☕', category: '식비' },
    { id: '2', description: '점심 식사', amount: -9000, icon: '🍚', category: '식비' },
    { id: '3', description: '급여 입금', amount: 4500000, icon: '💰', category: '급여' },
    { id: '4', description: '넷플릭스', amount: -17000, icon: '📺', category: '구독' },
    { id: '5', description: '마트 장보기', amount: -87000, icon: '🛒', category: '식료품' },
  ],
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: 데이터 새로고침
    setTimeout(() => setRefreshing(false), 1000);
  };

  const budgetUsage = (dashboardData.month_expenses / dashboardData.month_budget) * 100;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Kapital</Text>
        </View>

        {/* Net Worth Card */}
        <View className="mx-5 mt-4 bg-primary-600 rounded-2xl p-5">
          <Text className="text-white/80 text-sm">순자산</Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {formatCurrency(dashboardData.net_worth)}
          </Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-emerald-300 text-sm">
              ▲ {formatPercent(dashboardData.net_worth_change_percent, { showSign: true })}
            </Text>
            <Text className="text-white/60 text-sm ml-2">전월 대비</Text>
          </View>
        </View>

        {/* Income/Expense Cards */}
        <View className="flex-row mx-5 mt-4 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">이번 달 수입</Text>
            <Text className="text-emerald-500 text-xl font-bold mt-1">
              {formatCurrency(dashboardData.month_income)}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">이번 달 지출</Text>
            <Text className="text-red-500 text-xl font-bold mt-1">
              {formatCurrency(dashboardData.month_expenses)}
            </Text>
          </View>
        </View>

        {/* Budget Progress */}
        <View className="mx-5 mt-4 bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-500 text-sm">예산 현황</Text>
            <Text className="text-gray-900 font-semibold">
              {budgetUsage.toFixed(0)}%
            </Text>
          </View>
          <View className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                budgetUsage > 90 ? 'bg-red-500' : budgetUsage > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-2">
            {formatCurrency(dashboardData.month_budget - dashboardData.month_expenses)} 남음
          </Text>
        </View>

        {/* Recent Transactions */}
        <View className="mx-5 mt-6 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">최근 거래</Text>
            <TouchableOpacity>
              <Text className="text-primary-600 text-sm">모두 보기</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            {dashboardData.recent_transactions.map((transaction, index) => (
              <TouchableOpacity
                key={transaction.id}
                className={`flex-row items-center p-4 ${
                  index < dashboardData.recent_transactions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-lg">{transaction.icon}</Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium">{transaction.description}</Text>
                  <Text className="text-gray-500 text-sm">{transaction.category}</Text>
                </View>
                <Text
                  className={`font-semibold ${
                    transaction.amount > 0 ? 'text-emerald-500' : 'text-gray-900'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB - Add Transaction */}
      <TouchableOpacity
        className="absolute bottom-6 right-5 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
