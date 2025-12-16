import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '@kapital/utils';

interface Account {
  id: string;
  name: string;
  account_type: string;
  account_subtype: string | null;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

const TYPE_LABELS: Record<string, string> = {
  ASSET: '자산',
  LIABILITY: '부채',
  EQUITY: '자본',
  INCOME: '수입',
  EXPENSE: '지출',
};

export default function AccountDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccount();
  }, [id]);

  const loadAccount = async () => {
    try {
      // Load account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (accountError) throw accountError;
      setAccount(accountData);

      // Load transactions for this account
      const { data: linesData } = await supabase
        .from('transaction_lines')
        .select(`
          id,
          amount,
          journal_entries (
            id,
            entry_date,
            description
          )
        `)
        .eq('account_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (linesData) {
        const txns: Transaction[] = linesData.map((line: any) => ({
          id: line.journal_entries?.id || line.id,
          date: line.journal_entries?.entry_date || '',
          description: line.journal_entries?.description || '',
          amount: Math.abs(line.amount),
          type: line.amount > 0 ? 'debit' : 'credit',
        }));
        setTransactions(txns);

        // Calculate balance
        const total = linesData.reduce((sum: number, line: any) => sum + line.amount, 0);
        setBalance(total);
      }
    } catch (error) {
      console.error('Error loading account:', error);
      // Demo data
      setAccount({
        id: id || '1',
        name: '국민은행',
        account_type: 'ASSET',
        account_subtype: 'checking',
        currency: 'KRW',
        icon: '🏦',
        color: '#FFB800',
        is_active: true,
      });
      setBalance(12500000);
      setTransactions([
        { id: '1', date: '2025-12-03', description: '스타벅스', amount: 6500, type: 'credit' },
        { id: '2', date: '2025-12-02', description: '급여 입금', amount: 4500000, type: 'debit' },
        { id: '3', date: '2025-12-01', description: '월세', amount: 800000, type: 'credit' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    Alert.alert(
      '계정 삭제',
      `"${account.name}" 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('accounts')
                .update({ is_active: false })
                .eq('id', account.id);

              Alert.alert('완료', '계정이 삭제되었습니다.', [
                { text: '확인', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('오류', '계정 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">계정을 찾을 수 없습니다</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-600">돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: account.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Account Info Card */}
        <View className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <View className="flex-row items-center mb-4">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: account.color ? `${account.color}20` : '#E5E7EB' }}
            >
              <Text className="text-3xl">{account.icon || '💳'}</Text>
            </View>
            <View className="ml-4">
              <Text className="text-gray-500 text-sm">
                {TYPE_LABELS[account.account_type]}
              </Text>
              <Text className="text-3xl font-bold text-gray-900">
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>

          <View className="flex-row border-t border-gray-100 pt-4">
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">통화</Text>
              <Text className="text-gray-900 font-medium">{account.currency}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">유형</Text>
              <Text className="text-gray-900 font-medium">
                {account.account_subtype || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">최근 거래</Text>
          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <View className="p-6 items-center">
                <Text className="text-gray-500">거래 내역이 없습니다</Text>
              </View>
            ) : (
              transactions.map((txn, index) => (
                <TouchableOpacity
                  key={txn.id}
                  className={`flex-row items-center p-4 ${
                    index < transactions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onPress={() => router.push(`/transactions/${txn.id}`)}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      txn.type === 'debit' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <Ionicons
                      name={txn.type === 'debit' ? 'arrow-down' : 'arrow-up'}
                      size={18}
                      color={txn.type === 'debit' ? '#10B981' : '#EF4444'}
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-medium">{txn.description}</Text>
                    <Text className="text-gray-500 text-sm">{txn.date}</Text>
                  </View>
                  <Text
                    className={`font-semibold ${
                      txn.type === 'debit' ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {txn.type === 'debit' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
