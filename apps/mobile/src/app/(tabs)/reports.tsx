import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@kapital/utils';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

export default function ReportsScreen() {
  const [mainTab, setMainTab] = useState<'analytics' | 'statements'>('analytics');
  const [statementTab, setStatementTab] = useState<'balance' | 'income' | 'cashflow'>('balance');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Demo data
        const demoMonthly: MonthlyData[] = [
          { month: '7월', income: 4500000, expense: 2800000 },
          { month: '8월', income: 4500000, expense: 3100000 },
          { month: '9월', income: 4800000, expense: 2900000 },
          { month: '10월', income: 4500000, expense: 3200000 },
          { month: '11월', income: 5200000, expense: 3400000 },
          { month: '12월', income: 4500000, expense: 2100000 },
        ];
        setMonthlyData(demoMonthly);

        const demoCategories: CategoryData[] = [
          { name: '식비', amount: 520000, color: CATEGORY_COLORS[0], percentage: 32 },
          { name: '주거', amount: 450000, color: CATEGORY_COLORS[1], percentage: 28 },
          { name: '교통', amount: 180000, color: CATEGORY_COLORS[2], percentage: 11 },
          { name: '쇼핑', amount: 250000, color: CATEGORY_COLORS[3], percentage: 15 },
          { name: '여가', amount: 120000, color: CATEGORY_COLORS[4], percentage: 7 },
          { name: '기타', amount: 110000, color: CATEGORY_COLORS[5], percentage: 7 },
        ];
        setCategoryData(demoCategories);
        setTotalIncome(4500000);
        setTotalExpense(1630000);
        return;
      }

      // Load real data from Supabase
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: entriesData } = await supabase
        .from('journal_lines')
        .select(`
          amount,
          accounts(type, name),
          journal_entries!inner(date)
        `)
        .gte('journal_entries.date', startOfMonth)
        .lte('journal_entries.date', endOfMonth);

      if (entriesData) {
        let income = 0;
        let expense = 0;
        const categoryTotals: Record<string, number> = {};

        entriesData.forEach((line: any) => {
          if (line.accounts?.type === 'income' && line.amount < 0) {
            income += Math.abs(line.amount);
          } else if (line.accounts?.type === 'expense' && line.amount > 0) {
            expense += line.amount;
            const category = line.accounts.name || '기타';
            categoryTotals[category] = (categoryTotals[category] || 0) + line.amount;
          }
        });

        setTotalIncome(income);
        setTotalExpense(expense);

        const categories = Object.entries(categoryTotals)
          .map(([name, amount], index) => ({
            name,
            amount,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            percentage: expense > 0 ? Math.round((amount / expense) * 100) : 0,
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 6);

        setCategoryData(categories.length > 0 ? categories : [
          { name: '데이터 없음', amount: 0, color: '#9CA3AF', percentage: 100 },
        ]);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatShortCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`;
    }
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Bar Chart Component
  const BarChart = ({ data }: { data: MonthlyData[] }) => {
    const chartWidth = SCREEN_WIDTH - 48;
    const chartHeight = 160;
    const barWidth = (chartWidth - 40) / data.length / 2 - 4;
    const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense]));

    return (
      <View className="mt-4">
        <Svg width={chartWidth} height={chartHeight + 30}>
          {data.map((item, index) => {
            const x = 20 + (index * (chartWidth - 40)) / data.length;
            const incomeHeight = (item.income / maxValue) * chartHeight;
            const expenseHeight = (item.expense / maxValue) * chartHeight;

            return (
              <G key={index}>
                <Path
                  d={`M${x},${chartHeight - incomeHeight} L${x},${chartHeight} L${x + barWidth},${chartHeight} L${x + barWidth},${chartHeight - incomeHeight} Z`}
                  fill="#22C55E"
                  opacity={0.8}
                />
                <Path
                  d={`M${x + barWidth + 4},${chartHeight - expenseHeight} L${x + barWidth + 4},${chartHeight} L${x + barWidth * 2 + 4},${chartHeight} L${x + barWidth * 2 + 4},${chartHeight - expenseHeight} Z`}
                  fill="#EF4444"
                  opacity={0.8}
                />
                <SvgText
                  x={x + barWidth}
                  y={chartHeight + 20}
                  fontSize={11}
                  fill="#6B7280"
                  textAnchor="middle"
                >
                  {item.month}
                </SvgText>
              </G>
            );
          })}
        </Svg>
        <View className="flex-row justify-center space-x-6 mt-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-green-500 mr-2" />
            <Text className="text-gray-600 text-sm">수입</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-red-500 mr-2" />
            <Text className="text-gray-600 text-sm">지출</Text>
          </View>
        </View>
      </View>
    );
  };

  // Pie Chart Component
  const PieChart = ({ data }: { data: CategoryData[] }) => {
    const size = 140;
    const radius = 55;
    const innerRadius = 35;
    const center = size / 2;

    let currentAngle = -90;

    const paths = data.map((item) => {
      const angle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      const x3 = center + innerRadius * Math.cos(endRad);
      const y3 = center + innerRadius * Math.sin(endRad);
      const x4 = center + innerRadius * Math.cos(startRad);
      const y4 = center + innerRadius * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;
      const d = `M${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} L${x3},${y3} A${innerRadius},${innerRadius} 0 ${largeArc},0 ${x4},${y4} Z`;

      return { d, color: item.color };
    });

    return (
      <View className="items-center">
        <Svg width={size} height={size}>
          {paths.map((path, index) => (
            <Path key={index} d={path.d} fill={path.color} />
          ))}
          <Circle cx={center} cy={center} r={innerRadius - 5} fill="white" />
        </Svg>
        <View className="absolute" style={{ top: size / 2 - 16 }}>
          <Text className="text-center text-gray-500 text-xs">총 지출</Text>
          <Text className="text-center text-gray-900 font-bold text-sm">
            {formatShortCurrency(totalExpense)}원
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const netIncome = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">리포트</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="share-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Main Tab Selector */}
      <View className="px-5 py-2">
        <View className="flex-row bg-gray-200 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg ${mainTab === 'analytics' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setMainTab('analytics')}
          >
            <Text className={`text-center font-medium ${mainTab === 'analytics' ? 'text-gray-900' : 'text-gray-500'}`}>
              분석
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg ${mainTab === 'statements' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setMainTab('statements')}
          >
            <Text className={`text-center font-medium ${mainTab === 'statements' ? 'text-gray-900' : 'text-gray-500'}`}>
              재무제표
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {mainTab === 'analytics' ? (
          <>
            {/* Period Selector */}
            <View className="mx-5 mt-2">
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                {[
                  { value: 'week', label: '이번 주' },
                  { value: 'month', label: '이번 달' },
                  { value: 'year', label: '올해' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    className={`flex-1 py-2 rounded-md ${period === item.value ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setPeriod(item.value as typeof period)}
                  >
                    <Text className={`text-center text-sm font-medium ${period === item.value ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary Cards */}
            <View className="flex-row mx-5 mt-4 space-x-3">
              <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                    <Ionicons name="arrow-down" size={16} color="#22C55E" />
                  </View>
                  <Text className="text-gray-500 text-sm ml-2">수입</Text>
                </View>
                <Text className="text-gray-900 font-bold text-lg mt-2">
                  {formatFullCurrency(totalIncome)}
                </Text>
              </View>
              <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
                    <Ionicons name="arrow-up" size={16} color="#EF4444" />
                  </View>
                  <Text className="text-gray-500 text-sm ml-2">지출</Text>
                </View>
                <Text className="text-gray-900 font-bold text-lg mt-2">
                  {formatFullCurrency(totalExpense)}
                </Text>
              </View>
            </View>

            {/* Net Income */}
            <View className="mx-5 mt-3 bg-white p-4 rounded-xl shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-gray-500 text-sm">순수입</Text>
                  <Text className={`text-2xl font-bold mt-1 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netIncome >= 0 ? '+' : ''}{formatFullCurrency(netIncome)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-500 text-sm">저축률</Text>
                  <Text className={`text-xl font-bold mt-1 ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {savingsRate.toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Monthly Chart */}
            <View className="mx-5 mt-4 bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-gray-900 font-semibold">월별 추이</Text>
              <BarChart data={monthlyData} />
            </View>

            {/* Category Breakdown */}
            <View className="mx-5 mt-4 bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-gray-900 font-semibold mb-4">지출 카테고리</Text>
              <View className="flex-row">
                <PieChart data={categoryData} />
                <View className="flex-1 ml-4 justify-center">
                  {categoryData.map((item, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <Text className="text-gray-700 flex-1 text-sm" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-gray-500 text-sm">{item.percentage}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Category Details */}
            <View className="mx-5 mt-4 mb-8 bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-gray-900 font-semibold mb-3">지출 상세</Text>
              {categoryData.map((item, index) => (
                <View key={index} className={`flex-row items-center py-3 ${index < categoryData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                    <Text className="font-bold text-sm" style={{ color: item.color }}>{index + 1}</Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-medium">{item.name}</Text>
                    <View className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <View className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                    </View>
                  </View>
                  <Text className="text-gray-900 font-semibold ml-3">{formatFullCurrency(item.amount)}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Statement Tab Selector */}
            <View className="px-5 py-2">
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'balance', label: '재무상태표' },
                  { key: 'income', label: '손익계산서' },
                  { key: 'cashflow', label: '현금흐름표' },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setStatementTab(tab.key as any)}
                    className={`flex-1 py-2 rounded-md ${statementTab === tab.key ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-center text-xs font-medium ${statementTab === tab.key ? 'text-blue-600' : 'text-gray-600'}`}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="px-5">
              {statementTab === 'balance' && <BalanceSheet />}
              {statementTab === 'income' && <IncomeStatement />}
              {statementTab === 'cashflow' && <CashFlowStatement />}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BalanceSheet() {
  return (
    <View className="mt-2">
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-gray-500 text-sm">기준일</Text>
        <Text className="text-gray-900 font-semibold">2025년 12월</Text>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-emerald-600 font-semibold mb-3">자산</Text>
        <View className="space-y-2">
          <ReportRow label="현금 및 현금성 자산" amount={12500000} />
          <ReportRow label="은행 예금" amount={28000000} />
          <ReportRow label="투자 자산" amount={8000000} />
          <ReportRow label="기타 자산" amount={5000000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="자산 총계" amount={53500000} bold />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-red-600 font-semibold mb-3">부채</Text>
        <View className="space-y-2">
          <ReportRow label="신용카드 미결제" amount={1200000} />
          <ReportRow label="대출금" amount={7000000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="부채 총계" amount={8200000} bold />
        </View>
      </View>

      <View className="bg-blue-600 rounded-xl p-4 shadow-sm mb-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold">순자산</Text>
          <Text className="text-white text-xl font-bold">{formatCurrency(45300000)}</Text>
        </View>
      </View>
    </View>
  );
}

function IncomeStatement() {
  return (
    <View className="mt-2">
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-gray-500 text-sm">기간</Text>
        <Text className="text-gray-900 font-semibold">2025년 12월</Text>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-emerald-600 font-semibold mb-3">수익</Text>
        <View className="space-y-2">
          <ReportRow label="급여" amount={5000000} />
          <ReportRow label="부업 수입" amount={400000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="수익 총계" amount={5400000} bold />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-red-600 font-semibold mb-3">비용</Text>
        <View className="space-y-2">
          <ReportRow label="주거비" amount={1000000} />
          <ReportRow label="식비" amount={650000} />
          <ReportRow label="교통비" amount={200000} />
          <ReportRow label="기타" amount={350000} />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="비용 총계" amount={2200000} bold />
        </View>
      </View>

      <View className="bg-emerald-500 rounded-xl p-4 shadow-sm mb-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold">순이익</Text>
          <Text className="text-white text-xl font-bold">{formatCurrency(3200000)}</Text>
        </View>
      </View>
    </View>
  );
}

function CashFlowStatement() {
  return (
    <View className="mt-2">
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-gray-500 text-sm">기간</Text>
        <Text className="text-gray-900 font-semibold">2025년 12월</Text>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-blue-600 font-semibold mb-3">영업활동 현금흐름</Text>
        <View className="space-y-2">
          <ReportRow label="현금 유입" amount={5400000} positive />
          <ReportRow label="현금 유출" amount={2200000} negative />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="순 현금흐름" amount={3200000} bold positive />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <View className="space-y-2">
          <ReportRow label="기초 현금" amount={12000000} />
          <ReportRow label="순 현금 변동" amount={3200000} positive />
        </View>
        <View className="border-t border-gray-100 mt-3 pt-3">
          <ReportRow label="기말 현금" amount={15200000} bold />
        </View>
      </View>
    </View>
  );
}

function ReportRow({
  label,
  amount,
  bold,
  positive,
  negative,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-1">
      <Text className={`${bold ? 'font-semibold' : ''} text-gray-700`}>{label}</Text>
      <Text
        className={`${bold ? 'font-bold' : 'font-medium'} ${
          positive ? 'text-emerald-500' : negative ? 'text-red-500' : 'text-gray-900'
        }`}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}
