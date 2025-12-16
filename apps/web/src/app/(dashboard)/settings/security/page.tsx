'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@kapital/ui';
import { ArrowLeft, Shield, Key, Smartphone, History, LogOut, AlertTriangle } from 'lucide-react';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export default function SecuritySettingsPage() {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [sessions] = useState<Session[]>([
    { id: '1', device: 'Chrome on MacOS', location: '서울, 대한민국', lastActive: '현재 활성', current: true },
    { id: '2', device: 'Safari on iPhone', location: '서울, 대한민국', lastActive: '2시간 전', current: false },
    { id: '3', device: 'Firefox on Windows', location: '부산, 대한민국', lastActive: '3일 전', current: false },
  ]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('비밀번호가 변경되었습니다.');
  };

  const handleEnable2FA = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setTwoFactorEnabled(true);
    setSaving(false);
    setShow2FADialog(false);
    alert('2단계 인증이 활성화되었습니다.');
  };

  const handleLogoutSession = (sessionId: string) => {
    if (!confirm('이 세션을 로그아웃하시겠습니까?')) return;
    alert('세션이 로그아웃되었습니다.');
  };

  const handleLogoutAllSessions = () => {
    if (!confirm('현재 세션을 제외한 모든 세션을 로그아웃하시겠습니까?')) return;
    alert('모든 세션이 로그아웃되었습니다.');
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
          <h1 className="text-2xl font-bold text-gray-900">보안 설정</h1>
          <p className="text-gray-500">계정 보안을 관리합니다</p>
        </div>
      </div>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-5 w-5" />
            비밀번호
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">비밀번호 변경</p>
              <p className="text-sm text-gray-500">마지막 변경: 30일 전</p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
              변경
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-5 w-5" />
            2단계 인증
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">2단계 인증 (2FA)</p>
              <p className="text-sm text-gray-500">
                {twoFactorEnabled ? '활성화됨' : '추가 보안을 위해 2FA를 활성화하세요'}
              </p>
            </div>
            {twoFactorEnabled ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
                활성화됨
              </span>
            ) : (
              <Button onClick={() => setShow2FADialog(true)}>
                활성화
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5" />
            활성 세션
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleLogoutAllSessions}>
            <LogOut className="h-4 w-4 mr-2" />
            모두 로그아웃
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                        현재
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLogoutSession(session.id)}
                  >
                    로그아웃
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-600">
            <AlertTriangle className="h-5 w-5" />
            위험 구역
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">계정 비활성화</p>
              <p className="text-sm text-gray-500">계정을 일시적으로 비활성화합니다</p>
            </div>
            <Button variant="outline">비활성화</Button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-red-600 font-medium">계정 삭제</p>
              <p className="text-sm text-gray-500">모든 데이터가 영구적으로 삭제됩니다</p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              삭제
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              취소
            </Button>
            <Button onClick={handleChangePassword} disabled={saving}>
              {saving ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>2단계 인증 활성화</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-600">
              2단계 인증을 활성화하면 로그인 시 추가 인증이 필요합니다.
            </p>
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-2">QR 코드</p>
              <div className="w-32 h-32 bg-gray-300 mx-auto flex items-center justify-center">
                QR
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verifyCode">인증 코드 입력</Label>
              <Input
                id="verifyCode"
                placeholder="6자리 코드"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              취소
            </Button>
            <Button onClick={handleEnable2FA} disabled={saving}>
              {saving ? '활성화 중...' : '활성화'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
