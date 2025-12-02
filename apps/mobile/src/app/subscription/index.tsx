import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../../hooks/useSubscription';

const PLANS = {
  free: {
    name: '무료',
    features: [
      '3개 계좌',
      '월 50건 거래',
      '기본 대시보드',
      '30일 데이터 보관',
    ],
  },
  premium: {
    name: '프리미엄',
    features: [
      '무제한 계좌',
      '무제한 거래',
      '모든 재무제표',
      '예산 관리',
      'CSV/PDF 내보내기',
      '2명 가족 공유',
    ],
  },
  premium_plus: {
    name: '프리미엄+',
    features: [
      '프리미엄 모든 기능',
      '은행 자동 연동',
      '투자 자산 추적',
      '5명 가족 공유',
      '우선 지원',
      'API 접근',
    ],
  },
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const {
    isPremium,
    isPremiumPlus,
    activeSubscription,
    offerings,
    loading,
    error,
    purchase,
    restore,
    getPackageInfo,
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'premium_plus'>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const handlePurchase = async () => {
    if (!offerings?.availablePackages) {
      Alert.alert('오류', '구독 상품을 불러올 수 없습니다.');
      return;
    }

    const packageId = `${selectedPlan}_${billingPeriod}`;
    const pkg = offerings.availablePackages.find(
      (p) => p.identifier === packageId || p.identifier.includes(packageId)
    );

    if (!pkg) {
      Alert.alert('오류', '선택한 상품을 찾을 수 없습니다.');
      return;
    }

    const success = await purchase(pkg);
    if (success) {
      Alert.alert('성공', '구독이 완료되었습니다!', [
        { text: '확인', onPress: () => router.back() },
      ]);
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert('성공', '구독이 복원되었습니다!');
    } else {
      Alert.alert('알림', '복원할 구독이 없습니다.');
    }
  };

  const getPackagePrice = (planType: 'premium' | 'premium_plus', period: 'monthly' | 'yearly') => {
    if (!offerings?.availablePackages) return null;

    const packageId = `${planType}_${period}`;
    const pkg = offerings.availablePackages.find(
      (p) => p.identifier === packageId || p.identifier.includes(packageId)
    );

    if (pkg) {
      return getPackageInfo(pkg);
    }
    return null;
  };

  if (loading && !offerings) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">구독 정보 로딩 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">프리미엄 구독</Text>
        <TouchableOpacity onPress={handleRestore}>
          <Text className="text-blue-600 font-medium">복원</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Plan Badge */}
        {activeSubscription !== 'free' && (
          <View className="mx-4 mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 text-green-800 font-medium">
                현재 {PLANS[activeSubscription].name} 플랜 사용 중
              </Text>
            </View>
          </View>
        )}

        {/* Billing Period Toggle */}
        <View className="mx-4 mt-6">
          <View className="flex-row bg-gray-200 rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${
                billingPeriod === 'monthly' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setBillingPeriod('monthly')}
            >
              <Text
                className={`text-center font-medium ${
                  billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                월간 결제
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${
                billingPeriod === 'yearly' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setBillingPeriod('yearly')}
            >
              <View className="items-center">
                <Text
                  className={`font-medium ${
                    billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  연간 결제
                </Text>
                <Text className="text-xs text-green-600 font-medium">최대 30% 할인</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Cards */}
        <View className="px-4 mt-6 space-y-4">
          {/* Premium Plan */}
          <TouchableOpacity
            className={`p-5 rounded-2xl border-2 ${
              selectedPlan === 'premium'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
            onPress={() => setSelectedPlan('premium')}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-xl font-bold text-gray-900">프리미엄</Text>
                <Text className="text-gray-500 mt-1">개인 사용자용</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPlan === 'premium'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedPlan === 'premium' && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </View>

            <View className="mt-4">
              {(() => {
                const priceInfo = getPackagePrice('premium', billingPeriod);
                return (
                  <View className="flex-row items-baseline">
                    <Text className="text-3xl font-bold text-gray-900">
                      {priceInfo?.price || (billingPeriod === 'monthly' ? '₩8,500' : '₩69,000')}
                    </Text>
                    <Text className="text-gray-500 ml-1">
                      /{billingPeriod === 'monthly' ? '월' : '년'}
                    </Text>
                  </View>
                );
              })()}
            </View>

            <View className="mt-4 space-y-2">
              {PLANS.premium.features.map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                  <Text className="ml-2 text-gray-700">{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          {/* Premium Plus Plan */}
          <TouchableOpacity
            className={`p-5 rounded-2xl border-2 relative overflow-hidden ${
              selectedPlan === 'premium_plus'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white'
            }`}
            onPress={() => setSelectedPlan('premium_plus')}
          >
            {/* Popular Badge */}
            <View className="absolute top-0 right-0 bg-purple-500 px-3 py-1 rounded-bl-lg">
              <Text className="text-white text-xs font-bold">인기</Text>
            </View>

            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-xl font-bold text-gray-900">프리미엄+</Text>
                <Text className="text-gray-500 mt-1">가족 및 전문가용</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPlan === 'premium_plus'
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedPlan === 'premium_plus' && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </View>

            <View className="mt-4">
              {(() => {
                const priceInfo = getPackagePrice('premium_plus', billingPeriod);
                return (
                  <View className="flex-row items-baseline">
                    <Text className="text-3xl font-bold text-gray-900">
                      {priceInfo?.price || (billingPeriod === 'monthly' ? '₩12,500' : '₩99,000')}
                    </Text>
                    <Text className="text-gray-500 ml-1">
                      /{billingPeriod === 'monthly' ? '월' : '년'}
                    </Text>
                  </View>
                );
              })()}
            </View>

            <View className="mt-4 space-y-2">
              {PLANS.premium_plus.features.map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                  <Text className="ml-2 text-gray-700">{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mx-4 mt-4 p-3 bg-red-50 rounded-xl">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        {/* Terms */}
        <View className="px-4 mt-6 mb-4">
          <Text className="text-xs text-gray-500 text-center leading-5">
            구독은 확인 시 iTunes 계정으로 청구됩니다. 현재 기간 종료 최소 24시간 전에
            자동 갱신을 해제하지 않으면 구독이 자동으로 갱신됩니다. 구독 관리 및 자동
            갱신 해제는 구매 후 iTunes 계정 설정에서 할 수 있습니다.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`py-4 rounded-xl ${
            selectedPlan === 'premium_plus' ? 'bg-purple-600' : 'bg-blue-600'
          } ${loading ? 'opacity-50' : ''}`}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              {PLANS[selectedPlan].name} 시작하기
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="mt-3 py-2" onPress={() => router.back()}>
          <Text className="text-gray-500 text-center">나중에 하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
