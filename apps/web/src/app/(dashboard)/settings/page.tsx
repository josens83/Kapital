'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Avatar, AvatarFallback, AvatarImage } from '@kapital/ui';
import { User, Globe, CreditCard, Bell, Shield, Database, LogOut, ChevronRight, Check, Crown, Palette } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/lib/stripe';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // 데모 사용자 데이터
  const [userData, setUserData] = useState({
    name: '홍길동',
    email: 'user@example.com',
    currency: 'KRW',
    locale: 'ko-KR',
    subscription: 'free' as 'free' | 'premium' | 'premium_plus',
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleUpgrade = async (plan: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          interval: 'monthly',
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500">계정 및 앱 설정을 관리하세요</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            프로필
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl">홍</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">이미지 변경</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <Button>변경사항 저장</Button>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            구독 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">현재 플랜</p>
                <p className="text-lg font-semibold">
                  {userData.subscription === 'free' && '무료'}
                  {userData.subscription === 'premium' && '프리미엄'}
                  {userData.subscription === 'premium_plus' && '프리미엄+'}
                </p>
              </div>
              {userData.subscription !== 'free' && (
                <Button variant="outline" onClick={handleManageSubscription} loading={loading}>
                  구독 관리
                </Button>
              )}
            </div>
          </div>

          {/* Plan Options */}
          {userData.subscription === 'free' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">프리미엄</h3>
                  <span className="text-lg font-bold">₩8,500/월</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  {PLANS.premium.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('premium')}
                  loading={loading}
                >
                  업그레이드
                </Button>
              </div>

              <div className="border-2 border-primary rounded-lg p-4 relative">
                <div className="absolute -top-3 left-4 bg-primary text-white text-xs px-2 py-1 rounded">
                  추천
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">프리미엄+</h3>
                  <span className="text-lg font-bold">₩12,500/월</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  {PLANS.premium_plus.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('premium_plus')}
                  loading={loading}
                >
                  업그레이드
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            환경설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>기본 통화</Label>
              <Select
                value={userData.currency}
                onValueChange={(v) => setUserData({ ...userData, currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (₩)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>언어</Label>
              <Select
                value={userData.locale}
                onValueChange={(v) => setUserData({ ...userData, locale: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko-KR">한국어</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Settings */}
      <Card>
        <CardContent className="p-0">
          <Link href="/settings/profile" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <span>프로필 수정</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
          <Link href="/settings/appearance" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-gray-400" />
              <span>테마 설정</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <span>알림 설정</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <span>보안 설정</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          <Link href="/settings/export" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-gray-400" />
              <span>데이터 내보내기</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-red-500"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              <span>로그아웃</span>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>Kapital v1.0.0</p>
        <p>
          <a href="/terms" className="hover:underline">이용약관</a>
          {' · '}
          <a href="/privacy" className="hover:underline">개인정보처리방침</a>
        </p>
      </div>
    </div>
  );
}
