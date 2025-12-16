import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = '@kapital_pin';
const SECURITY_SETTINGS_KEY = '@kapital_security_settings';
const PIN_LENGTH = 4;

type Mode = 'setup' | 'confirm' | 'change' | 'verify';

export default function PINScreen() {
  const router = useRouter();
  const { mode: initialMode = 'setup' } = useLocalSearchParams<{ mode: string }>();
  const [mode, setMode] = useState<Mode>(initialMode as Mode);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus the hidden input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [mode]);

  const shake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePinChange = async (value: string) => {
    if (value.length > PIN_LENGTH) return;
    setPin(value);
    setError('');

    if (value.length === PIN_LENGTH) {
      // Process PIN when 4 digits are entered
      if (mode === 'setup') {
        // Move to confirm step
        setFirstPin(value);
        setMode('confirm');
        setPin('');
      } else if (mode === 'confirm') {
        // Verify confirmation matches
        if (value === firstPin) {
          await savePin(value);
        } else {
          shake();
          setError('PIN이 일치하지 않습니다');
          setPin('');
        }
      } else if (mode === 'verify') {
        const stored = await AsyncStorage.getItem(PIN_KEY);
        if (value === stored) {
          setSuccess(true);
          setTimeout(() => router.back(), 500);
        } else {
          shake();
          setError('PIN이 올바르지 않습니다');
          setPin('');
        }
      } else if (mode === 'change') {
        const stored = await AsyncStorage.getItem(PIN_KEY);
        if (value === stored) {
          setMode('setup');
          setPin('');
        } else {
          shake();
          setError('현재 PIN이 올바르지 않습니다');
          setPin('');
        }
      }
    }
  };

  const savePin = async (pinValue: string) => {
    try {
      await AsyncStorage.setItem(PIN_KEY, pinValue);

      // Update security settings
      const settingsStr = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      const settings = settingsStr ? JSON.parse(settingsStr) : {};
      await AsyncStorage.setItem(
        SECURITY_SETTINGS_KEY,
        JSON.stringify({ ...settings, pinEnabled: true })
      );

      setSuccess(true);
      setTimeout(() => router.back(), 800);
    } catch (error) {
      console.error('Error saving PIN:', error);
      setError('PIN 저장에 실패했습니다');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'setup':
        return '새 PIN 입력';
      case 'confirm':
        return 'PIN 확인';
      case 'change':
        return '현재 PIN 입력';
      case 'verify':
        return 'PIN 입력';
      default:
        return 'PIN 입력';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'setup':
        return '앱 잠금에 사용할 4자리 PIN을 입력하세요';
      case 'confirm':
        return '확인을 위해 PIN을 다시 입력하세요';
      case 'change':
        return '변경하려면 현재 PIN을 입력하세요';
      case 'verify':
        return '잠금 해제를 위해 PIN을 입력하세요';
      default:
        return '';
    }
  };

  const renderDots = () => {
    return (
      <Animated.View
        className="flex-row justify-center space-x-4"
        style={{ transform: [{ translateX: shakeAnimation }] }}
      >
        {[...Array(PIN_LENGTH)].map((_, index) => (
          <View
            key={index}
            className={`w-4 h-4 rounded-full ${
              index < pin.length
                ? success
                  ? 'bg-green-500'
                  : 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </Animated.View>
    );
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      handlePinChange(pin + num);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-8 pt-8">
        {/* Lock Icon */}
        <View className="items-center mb-8">
          <View
            className={`w-20 h-20 rounded-full items-center justify-center ${
              success ? 'bg-green-100' : 'bg-blue-100'
            }`}
          >
            <Ionicons
              name={success ? 'checkmark' : 'lock-closed'}
              size={40}
              color={success ? '#22C55E' : '#3B82F6'}
            />
          </View>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          {success ? 'PIN 설정 완료' : getTitle()}
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          {success ? 'PIN이 성공적으로 설정되었습니다' : getSubtitle()}
        </Text>

        {/* PIN Dots */}
        {renderDots()}

        {/* Error Message */}
        {error ? (
          <Text className="text-red-500 text-center mt-4">{error}</Text>
        ) : (
          <View className="h-6 mt-4" />
        )}

        {/* Hidden Input for Keyboard */}
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={handlePinChange}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
          className="absolute opacity-0"
          autoFocus
        />

        {/* Number Pad */}
        <View className="flex-1 justify-end pb-8">
          <View className="space-y-4">
            {/* Row 1 */}
            <View className="flex-row justify-center space-x-8">
              {['1', '2', '3'].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleKeyPress(num)}
                  className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center"
                  disabled={success}
                >
                  <Text className="text-2xl font-semibold text-gray-900">{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 2 */}
            <View className="flex-row justify-center space-x-8">
              {['4', '5', '6'].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleKeyPress(num)}
                  className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center"
                  disabled={success}
                >
                  <Text className="text-2xl font-semibold text-gray-900">{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 3 */}
            <View className="flex-row justify-center space-x-8">
              {['7', '8', '9'].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleKeyPress(num)}
                  className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center"
                  disabled={success}
                >
                  <Text className="text-2xl font-semibold text-gray-900">{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 4 */}
            <View className="flex-row justify-center space-x-8">
              <View className="w-20 h-20" />
              <TouchableOpacity
                onPress={() => handleKeyPress('0')}
                className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center"
                disabled={success}
              >
                <Text className="text-2xl font-semibold text-gray-900">0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="w-20 h-20 rounded-full items-center justify-center"
                disabled={success}
              >
                <Ionicons name="backspace-outline" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
