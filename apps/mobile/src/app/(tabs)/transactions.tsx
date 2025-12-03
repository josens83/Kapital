import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatSmartDate } from '@kapital/utils';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: string;
}

// Demo data
const DEMO_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2025-12-03', description: '스타벅스', amount: 6500, type: 'expense', account: '신한카드', category: '식비' },
  { id: '2', date: '2025-12-03', description: '점심 식사', amount: 9000, type: 'expense', account: '현금', category: '식비' },
  { id: '3', date: '2025-12-02', description: '급여 입금', amount: 4500000, type: 'income', account: '국민은행', category: '급여' },
  { id: '4', date: '2025-12-01', description: '넷플릭스', amount: 17000, type: 'expense', account: '신한카드', category: '구독' },
  { id: '5', date: '2025-11-30', description: '마트 장보기', amount: 87000, type: 'expense', account: '신한카드', category: '식료품' },
  { id: '6', date: '2025-11-29', description: '교통카드 충전', amount: 50000, type: 'expense', account: '신한카드', category: '교통비' },
  { id: '7', date: '2025-11-28', description: '부업 수입', amount: 400000, type: 'income', account: '국민은행', category: '부업' },
  { id: '8', date: '2025-11-27', description: '통신비', amount: 55000, type: 'expense', account: '국민은행', category: '공과금' },
  { id: '9', date: '2025-11-26', description: '카페', amount: 4500, type: 'expense', account: '신한카드', category: '식비' },
  { id: '10', date: '2025-11-25', description: '온라인 쇼핑', amount: 32000, type: 'expense', account: '신한카드', category: '쇼핑' },
];

const CATEGORIES = ['전체', '식비', '교통비', '쇼핑', '구독', '공과금', '급여', '부업'];

