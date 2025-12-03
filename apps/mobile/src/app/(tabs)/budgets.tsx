import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: 'monthly' | 'weekly' | 'yearly';
  color: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  food: 'restaurant',
  transport: 'car',
  shopping: 'cart',
  entertainment: 'game-controller',
  utilities: 'flash',
  health: 'medical',
  education: 'school',
  other: 'ellipsis-horizontal',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#F59E0B',
  transport: '#3B82F6',
  shopping: '#EC4899',
  entertainment: '#8B5CF6',
  utilities: '#10B981',
  health: '#EF4444',
  education: '#6366F1',
  other: '#6B7280',
};

export default function BudgetsScreen() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const loadBudgets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Demo data
        const demoBudgets: Budget[] = [
          { id: '1', name: '식비', amount: 500000, spent: 320000, category: 'food', period: 'monthly', color: CATEGORY_COLORS.food },
          { id: '2', name: '교통비', amount: 150000, spent: 89000, category: 'transport', period: 'monthly', color: CATEGORY_COLORS.transport },
          { id: '3', name: '쇼핑', amount: 200000, spent: 245000, category: 'shopping', period: 'monthly', color: CATEGORY_COLORS.shopping },
          { id: '4', name: '여가/문화', amount: 100000, spent: 45000, category: 'entertainment', period: 'monthly', color: CATEGORY_COLORS.entertainment },
          { id: '5', name: '공과금', amount: 200000, spent: 180000, category: 'utilities', period: 'monthly', color: CATEGORY_COLORS.utilities },
        ];
        setBudgets(demoBudgets);
        setTotalBudget(demoBudgets.reduce((sum, b) => sum + b.amount, 0));
        setTotalSpent(demoBudgets.reduce((sum, b) => sum + b.spent, 0));
        return;
      }

      // Load budgets from Supabase
      const { data: budgetsData, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (budgetsData && budgetsData.length > 0) {
        // Calculate spent amounts for each budget
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const budgetsWithSpent = await Promise.all(
          budgetsData.map(async (budget) => {
            // Get expense account for this category
            const { data: expenseData } = await supabase
              .from('journal_lines')
              .select(`
                amount,
                journal_entries!inner(date),
                accounts!inner(type, name)
              `)
              .eq('accounts.type', 'expense')
              .gte('journal_entries.date', startOfMonth)
              .lte('journal_entries.date', endOfMonth);

            const spent = expenseData?.reduce((sum, line) => sum + Math.abs(line.amount), 0) || 0;

            return {
              id: budget.id,
              name: budget.name,
              amount: budget.amount,
              spent: spent / budgetsData.length, // Simplified distribution
              category: budget.category || 'other',
              period: budget.period || 'monthly',
              color: CATEGORY_COLORS[budget.category] || CATEGORY_COLORS.other,
            };
          })
        );

        setBudgets(budgetsWithSpent);
        setTotalBudget(budgetsWithSpent.reduce((sum, b) => sum + b.amount, 0));
        setTotalSpent(budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0));
      } else {
        setBudgets([]);
        setTotalBudget(0);
        setTotalSpent(0);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBudgets();
  }, [loadBudgets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (spent: number, budget: number) => {
    const ratio = spent / budget;
    if (ratio >= 1) return '#EF4444';
    if (ratio >= 0.8) return '#F59E0B';
    return '#22C55E';
  };

  const getProgressWidth = (spent: number, budget: number) => {
    const ratio = Math.min(spent / budget, 1);
    return `${ratio * 100}%`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remainingBudget = totalBudget - totalSpent;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">예산</Text>
        <TouchableOpacity
          className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center"
          onPress={() => router.push('/budgets/new')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Budget Summary */}
        <View className="mx-5 mt-4 p-5 bg-white rounded-2xl shadow-sm">
          <Text className="text-gray-500 text-sm">이번 달 총 예산</Text>
          <Text className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalBudget)}
          </Text>

          {/* Progress Bar */}
          <View className="mt-4">
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(overallProgress, 100)}%`,
                  backgroundColor: getProgressColor(totalSpent, totalBudget),
                }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-500 text-sm">
                사용: {formatCurrency(totalSpent)}
              </Text>
              <Text className={`text-sm font-medium ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remainingBudget >= 0 ? '남음' : '초과'}: {formatCurrency(Math.abs(remainingBudget))}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row mt-4 pt-4 border-t border-gray-100">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">일 평균 사용</Text>
              <Text className="text-gray-900 font-semibold mt-1">
                {formatCurrency(totalSpent / new Date().getDate())}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">남은 일수 예산</Text>
              <Text className="text-gray-900 font-semibold mt-1">
                {formatCurrency(remainingBudget / (30 - new Date().getDate() + 1))}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">진행률</Text>
              <Text className={`font-semibold mt-1 ${overallProgress > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                {overallProgress.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Budget Categories */}
        <Text className="text-gray-500 text-sm font-medium px-5 mt-6 mb-3">
          카테고리별 예산
        </Text>

        {budgets.length === 0 ? (
          <View className="mx-5 p-8 bg-white rounded-2xl items-center">
            <Ionicons name="pie-chart-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">
              아직 설정된 예산이 없습니다.{'\n'}
              예산을 추가해 지출을 관리해보세요.
            </Text>
            <TouchableOpacity
              className="mt-4 px-6 py-3 bg-blue-600 rounded-xl"
              onPress={() => router.push('/budgets/new')}
            >
              <Text className="text-white font-medium">예산 추가하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-5 space-y-3 pb-8">
            {budgets.map((budget) => {
              const progress = (budget.spent / budget.amount) * 100;
              const isOverBudget = budget.spent > budget.amount;

              return (
                <TouchableOpacity
                  key={budget.id}
                  className="bg-white p-4 rounded-xl shadow-sm"
                  onPress={() => router.push(`/budgets/${budget.id}`)}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${budget.color}20` }}
                    >
                      <Ionicons
                        name={CATEGORY_ICONS[budget.category] as any || 'ellipsis-horizontal'}
                        size={24}
                        color={budget.color}
                      />
                    </View>
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-900 font-semibold">{budget.name}</Text>
                        {isOverBudget && (
                          <View className="bg-red-100 px-2 py-0.5 rounded-full">
                            <Text className="text-red-600 text-xs font-medium">초과</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-baseline mt-0.5">
                        <Text className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatCurrency(budget.spent)}
                        </Text>
                        <Text className="text-gray-400 text-sm ml-1">
                          / {formatCurrency(budget.amount)}
                        </Text>
                      </View>
                    </View>
                    <Text className={`text-sm font-medium ml-2 ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                      {progress.toFixed(0)}%
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: getProgressWidth(budget.spent, budget.amount),
                        backgroundColor: budget.color,
                        opacity: isOverBudget ? 1 : 0.8,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
