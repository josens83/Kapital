'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  email: string;
  name: string;
  default_currency: string;
  locale: string;
}

const CURRENCIES = [
  { value: 'KRW', label: '원화 (KRW)' },
  { value: 'USD', label: '달러 (USD)' },
  { value: 'EUR', label: '유로 (EUR)' },
  { value: 'JPY', label: '엔화 (JPY)' },
  { value: 'CNY', label: '위안화 (CNY)' },
];

const LOCALES = [
  { value: 'ko-KR', label: '한국어' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'zh-CN', label: '中文' },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    email: '',
    name: '',
    default_currency: 'KRW',
    locale: 'ko-KR',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile({
            email: user.email || '',
            name: data.name || '',
            default_currency: data.default_currency || 'KRW',
            locale: data.locale || 'ko-KR',
          });
        } else {
          setProfile({
            email: user.email || '',
            name: user.user_metadata?.name || '',
            default_currency: 'KRW',
            locale: 'ko-KR',
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: profile.email,
            name: profile.name,
            default_currency: profile.default_currency,
            locale: profile.locale,
          });

        alert('저장되었습니다.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
        <p className="text-gray-500 mt-1">계정 정보를 수정합니다</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
            {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="ml-4">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              프로필 사진 변경
            </button>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG 최대 2MB</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="text-sm text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">기본 통화</label>
          <select
            value={profile.default_currency}
            onChange={(e) => setProfile({ ...profile, default_currency: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Locale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
          <select
            value={profile.locale}
            onChange={(e) => setProfile({ ...profile, locale: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-red-200">
        <h2 className="font-medium text-red-600 mb-4">위험 영역</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">계정 비활성화</p>
              <p className="text-sm text-gray-500">일시적으로 계정을 비활성화합니다</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              비활성화
            </button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="font-medium text-gray-900">계정 삭제</p>
              <p className="text-sm text-gray-500">모든 데이터가 영구적으로 삭제됩니다</p>
            </div>
            <button className="px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50">
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