const CATEGORY_ICONS: Record<string, string> = {
  '식비': 'restaurant',
  '교통비': 'car',
  '쇼핑': 'cart',
  '구독': 'tv',
  '공과금': 'flash',
  '급여': 'cash',
  '부업': 'laptop',
  '식료품': 'basket',
};

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | '3months'>('month');

  const loadTransactions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setTransactions(DEMO_TRANSACTIONS);
        return;
      }

      // Calculate date range
      const now = new Date();
      let startDate: string | null = null;

      if (dateRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
      } else if (dateRange === '3months') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        startDate = threeMonthsAgo.toISOString().split('T')[0];
      }

      // Build query
      let query = supabase
        .from('journal_entries')
        .select(`
          id,
          date,
          description,
          journal_lines (
            amount,
            accounts (
              id,
              name,
              type
            )
          )
        `)
        .order('date', { ascending: false })
        .limit(100);

      if (startDate) {
        query = query.gte('date', startDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedTransactions: Transaction[] = data.map((entry: any) => {
          const lines = entry.journal_lines || [];
          const debitLine = lines.find((l: any) => l.amount > 0);
          const creditLine = lines.find((l: any) => l.amount < 0);

          let type: 'income' | 'expense' | 'transfer' = 'transfer';
          let amount = Math.abs(debitLine?.amount || 0);
          let category = '기타';
          let account = '';

          if (debitLine?.accounts?.type === 'expense') {
            type = 'expense';
            category = debitLine.accounts.name;
            account = creditLine?.accounts?.name || '';
          } else if (creditLine?.accounts?.type === 'income') {
            type = 'income';
            category = creditLine.accounts.name;
            account = debitLine?.accounts?.name || '';
          } else {
            account = debitLine?.accounts?.name || creditLine?.accounts?.name || '';
          }

          return {
            id: entry.id,
            date: entry.date,
            description: entry.description,
            amount,
            type,
            category,
            account,
          };
        });

        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions(DEMO_TRANSACTIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, [loadTransactions]);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === '전체' || t.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // Calculate totals
  const totals = filteredTransactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else if (t.type === 'expense') acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">거래내역</Text>
        <TouchableOpacity
          className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center"
          onPress={() => router.push('/transactions/new')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 py-2">
        <View className="bg-white rounded-xl px-4 py-3 flex-row items-center shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-gray-900 ml-2"
            placeholder="거래 검색..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View className="px-5 py-2">
        {/* Type Filter */}
        <View className="flex-row space-x-2">
          {[
            { key: 'all', label: '전체' },
            { key: 'income', label: '수입' },
            { key: 'expense', label: '지출' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setTypeFilter(f.key as typeof typeFilter)}
              className={`px-4 py-2 rounded-full ${
                typeFilter === f.key ? 'bg-blue-600' : 'bg-white'
              }`}
            >
              <Text className={typeFilter === f.key ? 'text-white font-medium' : 'text-gray-600'}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Category Filter Button */}
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            className={`px-4 py-2 rounded-full flex-row items-center ${
              categoryFilter !== '전체' ? 'bg-purple-600' : 'bg-white'
            }`}
          >
            <Ionicons
              name="filter"
              size={16}
              color={categoryFilter !== '전체' ? 'white' : '#6B7280'}
            />
            <Text
              className={`ml-1 ${
                categoryFilter !== '전체' ? 'text-white font-medium' : 'text-gray-600'
              }`}
            >
              {categoryFilter}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Range Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row space-x-2">
            {[
              { key: 'week', label: '1주일' },
              { key: 'month', label: '1개월' },
              { key: '3months', label: '3개월' },
              { key: 'all', label: '전체' },
            ].map((d) => (
              <TouchableOpacity
                key={d.key}
                onPress={() => setDateRange(d.key as typeof dateRange)}
                className={`px-3 py-1.5 rounded-lg ${
                  dateRange === d.key ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm ${
                    dateRange === d.key ? 'text-white font-medium' : 'text-gray-600'
                  }`}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Summary */}
      <View className="flex-row mx-5 mt-2 mb-2 space-x-3">
        <View className="flex-1 bg-green-50 p-3 rounded-xl">
          <Text className="text-green-600 text-xs">수입</Text>
          <Text className="text-green-700 font-bold">{formatCurrency(totals.income)}</Text>
        </View>
        <View className="flex-1 bg-red-50 p-3 rounded-xl">
          <Text className="text-red-600 text-xs">지출</Text>
          <Text className="text-red-700 font-bold">{formatCurrency(totals.expense)}</Text>
        </View>
        <View className="flex-1 bg-blue-50 p-3 rounded-xl">
          <Text className="text-blue-600 text-xs">순수입</Text>
          <Text className={`font-bold ${totals.income - totals.expense >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(totals.income - totals.expense)}
          </Text>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedDates.map((date) => (
          <View key={date} className="mb-4">
            <Text className="text-gray-500 text-sm mb-2 font-medium">
              {formatSmartDate(date)}
            </Text>
            <View className="bg-white rounded-xl overflow-hidden shadow-sm">
              {groupedTransactions[date].map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  className={`flex-row items-center p-4 ${
                    index < groupedTransactions[date].length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-100'
                        : transaction.type === 'expense'
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <Ionicons
                      name={
                        transaction.type === 'income'
                          ? 'arrow-down'
                          : transaction.type === 'expense'
                          ? 'arrow-up'
                          : 'swap-horizontal'
                      }
                      size={20}
                      color={
                        transaction.type === 'income'
                          ? '#22C55E'
                          : transaction.type === 'expense'
                          ? '#EF4444'
                          : '#3B82F6'
                      }
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-medium">
                      {transaction.description}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {transaction.account} • {transaction.category}
                    </Text>
                  </View>
                  <Text
                    className={`font-semibold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : transaction.type === 'expense'
                        ? 'text-gray-900'
                        : 'text-blue-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {filteredTransactions.length === 0 && (
          <View className="items-center justify-center py-12">
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4">거래 내역이 없습니다</Text>
            {(searchQuery || typeFilter !== 'all' || categoryFilter !== '전체') && (
              <TouchableOpacity
                className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
                onPress={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setCategoryFilter('전체');
                }}
              >
                <Text className="text-white font-medium">필터 초기화</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Category Filter Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">카테고리 선택</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap">
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`px-4 py-3 m-1 rounded-xl ${
                    categoryFilter === category
                      ? 'bg-purple-600'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => {
                    setCategoryFilter(category);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    className={
                      categoryFilter === category
                        ? 'text-white font-medium'
                        : 'text-gray-700'
                    }
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
