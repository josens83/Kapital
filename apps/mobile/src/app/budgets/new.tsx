import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  { id: 'food', name: '식비', icon: 'restaurant', color: '#F59E0B' },
  { id: 'transport', name: '교통', icon: 'car', color: '#3B82F6' },
  { id: 'shopping', name: '쇼핑', icon: 'cart', color: '#EC4899' },
  { id: 'entertainment', name: '여가/문화', icon: 'game-controller', color: '#8B5CF6' },
  { id: 'utilities', name: '공과금', icon: 'flash', color: '#10B981' },
  { id: 'health', name: '의료/건강', icon: 'medical', color: '#EF4444' },
  { id: 'education', name: '교육', icon: 'school', color: '#6366F1' },
  { id: 'housing', name: '주거', icon: 'home', color: '#14B8A6' },
  { id: 'insurance', name: '보험', icon: 'shield-checkmark', color: '#64748B' },
  { id: 'savings', name: '저축', icon: 'wallet', color: '#22C55E' },
  { id: 'other', name: '기타', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

const QUICK_AMOUNTS = [100000, 200000, 300000, 500000, 1000000];

export default function NewBudgetScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '예산 이름을 입력해주세요.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('오류', '예산 금액을 입력해주세요.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('오류', '카테고리를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('성공', '예산이 추가되었습니다. (데모 모드)', [
          { text: '확인', onPress: () => router.back() },
        ]);
        return;
      }

      const { error } = await supabase.from('budgets').insert({
        user_id: user.id,
        name: name.trim(),
        amount: parseFloat(amount),
        category: selectedCategory,
        period,
      });

      if (error) throw error;

      Alert.alert('성공', '예산이 추가되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating budget:', error);
      Alert.alert('오류', '예산 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('ko-KR').format(parseInt(num));
  };

  const handleAmountChange = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    setAmount(num);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">예산 추가</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text className="text-blue-600 font-semibold text-lg">저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Budget Name */}
        <View className="px-4 pt-6">
          <Text className="text-gray-700 font-medium mb-2">예산 이름</Text>
          <TextInput
            className="bg-white px-4 py-4 rounded-xl text-gray-900 text-lg border border-gray-200"
            placeholder="예: 이번 달 식비"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Budget Amount */}
        <View className="px-4 pt-6">
          <Text className="text-gray-700 font-medium mb-2">예산 금액</Text>
          <View className="bg-white px-4 py-4 rounded-xl border border-gray-200 flex-row items-center">
            <Text className="text-gray-500 text-lg mr-2">₩</Text>
            <TextInput
              className="flex-1 text-gray-900 text-2xl font-semibold"
              placeholder="0"
              value={formatAmount(amount)}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Quick Amount Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row space-x-2">
              {QUICK_AMOUNTS.map((value) => (
                <TouchableOpacity
                  key={value}
                  className={`px-4 py-2 rounded-full border ${
                    amount === value.toString()
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => handleQuickAmount(value)}
                >
                  <Text
                    className={`font-medium ${
                      amount === value.toString() ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {(value / 10000).toFixed(0)}만
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Period Selection */}
        <View className="px-4 pt-6">
          <Text className="text-gray-700 font-medium mb-2">예산 기간</Text>
          <View className="flex-row bg-gray-200 rounded-xl p-1">
            {[
              { value: 'weekly', label: '주간' },
              { value: 'monthly', label: '월간' },
              { value: 'yearly', label: '연간' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                className={`flex-1 py-3 rounded-lg ${
                  period === item.value ? 'bg-white shadow-sm' : ''
                }`}
                onPress={() => setPeriod(item.value as typeof period)}
              >
                <Text
                  className={`text-center font-medium ${
                    period === item.value ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Selection */}
        <View className="px-4 pt-6 pb-8">
          <Text className="text-gray-700 font-medium mb-3">카테고리</Text>
          <View className="flex-row flex-wrap">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`w-1/3 p-2`}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View
                  className={`items-center py-4 rounded-xl border-2 ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={category.color}
                    />
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category.id
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
