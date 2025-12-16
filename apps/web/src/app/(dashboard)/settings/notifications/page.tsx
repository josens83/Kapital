'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Switch, Label } from '@kapital/ui';
import { ArrowLeft, Bell, Mail, Smartphone, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  icon: React.ReactNode;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'budget_alerts',
      title: '예산 알림',
      description: '예산 초과 또는 임박 시 알림',
      email: true,
      push: true,
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    },
    {
      id: 'recurring_reminder',
      title: '반복 거래 알림',
      description: '반복 거래 실행 전 알림',
      email: false,
      push: true,
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'weekly_summary',
      title: '주간 리포트',
      description: '매주 지출 요약 리포트',
      email: true,
      push: false,
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
    },
    {
      id: 'monthly_summary',
      title: '월간 리포트',
      description: '매월 재무 현황 리포트',
      email: true,
      push: false,
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
    },
    {
      id: 'large_transaction',
      title: '대규모 거래 알림',
      description: '설정 금액 이상의 거래 발생 시 알림',
      email: true,
      push: true,
      icon: <Bell className="h-5 w-5 text-red-500" />,
    },
  ]);

  const [largeTransactionThreshold, setLargeTransactionThreshold] = useState('500000');
  const [saving, setSaving] = useState(false);

  const toggleSetting = (id: string, type: 'email' | 'push') => {
    setSettings(settings.map(s => {
      if (s.id === id) {
        return { ...s, [type]: !s[type] };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    alert('알림 설정이 저장되었습니다.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">알림 설정</h1>
          <p className="text-gray-500">이메일 및 푸시 알림을 관리합니다</p>
        </div>
      </div>

      {/* Notification Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 수신 방법</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">이메일</p>
                <p className="text-sm text-gray-500">user@example.com</p>
              </div>
            </div>
            <span className="text-sm text-emerald-500 font-medium">연결됨</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">푸시 알림</p>
                <p className="text-sm text-gray-500">모바일 앱에서 활성화</p>
              </div>
            </div>
            <Button variant="outline" size="sm">설정</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 유형</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {settings.map((setting) => (
              <div key={setting.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">{setting.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{setting.title}</p>
                    <p className="text-sm text-gray-500 mb-3">{setting.description}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={setting.email}
                          onCheckedChange={() => toggleSetting(setting.id, 'email')}
                        />
                        <Label className="text-sm text-gray-600">이메일</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={setting.push}
                          onCheckedChange={() => toggleSetting(setting.id, 'push')}
                        />
                        <Label className="text-sm text-gray-600">푸시</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Large Transaction Threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">대규모 거래 기준 금액</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
              <input
                type="number"
                value={largeTransactionThreshold}
                onChange={(e) => setLargeTransactionThreshold(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <span className="text-gray-500">이상</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            설정한 금액 이상의 거래가 발생하면 알림을 받습니다.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>
    </div>
  );
}
