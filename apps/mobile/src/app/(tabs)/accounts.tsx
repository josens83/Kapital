import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@kapital/utils';

// 데모 데이터
const accounts = {
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

const totalAssets = accounts.assets.reduce((sum, a) => sum + a.balance, 0);
const totalLiabilities = Math.abs(accounts.liabilities.reduce((sum, a) => sum + a.balance, 0));
const netWorth = totalAssets - totalLiabilities;

export default function AccountsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">계정 관리</Text>
      </View>

      <ScrollView className="flex-1 px-5">
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
              <Text className="text-primary-600 text-xl font-bold">
                {formatCurrency(netWorth)}
              </Text>
            </View>
          </View>
        </View>

        {/* Assets */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">자산</Text>
            <TouchableOpacity>
              <Text className="text-primary-600 text-sm">+ 추가</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl overflow-hidden shadow-sm">
            {accounts.assets.map((account, index) => (
              <TouchableOpacity
                key={account.id}
                className={`flex-row items-center p-4 ${
                  index < accounts.assets.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                  <Text className="text-lg">{account.icon}</Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium">{account.name}</Text>
                </View>
                <Text className="text-gray-900 font-semibold">
                  {formatCurrency(account.balance)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Liabilities */}
        <View className="mt-6 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">부채</Text>
            <TouchableOpacity>
              <Text className="text-primary-600 text-sm">+ 추가</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl overflow-hidden shadow-sm">
            {accounts.liabilities.map((account, index) => (
              <TouchableOpacity
                key={account.id}
                className={`flex-row items-center p-4 ${
                  index < accounts.liabilities.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                  <Text className="text-lg">{account.icon}</Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium">{account.name}</Text>
                </View>
                <Text className="text-red-500 font-semibold">
                  {formatCurrency(Math.abs(account.balance))}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
