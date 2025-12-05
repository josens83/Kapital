import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURITY_SETTINGS_KEY = '@kapital_security_settings';

interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  autoLock: boolean;
  autoLockDelay: number; // minutes
}

const DEFAULT_SETTINGS: SecuritySettings = {
  biometricEnabled: false,
  pinEnabled: false,
  autoLock: false,
  autoLockDelay: 1,
};

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    loadSettings();
    checkBiometricSupport();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: SecuritySettings) => {
    try {
      await AsyncStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      setHasBiometric(compatible && enrolled);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('지문');
        }
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const toggleBiometric = async () => {
    if (!settings.biometricEnabled) {
      // Enable - verify first
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '생체 인증 활성화',
        fallbackLabel: '비밀번호 사용',
      });

      if (result.success) {
        saveSettings({ ...settings, biometricEnabled: true });
        Alert.alert('성공', `${biometricType} 인증이 활성화되었습니다.`);
      }
    } else {
      // Disable
      saveSettings({ ...settings, biometricEnabled: false });
    }
  };

  const togglePin = () => {
    if (!settings.pinEnabled) {
      // TODO: Navigate to PIN setup screen
      Alert.alert('준비 중', 'PIN 설정 기능은 준비 중입니다.');
    } else {
      saveSettings({ ...settings, pinEnabled: false });
    }
  };

  const toggleAutoLock = () => {
    saveSettings({ ...settings, autoLock: !settings.autoLock });
  };

  const setAutoLockDelay = (minutes: number) => {
    saveSettings({ ...settings, autoLockDelay: minutes });
  };

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
        <Text className="text-lg font-semibold text-gray-900 ml-4">보안 설정</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Biometric */}
        <View className="mt-4">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            생체 인증
          </Text>
          <View className="bg-white">
            <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                <Ionicons name="finger-print" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-medium">
                  {biometricType || '생체 인증'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {hasBiometric ? '앱 잠금 해제에 사용' : '이 기기에서 지원되지 않음'}
                </Text>
              </View>
              <Switch
                value={settings.biometricEnabled}
                onValueChange={toggleBiometric}
                disabled={!hasBiometric}
                trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                thumbColor={settings.biometricEnabled ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* PIN */}
        <View className="mt-6">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            PIN 잠금
          </Text>
          <View className="bg-white">
            <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                <Ionicons name="keypad" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-medium">PIN 사용</Text>
                <Text className="text-gray-500 text-sm">4자리 숫자로 앱 잠금</Text>
              </View>
              <Switch
                value={settings.pinEnabled}
                onValueChange={togglePin}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.pinEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {settings.pinEnabled && (
              <TouchableOpacity className="flex-row items-center px-4 py-4">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name="refresh" size={20} color="#6B7280" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium">PIN 변경</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Auto Lock */}
        <View className="mt-6">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            자동 잠금
          </Text>
          <View className="bg-white">
            <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="timer" size={20} color="#22C55E" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-medium">자동 잠금</Text>
                <Text className="text-gray-500 text-sm">백그라운드 전환 시 잠금</Text>
              </View>
              <Switch
                value={settings.autoLock}
                onValueChange={toggleAutoLock}
                disabled={!settings.biometricEnabled && !settings.pinEnabled}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={settings.autoLock ? '#22C55E' : '#F3F4F6'}
              />
            </View>

            {settings.autoLock && (
              <View className="px-4 py-4">
                <Text className="text-gray-700 text-sm mb-3">잠금 시간</Text>
                <View className="flex-row space-x-2">
                  {[1, 5, 15, 30].map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      className={`flex-1 py-2 rounded-lg ${
                        settings.autoLockDelay === minutes
                          ? 'bg-green-600'
                          : 'bg-gray-100'
                      }`}
                      onPress={() => setAutoLockDelay(minutes)}
                    >
                      <Text
                        className={`text-center font-medium ${
                          settings.autoLockDelay === minutes
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {minutes}분
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Privacy */}
        <View className="mt-6 mb-8">
          <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
            개인정보
          </Text>
          <View className="bg-white">
            <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                <Ionicons name="eye-off" size={20} color="#EF4444" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-medium">금액 숨기기</Text>
                <Text className="text-gray-500 text-sm">앱 전환 시 금액 가리기</Text>
              </View>
              <Switch
                value={false}
                trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                thumbColor="#F3F4F6"
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center px-4 py-4">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                <Ionicons name="trash" size={20} color="#F97316" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-medium">캐시 데이터 삭제</Text>
                <Text className="text-gray-500 text-sm">로컬 캐시 삭제</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
