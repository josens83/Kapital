import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface RecurringTransaction {
  id: string;
  name: string;
  template_entry: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
  };
  frequency: string;
  next_occurrence: string;
  is_active: boolean;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: '매일',
  weekly: '매주',
  biweekly: '격주',
  monthly: '매월',
  quarterly: '분기별',
  yearly: '매년',
};

const DEMO_DATA: RecurringTransaction[] = [
  {
    id: '1',
    name: '월급',
    template_entry: { description: '월급', amount: 4500000, type: 'income' },
    frequency: 'monthly',
    next_occurrence: '2025-12-25',
    is_active: true,
  },
  {
    id: '2',
    name: '넷플릭스',
    template_entry: { description: '넷플릭스 구독', amount: 17000, type: 'expense' },
    frequency: 'monthly',
    next_occurrence: '2025-12-15',
    is_active: true,
  },
  {
    id: '3',
    name: '월세',
    template_entry: { description: '월세', amount: 800000, type: 'expense' },
    frequency: 'monthly',
    next_occurrence: '2025-12-01',
    is_active: true,
  },
  {
    id: '4',
    name: '헬스장',
    template_entry: { description: '헬스장 이용료', amount: 90000, type: 'expense' },
    frequency: 'monthly',
    next_occurrence: '2025-12-05',
    is_active: false,
  },
];

export default function RecurringScreen() {
  const router = useRouter();
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecurring = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRecurring(DEMO_DATA);
        return;
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('next_occurrence', { ascending: true });

      if (error) throw error;
      setRecurring(data || []);
    } catch (error) {
      console.error('Error loading recurring:', error);
      setRecurring(DEMO_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecurring();
  }, [loadRecurring]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecurring();
  }, [loadRecurring]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('recurring_transactions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      setRecurring(recurring.map(r =>
        r.id === id ? { ...r, is_active: !currentStatus } : r
      ));
    } catch (error) {
      console.error('Error toggling:', error);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      '반복 거래 삭제',
      `"${name}"을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('recurring_transactions')
                .delete()
                .eq('id', id);

              setRecurring(recurring.filter(r => r.id !== id));
            } catch (error) {
              console.error('Error deleting:', error);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '오늘';
    if (diff === 1) return '내일';
    if (diff < 0) return '지남';
    return `${diff}일 후`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const activeRecurring = recurring.filter(r => r.is_active);
  const inactiveRecurring = recurring.filter(r => !r.is_active);

  const totalMonthlyIncome = activeRecurring
    .filter(r => r.template_entry.type === 'income' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.template_entry.amount, 0);

  const totalMonthlyExpense = activeRecurring
    .filter(r => r.template_entry.type === 'expense' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.template_entry.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">반복 거래</Text>
        <TouchableOpacity
          className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center"
          onPress={() => router.push('/recurring/new')}
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
        {/* Summary */}
        <View className="flex-row mx-5 mt-4 space-x-3">
          <View className="flex-1 bg-green-50 p-4 rounded-xl">
            <Text className="text-green-600 text-sm">월간 수입</Text>
            <Text className="text-green-700 font-bold text-lg mt-1">
              {formatCurrency(totalMonthlyIncome)}
            </Text>
          </View>
          <View className="flex-1 bg-red-50 p-4 rounded-xl">
            <Text className="text-red-600 text-sm">월간 지출</Text>
            <Text className="text-red-700 font-bold text-lg mt-1">
              {formatCurrency(totalMonthlyExpense)}
            </Text>
          </View>
        </View>

        {recurring.length === 0 ? (
          <View className="mx-5 mt-8 p-8 bg-white rounded-2xl items-center">
            <Ionicons name="repeat-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-900 font-medium text-lg mt-4">반복 거래가 없습니다</Text>
            <Text className="text-gray-500 text-center mt-2">
              월급, 구독료, 월세 등{'\n'}정기적인 거래를 추가하세요
            </Text>
            <TouchableOpacity
              className="mt-4 px-6 py-3 bg-blue-600 rounded-xl"
              onPress={() => router.push('/recurring/new')}
            >
              <Text className="text-white font-medium">반복 거래 추가</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Active */}
            {activeRecurring.length > 0 && (
              <View className="mt-6">
                <Text className="text-gray-500 text-sm font-medium px-5 mb-2">
                  활성 ({activeRecurring.length})
                </Text>
                <View className="mx-5 bg-white rounded-xl overflow-hidden">
                  {activeRecurring.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      className={`p-4 ${index < activeRecurring.length - 1 ? 'border-b border-gray-100' : ''}`}
                      onLongPress={() => handleDelete(item.id, item.name)}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-12 h-12 rounded-full items-center justify-center ${
                            item.template_entry.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          <Ionicons
                            name={item.template_entry.type === 'income' ? 'arrow-down' : 'arrow-up'}
                            size={24}
                            color={item.template_entry.type === 'income' ? '#22C55E' : '#EF4444'}
                          />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-gray-900 font-medium">{item.name}</Text>
                          <Text className="text-gray-500 text-sm">
                            {FREQUENCY_LABELS[item.frequency]} • {formatDate(item.next_occurrence)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text
                            className={`font-semibold ${
                              item.template_entry.type === 'income' ? 'text-green-600' : 'text-gray-900'
                            }`}
                          >
                            {item.template_entry.type === 'income' ? '+' : '-'}
                            {formatCurrency(item.template_entry.amount)}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-0.5">
                            {getDaysUntil(item.next_occurrence)}
                          </Text>
                        </View>
                        <Switch
                          value={item.is_active}
                          onValueChange={() => toggleActive(item.id, item.is_active)}
                          trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                          thumbColor={item.is_active ? '#3B82F6' : '#F3F4F6'}
                          className="ml-3"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Inactive */}
            {inactiveRecurring.length > 0 && (
              <View className="mt-6">
                <Text className="text-gray-500 text-sm font-medium px-5 mb-2">
                  비활성 ({inactiveRecurring.length})
                </Text>
                <View className="mx-5 bg-white rounded-xl overflow-hidden opacity-60">
                  {inactiveRecurring.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      className={`p-4 ${index < inactiveRecurring.length - 1 ? 'border-b border-gray-100' : ''}`}
                      onLongPress={() => handleDelete(item.id, item.name)}
                    >
                      <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                          <Ionicons name="pause" size={24} color="#9CA3AF" />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-gray-900 font-medium">{item.name}</Text>
                          <Text className="text-gray-500 text-sm">
                            {FREQUENCY_LABELS[item.frequency]}
                          </Text>
                        </View>
                        <Text className="text-gray-500 font-medium">
                          {formatCurrency(item.template_entry.amount)}
                        </Text>
                        <Switch
                          value={item.is_active}
                          onValueChange={() => toggleActive(item.id, item.is_active)}
                          trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                          thumbColor={item.is_active ? '#3B82F6' : '#F3F4F6'}
                          className="ml-3"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Info */}
        <View className="mx-5 mt-6 mb-8 p-4 bg-blue-50 rounded-xl">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-2">
              <Text className="text-blue-900 font-medium">반복 거래란?</Text>
              <Text className="text-blue-700 text-sm mt-1">
                월급, 월세, 구독료처럼 정기적으로 발생하는 거래입니다. 설정된 날짜에 자동으로 기록됩니다.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
