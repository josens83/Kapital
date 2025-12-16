import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@kapital/utils';
import { supabase } from '../../lib/supabase';

interface Account {
  id: string;
  name: string;
  account_type: string;
  account_subtype: string | null;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  balance?: number;
}

// 데모 데이터 (폴백용)
const demoData = {
  assets: [
    { id: '1', name: '현금', balance: 150000, icon: '💵' },
    { id: '2', name: '국민은행', balance: 12500000, icon: '🏦' },
    { id: '3', name: '신한은행', balance: 8000000, icon: '🏦' },
    { id: '4', name: '주식', balance: 5000000, icon: '📈' },
  ],
  liabilities: [
    { id: '5', name: '신한카드', balance: -1200000, icon: '💳' },
    { id: '6', name: '삼성카드', balance: -500000, icon: '💳' },
  ],
};

export default function AccountsScreen() {
  const router = useRouter();
  const [assets, setAssets] = useState<Account[]>([]);
  const [liabilities, setLiabilities] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // 로그인 안됨 - 데모 데이터 사용
        setAssets(demoData.assets.map(a => ({ ...a, account_type: 'ASSET', currency: 'KRW', is_active: true, account_subtype: null, color: null })));
        setLiabilities(demoData.liabilities.map(a => ({ ...a, account_type: 'LIABILITY', currency: 'KRW', is_active: true, account_subtype: null, color: null })));
        return;
      }

      // 계정 목록 조회
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (accountsError) throw accountsError;

      // 각 계정의 잔액 계산
      const { data: lines } = await supabase
        .from('transaction_lines')
        .select(`
          account_id,
          amount,
          journal_entries!inner(user_id, is_voided)
        `)
        .eq('journal_entries.user_id', user.id)
        .eq('journal_entries.is_voided', false);

      const balances = new Map<string, number>();
      lines?.forEach((line: any) => {
        const current = balances.get(line.account_id) || 0;
        balances.set(line.account_id, current + parseFloat(line.amount || '0'));
      });

      const accountsWithBalance = (accounts || []).map((account: Account) => ({
        ...account,
        balance: balances.get(account.id) || 0,
      }));

      const assetAccounts = accountsWithBalance.filter(a => a.account_type === 'ASSET');
      const liabilityAccounts = accountsWithBalance.filter(a => a.account_type === 'LIABILITY');

      setAssets(assetAccounts);
      setLiabilities(liabilityAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
      // 에러 시 데모 데이터 사용
      setAssets(demoData.assets.map(a => ({ ...a, account_type: 'ASSET', currency: 'KRW', is_active: true, account_subtype: null, color: null })));
      setLiabilities(demoData.liabilities.map(a => ({ ...a, account_type: 'LIABILITY', currency: 'KRW', is_active: true, account_subtype: null, color: null })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAccounts();
  }, [loadAccounts]);

  const totalAssets = assets.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalLiabilities = Math.abs(liabilities.reduce((sum, a) => sum + (a.balance || 0), 0));
  const netWorth = totalAssets - totalLiabilities;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">계정 관리</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary */}
        <View className="bg-white rounded-xl p-5 mt-4 shadow-sm">
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-gray-500 text-sm">총 자산</Text>
              <Text className="text-emerald-500 text-xl font-bold">
                {formatCurrency(totalAssets)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 text-sm">총 부채</Text>
              <Text className="text-red-500 text-xl font-bold">
                {formatCurrency(totalLiabilities)}
              </Text>
            </View>
          </View>
          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row justify-between">
              <Text className="text-gray-900 font-semibold">순자산</Text>
              <Text className="text-blue-600 text-xl font-bold">
                {formatCurrency(netWorth)}
              </Text>
            </View>
          </View>
        </View>

        {/* Assets */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">자산</Text>
            <TouchableOpacity onPress={() => router.push('/accounts/new?type=ASSET')}>
              <Text className="text-blue-600 text-sm">+ 추가</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl overflow-hidden shadow-sm">
            {assets.length === 0 ? (
              <View className="p-6 items-center">
                <Ionicons name="wallet-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">등록된 자산이 없습니다</Text>
                <TouchableOpacity
                  onPress={() => router.push('/accounts/new?type=ASSET')}
                  className="mt-2"
                >
                  <Text className="text-blue-600">자산 추가하기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              assets.map((account, index) => (
                <TouchableOpacity
                  key={account.id}
                  className={`flex-row items-center p-4 ${
                    index < assets.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onPress={() => router.push(`/accounts/${account.id}`)}
                >
                  <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                    <Text className="text-lg">{account.icon || '💰'}</Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-medium">{account.name}</Text>
                    {account.account_subtype && (
                      <Text className="text-gray-500 text-sm">{account.account_subtype}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-gray-900 font-semibold mr-2">
                      {formatCurrency(account.balance || 0)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Liabilities */}
        <View className="mt-6 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">부채</Text>
            <TouchableOpacity onPress={() => router.push('/accounts/new?type=LIABILITY')}>
              <Text className="text-blue-600 text-sm">+ 추가</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl overflow-hidden shadow-sm">
            {liabilities.length === 0 ? (
              <View className="p-6 items-center">
                <Ionicons name="card-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">등록된 부채가 없습니다</Text>
                <TouchableOpacity
                  onPress={() => router.push('/accounts/new?type=LIABILITY')}
                  className="mt-2"
                >
                  <Text className="text-blue-600">부채 추가하기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              liabilities.map((account, index) => (
                <TouchableOpacity
                  key={account.id}
                  className={`flex-row items-center p-4 ${
                    index < liabilities.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onPress={() => router.push(`/accounts/${account.id}`)}
                >
                  <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                    <Text className="text-lg">{account.icon || '💳'}</Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-medium">{account.name}</Text>
                    {account.account_subtype && (
                      <Text className="text-gray-500 text-sm">{account.account_subtype}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-red-500 font-semibold mr-2">
                      {formatCurrency(Math.abs(account.balance || 0))}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
