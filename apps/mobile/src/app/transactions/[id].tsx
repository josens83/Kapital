import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Transaction {
  id: string;
  date: string;
  description: string;
  memo: string | null;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  from_account: {
    id: string;
    name: string;
    type: string;
  } | null;
  to_account: {
    id: string;
    name: string;
    type: string;
  } | null;
  created_at: string;
}

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]);

  const loadTransaction = async () => {
    try {
      setLoading(true);

      // Get the journal entry with its lines
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .select(`
          id,
          date,
          description,
          memo,
          created_at,
          journal_lines (
            id,
            amount,
            account_id,
            accounts (
              id,
              name,
              type
            )
          )
        `)
        .eq('id', id)
        .single();

      if (entryError) throw entryError;

      if (entry && entry.journal_lines) {
        // Determine transaction type and accounts
        const lines = entry.journal_lines as any[];
        const debitLine = lines.find((l) => l.amount > 0);
        const creditLine = lines.find((l) => l.amount < 0);

        let type: 'expense' | 'income' | 'transfer' = 'transfer';
        const toAccount = debitLine?.accounts;
        const fromAccount = creditLine?.accounts;

        if (toAccount?.type === 'expense') {
          type = 'expense';
        } else if (fromAccount?.type === 'income') {
          type = 'income';
        }

        setTransaction({
          id: entry.id,
          date: entry.date,
          description: entry.description,
          memo: entry.memo,
          type,
          amount: Math.abs(debitLine?.amount || 0),
          from_account: fromAccount ? {
            id: fromAccount.id,
            name: fromAccount.name,
            type: fromAccount.type,
          } : null,
          to_account: toAccount ? {
            id: toAccount.id,
            name: toAccount.name,
            type: toAccount.type,
          } : null,
          created_at: entry.created_at,
        });
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      Alert.alert('오류', '거래 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '거래 삭제',
      '이 거래를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);

      // Delete journal lines first (cascade should handle this, but being explicit)
      const { error: linesError } = await supabase
        .from('journal_lines')
        .delete()
        .eq('journal_entry_id', id);

      if (linesError) throw linesError;

      // Delete journal entry
      const { error: entryError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (entryError) throw entryError;

      Alert.alert('완료', '거래가 삭제되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('오류', '거래를 삭제할 수 없습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'expense':
        return { label: '지출', color: 'text-red-600', bgColor: 'bg-red-100', icon: 'arrow-up' };
      case 'income':
        return { label: '수입', color: 'text-green-600', bgColor: 'bg-green-100', icon: 'arrow-down' };
      default:
        return { label: '이체', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: 'swap-horizontal' };
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return 'wallet';
      case 'liability':
        return 'card';
      case 'income':
        return 'trending-up';
      case 'expense':
        return 'cart';
      default:
        return 'folder';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">거래를 찾을 수 없습니다.</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-blue-600 font-medium">돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const typeInfo = getTypeInfo(transaction.type);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">거래 상세</Text>
        <TouchableOpacity onPress={handleDelete} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Amount Section */}
        <View className="bg-white px-4 py-6 items-center">
          <View className={`px-3 py-1 rounded-full ${typeInfo.bgColor} mb-3`}>
            <Text className={`text-sm font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </Text>
          </View>
          <Text className={`text-4xl font-bold ${typeInfo.color}`}>
            {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
            {formatAmount(transaction.amount)}
          </Text>
          <Text className="text-gray-500 mt-2">{transaction.description}</Text>
        </View>

        {/* Details Section */}
        <View className="mt-4 bg-white">
          {/* Date */}
          <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-500 text-sm">날짜</Text>
              <Text className="text-gray-900 font-medium mt-0.5">
                {formatDate(transaction.date)}
              </Text>
            </View>
          </View>

          {/* From Account */}
          {transaction.from_account && (
            <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                <Ionicons
                  name={getAccountIcon(transaction.from_account.type) as any}
                  size={20}
                  color="#EF4444"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-500 text-sm">출금 계좌</Text>
                <Text className="text-gray-900 font-medium mt-0.5">
                  {transaction.from_account.name}
                </Text>
              </View>
            </View>
          )}

          {/* To Account */}
          {transaction.to_account && (
            <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                <Ionicons
                  name={getAccountIcon(transaction.to_account.type) as any}
                  size={20}
                  color="#22C55E"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-500 text-sm">입금 계좌</Text>
                <Text className="text-gray-900 font-medium mt-0.5">
                  {transaction.to_account.name}
                </Text>
              </View>
            </View>
          )}

          {/* Memo */}
          {transaction.memo && (
            <View className="flex-row items-start px-4 py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-500 text-sm">메모</Text>
                <Text className="text-gray-900 mt-0.5">{transaction.memo}</Text>
              </View>
            </View>
          )}

          {/* Created At */}
          <View className="flex-row items-center px-4 py-4">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Ionicons name="time-outline" size={20} color="#6B7280" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-500 text-sm">등록 시간</Text>
              <Text className="text-gray-900 font-medium mt-0.5">
                {formatDate(transaction.created_at)} {formatTime(transaction.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-4 px-4 pb-8">
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => {
              // TODO: Navigate to edit screen
              Alert.alert('준비 중', '거래 수정 기능은 준비 중입니다.');
            }}
          >
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
            <Text className="ml-2 text-blue-600 font-medium">거래 수정</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
