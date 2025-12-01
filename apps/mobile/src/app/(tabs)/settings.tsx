import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
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
            <View className="w-14 h-14 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-900 font-semibold text-lg">사용자</Text>
              <Text className="text-gray-500">user@example.com</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        <View className="bg-white rounded-xl mt-4 shadow-sm overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center">
              <Text className="text-lg">⭐</Text>
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-medium">구독 관리</Text>
              <Text className="text-gray-500 text-sm">현재: 무료</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* General Settings */}
        <Text className="text-gray-500 text-sm mt-6 mb-2 px-1">일반</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SettingsItem icon="🌐" label="언어" value="한국어" />
          <SettingsItem icon="💱" label="기본 통화" value="KRW" />
          <SettingsItem icon="🔔" label="알림 설정" />
          <SettingsItem icon="🔒" label="보안" />
          <SettingsItem icon="☁️" label="데이터 백업" />
        </View>

        {/* Support */}
        <Text className="text-gray-500 text-sm mt-6 mb-2 px-1">지원</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SettingsItem icon="❓" label="도움말" />
          <SettingsItem icon="💬" label="문의하기" />
          <SettingsItem icon="📝" label="피드백 보내기" />
          <SettingsItem icon="📄" label="이용약관" />
          <SettingsItem icon="🔐" label="개인정보처리방침" />
        </View>

        {/* App Info */}
        <Text className="text-gray-500 text-sm mt-6 mb-2 px-1">앱 정보</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SettingsItem icon="ℹ️" label="버전" value="1.0.0" />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-white rounded-xl mt-6 mb-8 p-4 shadow-sm"
        >
          <Text className="text-red-500 font-medium text-center">로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string;
}) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 last:border-b-0">
      <Text className="text-lg mr-3">{icon}</Text>
      <Text className="flex-1 text-gray-900">{label}</Text>
      {value && <Text className="text-gray-500 mr-2">{value}</Text>}
      <Text className="text-gray-400">›</Text>
    </TouchableOpacity>
  );
}
