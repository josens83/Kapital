import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  label: string;
  description: string;
  icon: string;
};

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: '라이트 모드',
    description: '밝은 테마를 사용합니다',
    icon: 'sunny',
  },
  {
    value: 'dark',
    label: '다크 모드',
    description: '어두운 테마를 사용합니다',
    icon: 'moon',
  },
  {
    value: 'system',
    label: '시스템 설정',
    description: '기기의 테마 설정을 따릅니다',
    icon: 'phone-portrait',
  },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen
        options={{
          title: '테마 설정',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Theme Options */}
        <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              className={`flex-row items-center p-4 ${
                index < themeOptions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              }`}
              onPress={() => setTheme(option.value)}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center ${
                option.value === 'light' ? 'bg-yellow-100' :
                option.value === 'dark' ? 'bg-gray-800' : 'bg-blue-100'
              }`}>
                <Ionicons
                  name={option.icon as any}
                  size={22}
                  color={
                    option.value === 'light' ? '#F59E0B' :
                    option.value === 'dark' ? '#F9FAFB' : '#3B82F6'
                  }
                />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 dark:text-gray-100 font-medium">
                  {option.label}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {option.description}
                </Text>
              </View>
              {theme === option.value && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Theme Info */}
        <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
          <View className="flex-row items-center">
            <Ionicons
              name={actualTheme === 'dark' ? 'moon' : 'sunny'}
              size={20}
              color="#3B82F6"
            />
            <Text className="text-blue-700 dark:text-blue-300 font-medium ml-2">
              현재 적용된 테마: {actualTheme === 'dark' ? '다크 모드' : '라이트 모드'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-4 px-1">
          테마 설정은 앱의 전체적인 색상을 변경합니다. 시스템 설정을 선택하면
          기기의 다크 모드 설정에 따라 자동으로 변경됩니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
