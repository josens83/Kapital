import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
  weeklyReport: boolean;
  budgetAlerts: boolean;
  transactionAlerts: boolean;
  marketingEmails: boolean;
}

const STORAGE_KEY = '@kapital_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyReminder: true,
  dailyReminderTime: '21:00',
  weeklyReport: true,
  budgetAlerts: true,
  transactionAlerts: true,
  marketingEmails: false,
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      Alert.alert(
        '알림 권한 필요',
        '알림을 받으려면 설정에서 알림 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '설정으로 이동',
            onPress: () => {
              // Open app settings
              if (Platform.OS === 'ios') {
                // Linking.openURL('app-settings:');
              }
            },
          },
        ]
      );
    }
  };

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (key === 'enabled' && value && !hasPermission) {
      await requestPermissions();
      if (!hasPermission) return;
    }

    const newSettings = { ...settings, [key]: value };

    // If main toggle is off, disable all notifications
    if (key === 'enabled' && !value) {
      newSettings.dailyReminder = false;
      newSettings.weeklyReport = false;
      newSettings.budgetAlerts = false;
      newSettings.transactionAlerts = false;
    }

    await saveSettings(newSettings);
  };

  const NotificationItem = ({
    icon,
    title,
    description,
    settingKey,
    disabled = false,
  }: {
    icon: string;
    title: string;
    description: string;
    settingKey: keyof NotificationSettings;
    disabled?: boolean;
  }) => (
    <View
      className={`flex-row items-center px-4 py-4 bg-white border-b border-gray-100 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
        <Ionicons name={icon as any} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-gray-900 font-medium">{title}</Text>
        <Text className="text-gray-500 text-sm mt-0.5">{description}</Text>
      </View>
      <Switch
        value={settings[settingKey] as boolean}
        onValueChange={(value) => handleToggle(settingKey, value)}
        disabled={disabled || (settingKey !== 'enabled' && !settings.enabled)}
        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
        thumbColor={settings[settingKey] ? '#3B82F6' : '#F3F4F6'}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">로딩 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 ml-4">알림 설정</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Permission Warning */}
        {!hasPermission && (
          <TouchableOpacity
            className="mx-4 mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
            onPress={requestPermissions}
          >
            <View className="flex-row items-center">
              <Ionicons name="warning" size={24} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-yellow-800 font-medium">알림 권한 필요</Text>
                <Text className="text-yellow-700 text-sm mt-1">
                  탭하여 알림 권한을 허용해주세요
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
            </View>
          </TouchableOpacity>
        )}

        {/* Main Toggle */}
        <View className="mt-4">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            일반
          </Text>
          <NotificationItem
            icon="notifications"
            title="푸시 알림"
            description="모든 푸시 알림 활성화"
            settingKey="enabled"
          />
        </View>

        {/* Reminder Notifications */}
        <View className="mt-6">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            리마인더
          </Text>
          <NotificationItem
            icon="alarm"
            title="일일 입력 리마인더"
            description="매일 저녁 오늘의 지출을 기록하도록 알림"
            settingKey="dailyReminder"
            disabled={!settings.enabled}
          />
          <NotificationItem
            icon="bar-chart"
            title="주간 리포트"
            description="매주 일요일 한 주 재무 요약 알림"
            settingKey="weeklyReport"
            disabled={!settings.enabled}
          />
        </View>

        {/* Alert Notifications */}
        <View className="mt-6">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            알림
          </Text>
          <NotificationItem
            icon="pie-chart"
            title="예산 알림"
            description="예산 초과 시 알림"
            settingKey="budgetAlerts"
            disabled={!settings.enabled}
          />
          <NotificationItem
            icon="swap-horizontal"
            title="거래 알림"
            description="은행 연동 거래 발생 시 알림"
            settingKey="transactionAlerts"
            disabled={!settings.enabled}
          />
        </View>

        {/* Marketing */}
        <View className="mt-6 mb-8">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            마케팅
          </Text>
          <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
              <Ionicons name="mail" size={20} color="#8B5CF6" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-medium">마케팅 이메일</Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                새로운 기능, 팁, 프로모션 정보
              </Text>
            </View>
            <Switch
              value={settings.marketingEmails}
              onValueChange={(value) => handleToggle('marketingEmails', value)}
              trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
              thumbColor={settings.marketingEmails ? '#8B5CF6' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Info */}
        <View className="px-4 pb-8">
          <Text className="text-xs text-gray-500 text-center leading-5">
            알림 설정은 이 기기에만 적용됩니다. 다른 기기에서는 별도로
            설정해야 합니다. 시스템 설정에서 알림을 완전히 차단할 수 있습니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
