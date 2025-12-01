import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (!name) {
          Alert.alert('오류', '이름을 입력해주세요.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        Alert.alert('성공', '이메일을 확인하여 회원가입을 완료해주세요.');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo */}
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-primary-600">Kapital</Text>
            <Text className="text-gray-500 mt-2">복식부기 기반 재무관리</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {!isLogin && (
              <View>
                <Text className="text-gray-700 font-medium mb-2">이름</Text>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="홍길동"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View>
              <Text className="text-gray-700 font-medium mb-2">이메일</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">비밀번호</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className={`bg-primary-600 rounded-xl py-4 mt-4 ${loading ? 'opacity-70' : ''}`}
            >
              <Text className="text-white font-semibold text-center text-lg">
                {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500">또는</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Login */}
          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3">
              <Text className="text-gray-700 font-medium">Google로 계속하기</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center bg-[#FEE500] rounded-xl py-3">
              <Text className="text-black font-medium">카카오로 계속하기</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-primary-600 font-semibold ml-2">
                {isLogin ? '회원가입' : '로그인'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
