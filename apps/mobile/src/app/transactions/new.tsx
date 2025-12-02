import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '@kapital/utils';

interface Account {
  id: string;
  name: string;
  icon: string;
  account_type: string;
}

type TransactionType = 'expense' | 'income' | 'transfer';

// 기본 데모 계정
const defaultAccounts = {
  asset: [
    { id: 'demo-1', name: '현금', icon: '💵', account_type: 'ASSET' },
    { id: 'demo-2', name: '국민은행', icon: '🏦', account_type: 'ASSET' },
  ],
  liability: [
    { id: 'demo-3', name: '신한카드', icon: '💳', account_type: 'LIABILITY' },
  ],
  income: [
    { id: 'demo-4', name: '급여', icon: '💼', account_type: 'INCOME' },
    { id: 'demo-5', name: '부업', icon: '💻', account_type: 'INCOME' },
  ],
  expense: [
    { id: 'demo-6', name: '식비', icon: '🍽️', account_type: 'EXPENSE' },
    { id: 'demo-7', name: '교통비', icon: '🚗', account_type: 'EXPENSE' },
    { id: 'demo-8', name: '쇼핑', icon: '🛍️', account_type: 'EXPENSE' },
  ],
};

export default function NewTransactionScreen() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAccountsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('account_type')
        .order('display_order');

      if (data && data.length > 0) {
        setAccounts({
          asset: data.filter(a => a.account_type === 'ASSET'),
          liability: data.filter(a => a.account_type === 'LIABILITY'),
          income: data.filter(a => a.account_type === 'INCOME'),
          expense: data.filter(a => a.account_type === 'EXPENSE'),
        });
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !description || !fromAccount || !toAccount) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const parsedAmount = parseFloat(amount);
      const today = new Date().toISOString().split('T')[0];

      // 분개장 엔트리 생성
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_date: today,
          description,
          source: 'mobile',
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // 복식부기 거래 라인 생성
      const lines = [
        { journal_entry_id: entry.id, account_id: toAccount.id, amount: parsedAmount },
        { journal_entry_id: entry.id, account_id: fromAccount.id, amount: -parsedAmount },
      ];

      const { error: linesError } = await supabase
        .from('transaction_lines')
        .insert(lines);

      if (linesError) {
        await supabase.from('journal_entries').delete().eq('id', entry.id);
        throw linesError;
      }

      Alert.alert('완료', '거래가 저장되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      Alert.alert('오류', error.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const paymentAccounts = [...accounts.asset, ...accounts.liability];
  const categoryAccounts = type === 'expense' ? accounts.expense : accounts.income;

  const renderAccountPicker = (
    visible: boolean,
    onClose: () => void,
    accountList: Account[],
    onSelect: (account: Account) => void,
    title: string
  ) => {
    if (!visible) return null;

    return (
      <View className="absolute inset-0 bg-black/50 z-50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[70%]">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-primary-600 font-medium">닫기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="p-2">
            {accountList.map((account) => (
              <TouchableOpacity
                key={account.id}
                className="flex-row items-center p-4 border-b border-gray-100"
                onPress={() => {
                  onSelect(account);
                  onClose();
                }}
              >
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-xl">{account.icon}</Text>
                </View>
                <Text className="ml-3 text-base text-gray-900">{account.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  if (accountsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary-600 text-base">취소</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">새 거래</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Text className="text-primary-600 text-base font-medium">저장</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* Transaction Type */}
          <View className="flex-row mx-4 mt-4 bg-gray-100 rounded-xl p-1">
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                className={`flex-1 py-3 rounded-lg ${type === t ? 'bg-white shadow-sm' : ''}`}
                onPress={() => {
                  setType(t);
                  setFromAccount(null);
                  setToAccount(null);
                }}
              >
                <Text
                  className={`text-center font-medium ${
                    type === t ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {t === 'expense' ? '지출' : t === 'income' ? '수입' : '이체'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <View className="mx-4 mt-6">
            <Text className="text-sm text-gray-500 mb-2">금액</Text>
            <View className="flex-row items-center border-b-2 border-primary-600 pb-2">
              <Text className="text-2xl text-gray-400 mr-2">₩</Text>
              <TextInput
                className="flex-1 text-3xl font-bold text-gray-900"
                placeholder="0"
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Description */}
          <View className="mx-4 mt-6">
            <Text className="text-sm text-gray-500 mb-2">내용</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
              placeholder="거래 내용을 입력하세요"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* From Account */}
          <View className="mx-4 mt-6">
            <Text className="text-sm text-gray-500 mb-2">
              {type === 'expense' ? '결제 수단' : type === 'income' ? '입금 계좌' : '출금 계좌'}
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
              onPress={() => setShowFromPicker(true)}
            >
              {fromAccount ? (
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">{fromAccount.icon}</Text>
                  <Text className="text-base text-gray-900">{fromAccount.name}</Text>
                </View>
              ) : (
                <Text className="text-base text-gray-400">선택하세요</Text>
              )}
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
          </View>

          {/* To Account */}
          <View className="mx-4 mt-6">
            <Text className="text-sm text-gray-500 mb-2">
              {type === 'transfer' ? '입금 계좌' : '카테고리'}
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
              onPress={() => setShowToPicker(true)}
            >
              {toAccount ? (
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">{toAccount.icon}</Text>
                  <Text className="text-base text-gray-900">{toAccount.name}</Text>
                </View>
              ) : (
                <Text className="text-base text-gray-400">선택하세요</Text>
              )}
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Amount Buttons */}
          <View className="mx-4 mt-6">
            <Text className="text-sm text-gray-500 mb-2">빠른 입력</Text>
            <View className="flex-row flex-wrap gap-2">
              {[5000, 10000, 30000, 50000, 100000].map((val) => (
                <TouchableOpacity
                  key={val}
                  className="px-4 py-2 bg-gray-100 rounded-full"
                  onPress={() => setAmount(val.toString())}
                >
                  <Text className="text-sm text-gray-700">
                    {formatCurrency(val)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Account Pickers */}
      {renderAccountPicker(
        showFromPicker,
        () => setShowFromPicker(false),
        paymentAccounts,
        setFromAccount,
        type === 'expense' ? '결제 수단 선택' : type === 'income' ? '입금 계좌 선택' : '출금 계좌 선택'
      )}
      {renderAccountPicker(
        showToPicker,
        () => setShowToPicker(false),
        type === 'transfer' ? paymentAccounts : categoryAccounts,
        setToAccount,
        type === 'transfer' ? '입금 계좌 선택' : '카테고리 선택'
      )}
    </SafeAreaView>
  );
}
