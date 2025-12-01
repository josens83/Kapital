import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency, formatSmartDate } from '@kapital/utils';

// 데모 데이터
const transactions = [
  { id: '1', date: '2025-01-15', description: '스타벅스', amount: -6500, account: '신한카드', category: '식비', icon: '☕' },
  { id: '2', date: '2025-01-15', description: '점심 식사', amount: -9000, account: '현금', category: '식비', icon: '🍚' },
  { id: '3', date: '2025-01-14', description: '급여 입금', amount: 4500000, account: '국민은행', category: '급여', icon: '💰' },
  { id: '4', date: '2025-01-13', description: '넷플릭스', amount: -17000, account: '신한카드', category: '구독', icon: '📺' },
  { id: '5', date: '2025-01-12', description: '마트 장보기', amount: -87000, account: '신한카드', category: '식료품', icon: '🛒' },
  { id: '6', date: '2025-01-11', description: '교통카드 충전', amount: -50000, account: '신한카드', category: '교통비', icon: '🚇' },
  { id: '7', date: '2025-01-10', description: '부업 수입', amount: 400000, account: '국민은행', category: '부업', icon: '💻' },
];

export default function TransactionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'income' && t.amount > 0) ||
      (filter === 'expense' && t.amount < 0);
    return matchesSearch && matchesFilter;
  });

  // 날짜별 그룹화
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">거래내역</Text>
      </View>

      {/* Search & Filter */}
      <View className="px-5 py-3">
        <View className="bg-white rounded-xl px-4 py-3 flex-row items-center shadow-sm">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-gray-900"
            placeholder="거래 검색..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View className="flex-row mt-3 gap-2">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-full ${
                filter === f ? 'bg-primary-600' : 'bg-white'
              }`}
            >
              <Text className={filter === f ? 'text-white' : 'text-gray-600'}>
                {f === 'all' ? '전체' : f === 'income' ? '수입' : '지출'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView className="flex-1 px-5">
        {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
          <View key={date} className="mb-4">
            <Text className="text-gray-500 text-sm mb-2">{formatSmartDate(date)}</Text>
            <View className="bg-white rounded-xl overflow-hidden shadow-sm">
              {dayTransactions.map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  className={`flex-row items-center p-4 ${
                    index < dayTransactions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                    <Text className="text-lg">{transaction.icon}</Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-medium">{transaction.description}</Text>
                    <Text className="text-gray-500 text-sm">{transaction.account} • {transaction.category}</Text>
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
        ))}

        {filteredTransactions.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500">거래 내역이 없습니다</Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
