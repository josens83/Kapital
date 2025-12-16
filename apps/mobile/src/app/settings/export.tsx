import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../lib/supabase';

type ExportFormat = 'csv' | 'json';
type DataType = 'transactions' | 'accounts' | 'budgets' | 'all';

interface ExportOption {
  value: DataType;
  label: string;
  description: string;
  icon: string;
}

const exportOptions: ExportOption[] = [
  {
    value: 'transactions',
    label: '거래내역',
    description: '모든 거래 기록을 내보냅니다',
    icon: 'swap-horizontal',
  },
  {
    value: 'accounts',
    label: '계정 목록',
    description: '계정 정보와 잔액을 내보냅니다',
    icon: 'wallet',
  },
  {
    value: 'budgets',
    label: '예산',
    description: '예산 설정을 내보냅니다',
    icon: 'pie-chart',
  },
  {
    value: 'all',
    label: '전체 데이터',
    description: '모든 데이터를 내보냅니다',
    icon: 'download',
  },
];

export default function ExportScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<DataType>('transactions');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      let data: any = {};

      // Fetch data based on selected type
      if (selectedType === 'transactions' || selectedType === 'all') {
        const { data: transactions } = await supabase
          .from('journal_entries')
          .select(`
            id,
            entry_date,
            description,
            memo,
            transaction_lines (
              amount,
              accounts (name, account_type)
            )
          `)
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false });
        data.transactions = transactions || [];
      }

      if (selectedType === 'accounts' || selectedType === 'all') {
        const { data: accounts } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);
        data.accounts = accounts || [];
      }

      if (selectedType === 'budgets' || selectedType === 'all') {
        const { data: budgets } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);
        data.budgets = budgets || [];
      }

      // Format data
      let content: string;
      let filename: string;

      if (selectedFormat === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `kapital_export_${Date.now()}.json`;
      } else {
        // CSV format
        const csvRows: string[] = [];
        const targetData = selectedType === 'all' ? data.transactions : data[selectedType];

        if (Array.isArray(targetData) && targetData.length > 0) {
          // Add headers
          const headers = Object.keys(targetData[0]);
          csvRows.push(headers.join(','));

          // Add data rows
          targetData.forEach((item: any) => {
            const values = headers.map(header => {
              const value = item[header];
              if (typeof value === 'object') {
                return JSON.stringify(value).replace(/,/g, ';');
              }
              return String(value || '').replace(/,/g, ';');
            });
            csvRows.push(values.join(','));
          });
        }

        content = '\uFEFF' + csvRows.join('\n'); // BOM for Excel
        filename = `kapital_export_${Date.now()}.csv`;
      }

      // Save and share file
      const filePath = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Share.share({
        url: filePath,
        title: 'Kapital 데이터 내보내기',
      });

      Alert.alert('완료', '데이터가 성공적으로 내보내졌습니다.');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('오류', '데이터 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: '데이터 내보내기',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Data Type Selection */}
        <Text className="text-gray-500 text-sm mb-2 px-1">내보낼 데이터</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          {exportOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              className={`flex-row items-center p-4 ${
                index < exportOptions.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onPress={() => setSelectedType(option.value)}
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                <Ionicons name={option.icon as any} size={20} color="#3B82F6" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-medium">{option.label}</Text>
                <Text className="text-gray-500 text-sm">{option.description}</Text>
              </View>
              {selectedType === option.value && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Format Selection */}
        <Text className="text-gray-500 text-sm mt-6 mb-2 px-1">파일 형식</Text>
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => setSelectedFormat('csv')}
          >
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
              <Ionicons name="document-text" size={20} color="#10B981" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-medium">CSV</Text>
              <Text className="text-gray-500 text-sm">Excel, 스프레드시트에서 열기</Text>
            </View>
            {selectedFormat === 'csv' && (
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() => setSelectedFormat('json')}
          >
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
              <Ionicons name="code-slash" size={20} color="#8B5CF6" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-medium">JSON</Text>
              <Text className="text-gray-500 text-sm">개발자용, 데이터 백업</Text>
            </View>
            {selectedFormat === 'json' && (
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          className={`mt-8 p-4 rounded-xl flex-row items-center justify-center ${
            exporting ? 'bg-blue-400' : 'bg-blue-600'
          }`}
          onPress={handleExport}
          disabled={exporting}
        >
          <Ionicons name="download" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            {exporting ? '내보내는 중...' : '내보내기'}
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View className="mt-4 p-4 bg-gray-100 rounded-xl">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-2 flex-1">
              내보낸 데이터는 개인정보를 포함할 수 있습니다. 파일을 안전하게 보관하세요.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
