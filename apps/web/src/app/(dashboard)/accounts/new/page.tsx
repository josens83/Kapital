'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kapital/ui';
import { ArrowLeft } from 'lucide-react';

const accountTypes = [
  { value: 'ASSET', label: '자산', color: 'text-emerald-500' },
  { value: 'LIABILITY', label: '부채', color: 'text-red-500' },
];

const assetSubtypes = [
  { value: 'cash', label: '현금', icon: '💵' },
  { value: 'bank', label: '은행 계좌', icon: '🏦' },
  { value: 'savings', label: '예금', icon: '💰' },
  { value: 'investment', label: '투자', icon: '📈' },
  { value: 'crypto', label: '암호화폐', icon: '₿' },
  { value: 'deposit', label: '보증금', icon: '🔐' },
  { value: 'other_asset', label: '기타 자산', icon: '📦' },
];

const liabilitySubtypes = [
  { value: 'credit_card', label: '신용카드', icon: '💳' },
  { value: 'loan', label: '대출', icon: '🏦' },
  { value: 'mortgage', label: '주택담보대출', icon: '🏠' },
  { value: 'payable', label: '미지급금', icon: '📝' },
  { value: 'other_liability', label: '기타 부채', icon: '📦' },
];

const colors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#6B7280',
];

export default function NewAccountPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<string>('ASSET');
  const [subtype, setSubtype] = useState<string>('');
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);

  const subtypes = accountType === 'ASSET' ? assetSubtypes : liabilitySubtypes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: API 호출
    console.log({
      accountType,
      subtype,
      name,
      initialBalance: parseFloat(initialBalance) || 0,
      color: selectedColor,
    });

    setTimeout(() => {
      router.push('/accounts');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 계정 추가</h1>
          <p className="text-gray-500">자산 또는 부채 계정을 추가하세요</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div className="space-y-2">
              <Label>계정 유형</Label>
              <div className="grid grid-cols-2 gap-4">
                {accountTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setAccountType(type.value);
                      setSubtype('');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      accountType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-semibold ${type.color}`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtype */}
            <div className="space-y-2">
              <Label>계정 종류</Label>
              <Select value={subtype} onValueChange={setSubtype}>
                <SelectTrigger>
                  <SelectValue placeholder="계정 종류를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {subtypes.map((st) => (
                    <SelectItem key={st.value} value={st.value}>
                      <span className="flex items-center gap-2">
                        <span>{st.icon}</span>
                        <span>{st.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">계정 이름</Label>
              <Input
                id="name"
                placeholder="예: 국민은행 급여통장"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
              <Label htmlFor="balance">초기 잔액 (선택)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₩
                </span>
                <Input
                  id="balance"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                초기 잔액은 '기초잔액' 계정과의 거래로 기록됩니다.
              </p>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>색상</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                계정 추가
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
