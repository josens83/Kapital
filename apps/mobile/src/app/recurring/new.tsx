import { useState, useEffect } from 'react';
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

interface Account {
  id: string;
  name: string;
  type: string;
}

const FREQUENCIES = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'biweekly', label: '격주' },
  { value: 'monthly', label: '매월' },
  { value: 'quarterly', label: '분기별' },
  { value: 'yearly', label: '매년' },
];

const DEMO_ACCOUNTS: Account[] = [
  { id: '1', name: '국민은행', type: 'asset' },
  { id: '2', name: '신한카드', type: 'liability' },
  { id: '3', name: '현금', type: 'asset' },
  { id: '4', name: '급여', type: 'income' },
  { id: '5', name: '식비', type: 'expense' },
  { id: '6', name: '주거비', type: 'expense' },
  { id: '7', name: '구독', type: 'expense' },
  { id: '8', name: '교통비', type: 'expense' },
];

export default function NewRecurringScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data } = await supabase
        .from('accounts')
        .select('id, name, type')
        .order('name');

      setAccounts(data || DEMO_ACCOUNTS);
    } catch (error) {
      setAccounts(DEMO_ACCOUNTS);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('오류', '금액을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Calculate next occurrence
      const today = new Date();
      let nextDate = new Date(today.getFullYear(), today.getMonth(), parseInt(dayOfMonth));
      if (nextDate <= today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      const templateEntry = {
        description: name,
        amount: parseFloat(amount),
        type,
        from_account_id: fromAccount,
        to_account_id: toAccount,
      };

      if (user) {
        await supabase.from('recurring_transactions').insert({
          user_id: user.id,
          name,
          template_entry: templateEntry,
          frequency,
          next_occurrence: nextDate.toISOString().split('T')[0],
          is_active: true,
        });
      }

      Alert.alert('성공', '반복 거래가 추가되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating recurring:', error);
      Alert.alert('오류', '저장에 실패했습니다.');
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

  const assetAccounts = accounts.filter(a => a.type === 'asset' || a.type === 'liability');
  const incomeAccounts = accounts.filter(a => a.type === 'income');
  const expenseAccounts = accounts.filter(a => a.type === 'expense');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">반복 거래 추가</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text className="text-blue-600 font-semibold text-lg">저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Type Toggle */}
        <View className="mx-4 mt-4">
          <View className="flex-row bg-gray-200 rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${type === 'expense' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setType('expense')}
            >
              <Text className={`text-center font-medium ${type === 'expense' ? 'text-red-600' : 'text-gray-500'}`}>
                지출
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${type === 'income' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setType('income')}
            >
              <Text className={`text-center font-medium ${type === 'income' ? 'text-green-600' : 'text-gray-500'}`}>
                수입
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name */}
        <View className="mx-4 mt-6">
          <Text className="text-gray-700 font-medium mb-2">이름</Text>
          <TextInput
            className="bg-white px-4 py-4 rounded-xl text-gray-900 text-lg border border-gray-200"
            placeholder="예: 월급, 넷플릭스, 월세"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Amount */}
        <View className="mx-4 mt-4">
          <Text className="text-gray-700 font-medium mb-2">금액</Text>
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
        </View>

        {/* Frequency */}
        <View className="mx-4 mt-4">
          <Text className="text-gray-700 font-medium mb-2">반복 주기</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  className={`px-5 py-3 rounded-xl ${
                    frequency === f.value ? 'bg-blue-600' : 'bg-white border border-gray-200'
                  }`}
                  onPress={() => setFrequency(f.value)}
                >
                  <Text className={frequency === f.value ? 'text-white font-medium' : 'text-gray-700'}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Day of Month (for monthly) */}
        {frequency === 'monthly' && (
          <View className="mx-4 mt-4">
            <Text className="text-gray-700 font-medium mb-2">매월 며칠?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      dayOfMonth === day.toString() ? 'bg-blue-600' : 'bg-white border border-gray-200'
                    }`}
                    onPress={() => setDayOfMonth(day.toString())}
                  >
                    <Text className={dayOfMonth === day.toString() ? 'text-white font-bold' : 'text-gray-700'}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Account Selection */}
        <View className="mx-4 mt-6">
          <Text className="text-gray-700 font-medium mb-2">
            {type === 'expense' ? '출금 계좌' : '입금 계좌'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {assetAccounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  className={`px-4 py-3 rounded-xl ${
                    (type === 'expense' ? fromAccount : toAccount) === acc.id
                      ? 'bg-blue-600'
                      : 'bg-white border border-gray-200'
                  }`}
                  onPress={() => type === 'expense' ? setFromAccount(acc.id) : setToAccount(acc.id)}
                >
                  <Text
                    className={
                      (type === 'expense' ? fromAccount : toAccount) === acc.id
                        ? 'text-white font-medium'
                        : 'text-gray-700'
                    }
                  >
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mx-4 mt-4 mb-8">
          <Text className="text-gray-700 font-medium mb-2">
            {type === 'expense' ? '카테고리' : '수입원'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {(type === 'expense' ? expenseAccounts : incomeAccounts).map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  className={`px-4 py-3 rounded-xl ${
                    (type === 'expense' ? toAccount : fromAccount) === acc.id
                      ? 'bg-blue-600'
                      : 'bg-white border border-gray-200'
                  }`}
                  onPress={() => type === 'expense' ? setToAccount(acc.id) : setFromAccount(acc.id)}
                >
                  <Text
                    className={
                      (type === 'expense' ? toAccount : fromAccount) === acc.id
                        ? 'text-white font-medium'
                        : 'text-gray-700'
                    }
                  >
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
