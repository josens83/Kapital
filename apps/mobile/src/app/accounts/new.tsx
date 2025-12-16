import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: '자산', color: '#10B981' },
  { value: 'LIABILITY', label: '부채', color: '#EF4444' },
];

const ASSET_SUBTYPES = [
  { value: 'cash', label: '현금', icon: '💵' },
  { value: 'bank', label: '은행 계좌', icon: '🏦' },
  { value: 'savings', label: '예금', icon: '💰' },
  { value: 'investment', label: '투자', icon: '📈' },
  { value: 'crypto', label: '암호화폐', icon: '₿' },
];

const LIABILITY_SUBTYPES = [
  { value: 'credit_card', label: '신용카드', icon: '💳' },
  { value: 'loan', label: '대출', icon: '🏦' },
  { value: 'mortgage', label: '주택담보대출', icon: '🏠' },
];

const COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#6B7280',
];

export default function NewAccountScreen() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'ASSET' | 'LIABILITY'>('ASSET');
  const [subtype, setSubtype] = useState('');
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const subtypes = accountType === 'ASSET' ? ASSET_SUBTYPES : LIABILITY_SUBTYPES;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '계정 이름을 입력해주세요.');
      return;
    }

    if (!subtype) {
      Alert.alert('오류', '계정 종류를 선택해주세요.');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const selectedSubtype = subtypes.find(s => s.value === subtype);
      const icon = selectedSubtype?.icon || '💳';

      // Create account
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: name.trim(),
          account_type: accountType,
          account_subtype: subtype,
          currency: 'KRW',
          icon,
          color: selectedColor,
          is_active: true,
        })
        .select()
        .single();

      if (accountError) throw accountError;

      // Create initial balance if provided
      const balance = parseFloat(initialBalance) || 0;
      if (balance !== 0 && account) {
        // Get or create opening balance equity account
        let { data: equityAccount } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', '기초잔액')
          .single();

        let equityAccountId = equityAccount?.id;

        if (!equityAccountId) {
          const { data: newEquity } = await supabase
            .from('accounts')
            .insert({
              user_id: user.id,
              name: '기초잔액',
              account_type: 'EQUITY',
              currency: 'KRW',
              is_active: true,
            })
            .select()
            .single();
          equityAccountId = newEquity?.id;
        }

        if (equityAccountId) {
          const { data: entry } = await supabase
            .from('journal_entries')
            .insert({
              user_id: user.id,
              entry_date: new Date().toISOString().split('T')[0],
              description: `${name} 기초잔액 설정`,
            })
            .select()
            .single();

          if (entry) {
            const lines = accountType === 'ASSET'
              ? [
                  { journal_entry_id: entry.id, account_id: account.id, amount: balance },
                  { journal_entry_id: entry.id, account_id: equityAccountId, amount: -balance },
                ]
              : [
                  { journal_entry_id: entry.id, account_id: equityAccountId, amount: balance },
                  { journal_entry_id: entry.id, account_id: account.id, amount: -balance },
                ];

            await supabase.from('transaction_lines').insert(lines);
          }
        }
      }

      Alert.alert('완료', '계정이 생성되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('오류', '계정 생성에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: '계정 추가',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Account Type */}
        <Text className="text-gray-700 font-medium mb-2">계정 유형</Text>
        <View className="flex-row gap-3 mb-6">
          {ACCOUNT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              className={`flex-1 py-4 rounded-xl items-center ${
                accountType === type.value
                  ? 'bg-blue-600'
                  : 'bg-white border border-gray-200'
              }`}
              onPress={() => {
                setAccountType(type.value as 'ASSET' | 'LIABILITY');
                setSubtype('');
              }}
            >
              <Text
                className={`font-semibold ${
                  accountType === type.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subtype */}
        <Text className="text-gray-700 font-medium mb-2">계정 종류</Text>
        <View className="bg-white rounded-xl mb-6 overflow-hidden">
          {subtypes.map((st, index) => (
            <TouchableOpacity
              key={st.value}
              className={`flex-row items-center p-4 ${
                index < subtypes.length - 1 ? 'border-b border-gray-100' : ''
              } ${subtype === st.value ? 'bg-blue-50' : ''}`}
              onPress={() => setSubtype(st.value)}
            >
              <Text className="text-2xl mr-3">{st.icon}</Text>
              <Text className="flex-1 text-gray-900">{st.label}</Text>
              {subtype === st.value && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <Text className="text-gray-700 font-medium mb-2">계정 이름</Text>
        <TextInput
          className="bg-white rounded-xl p-4 text-gray-900 mb-6"
          placeholder="예: 국민은행 급여통장"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />

        {/* Initial Balance */}
        <Text className="text-gray-700 font-medium mb-2">초기 잔액 (선택)</Text>
        <View className="flex-row items-center bg-white rounded-xl mb-2">
          <Text className="text-gray-500 pl-4">₩</Text>
          <TextInput
            className="flex-1 p-4 text-gray-900"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={initialBalance}
            onChangeText={setInitialBalance}
          />
        </View>
        <Text className="text-gray-500 text-sm mb-6">
          초기 잔액은 '기초잔액' 계정과의 거래로 기록됩니다.
        </Text>

        {/* Color */}
        <Text className="text-gray-700 font-medium mb-2">색상</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              className={`w-10 h-10 rounded-full ${
                selectedColor === color ? 'border-2 border-gray-900' : ''
              }`}
              style={{ backgroundColor: color }}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`py-4 rounded-xl items-center mb-8 ${
            saving ? 'bg-blue-400' : 'bg-blue-600'
          }`}
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white font-semibold text-lg">
            {saving ? '저장 중...' : '계정 추가'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
