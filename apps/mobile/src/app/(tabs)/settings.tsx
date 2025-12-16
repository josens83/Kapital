import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '../../hooks/useSubscription';

export default function SettingsScreen() {
  const router = useRouter();
  const { activeSubscription, isPremium, isPremiumPlus } = useSubscription();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const getSubscriptionLabel = () => {
    if (isPremiumPlus) return '프리미엄+';
    if (isPremium) return '프리미엄';
    return '무료';
  };

  const getSubscriptionColor = () => {
    if (isPremiumPlus) return 'bg-purple-100';
    if (isPremium) return 'bg-blue-100';
    return 'bg-yellow-100';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">설정</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Profile */}
        <View className="bg-white rounded-xl p-4 mt-4 shadow-sm">
          <TouchableOpacity className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center">
              <Ionicons name="person" size={28} color="#3B82F6" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-900 font-semibold text-lg">
                {user?.email?.split('@')[0] || '사용자'}
              </Text>
              <Text className="text-gray-500">{user?.email || 'user@example.com'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        <View className="bg-white rounded-xl mt-4 shadow-sm overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() => router.push('/subscription')}
          >
            <View className={`w-10 h-10 rounded-full ${getSubscriptionColor()} items-center justify-center`}>
              <Ionicons name="star" size={20} color={isPremiumPlus ? '#8B5CF6' : isPremium ? '#3B82F6' : '#F59E0B'} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-medium">구독 관리</Text>
              <Text className="text-gray-500 text-sm">현재: {getSubscriptionLabel()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* General Settings */}
        <Text className="text-gray-500 text-sm mt-6 mb-2 px-1">일반</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SettingsItem icon="globe-outline" label="언어" value="한국어" />
          <SettingsItem icon="cash-outline" label="기본 통화" value="KRW" />
          <SettingsItem
            icon="color-palette-outline"
            label="테마 설정"
            onPress={() => router.push('/settings/appearance')}
          />
          <SettingsItem
            icon="notifications-outline"
            label="알림 설정"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon="lock-closed-outline"
            label="보안"
            onPress={() => router.push('/settings/security')}
          />
          <SettingsItem
            icon="download-outline"
            label="데이터 내보내기"
            onPress={() => router.push('/settings/export')}
          />
        </View>

        {/* Support */}
        <Text className="text-gray-500 text-sm mt-6 mb-2 px-1">지원</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SettingsItem icon="help-circle-outline" label="도움말" />
          <SettingsItem icon="chatbubble-outline" label="문의하기" />
          <SettingsItem icon="create-outline" label="피드백 보내기" />
          <SettingsItem icon="document-text-outline" label="이용약관" />
          <SettingsItem icon="shield-checkmark-outline" label="개인정보처리방침" />
        </View>

        {/* App Info */}
        <Text className="text-gray-500 text-sm mt-6 mb-2 px-1">앱 정보</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SettingsItem icon="information-circle-outline" label="버전" value="1.0.0" />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-white rounded-xl mt-6 mb-8 p-4 shadow-sm flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-2">로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100 last:border-b-0"
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={22} color="#6B7280" />
      <Text className="flex-1 text-gray-900 ml-3">{label}</Text>
      {value && <Text className="text-gray-500 mr-2">{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
