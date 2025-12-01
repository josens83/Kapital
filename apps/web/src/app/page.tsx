import Link from 'next/link';
import { Button } from '@kapital/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Kapital</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>무료로 시작하기</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            진정한 복식부기 회계로
            <br />
            <span className="text-primary">재정을 완벽하게 관리하세요</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            기업 수준의 정확한 재무 관리를 누구나 쉽게.
            <br />
            매월 자동 생성되는 재무제표로 자산을 한눈에 파악하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                기능 살펴보기
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 rounded-xl shadow-2xl border overflow-hidden bg-white">
          <div className="bg-gray-100 px-4 py-3 border-b flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="p-8 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Net Worth Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <p className="text-sm text-gray-500 mb-1">순자산</p>
                <p className="text-3xl font-bold text-gray-900">₩45,230,000</p>
                <p className="text-sm text-green-500 mt-2">▲ +2.3% 전월 대비</p>
              </div>
              {/* Income Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <p className="text-sm text-gray-500 mb-1">이번 달 수입</p>
                <p className="text-3xl font-bold text-emerald-500">₩5,400,000</p>
                <p className="text-sm text-gray-400 mt-2">급여 + 부업</p>
              </div>
              {/* Expense Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <p className="text-sm text-gray-500 mb-1">이번 달 지출</p>
                <p className="text-3xl font-bold text-red-500">₩3,200,000</p>
                <p className="text-sm text-gray-400 mt-2">예산 ₩4,000,000의 80%</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            왜 Kapital인가요?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">진정한 복식부기</h3>
              <p className="text-gray-600">
                기업 회계 수준의 정확한 복식부기 시스템으로 모든 거래를 추적합니다.
                차변과 대변이 항상 균형을 이룹니다.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">자동 재무제표</h3>
              <p className="text-gray-600">
                재무상태표, 손익계산서, 현금흐름표가 매월 자동으로 생성됩니다.
                당신의 재정 상태를 한눈에 파악하세요.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">어디서나 동기화</h3>
              <p className="text-gray-600">
                웹, iOS, Android 앱에서 실시간 동기화.
                어디서든 당신의 재정을 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">심플한 가격 정책</h2>
          <p className="text-gray-600 text-center mb-12">
            무료로 시작하고, 필요할 때 업그레이드하세요
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-xl p-8 border shadow-sm">
              <h3 className="text-xl font-semibold mb-2">무료</h3>
              <p className="text-4xl font-bold mb-4">₩0</p>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li>✓ 3개 계좌</li>
                <li>✓ 월 50건 거래</li>
                <li>✓ 기본 대시보드</li>
                <li>✓ 30일 데이터 보관</li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">시작하기</Button>
              </Link>
            </div>
            {/* Premium */}
            <div className="bg-primary text-white rounded-xl p-8 shadow-lg scale-105">
              <div className="text-sm font-medium mb-2 opacity-80">추천</div>
              <h3 className="text-xl font-semibold mb-2">프리미엄</h3>
              <p className="text-4xl font-bold mb-4">
                ₩8,500<span className="text-lg font-normal">/월</span>
              </p>
              <ul className="space-y-3 mb-8 opacity-90">
                <li>✓ 무제한 계좌</li>
                <li>✓ 무제한 거래</li>
                <li>✓ 모든 재무제표</li>
                <li>✓ 예산 관리</li>
                <li>✓ CSV/PDF 내보내기</li>
              </ul>
              <Link href="/signup?plan=premium">
                <Button variant="secondary" className="w-full">시작하기</Button>
              </Link>
            </div>
            {/* Premium Plus */}
            <div className="bg-white rounded-xl p-8 border shadow-sm">
              <h3 className="text-xl font-semibold mb-2">프리미엄+</h3>
              <p className="text-4xl font-bold mb-4">
                ₩12,500<span className="text-lg font-normal">/월</span>
              </p>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li>✓ 프리미엄 모든 기능</li>
                <li>✓ 은행 자동 연동</li>
                <li>✓ 투자 자산 추적</li>
                <li>✓ 가족 공유 (5명)</li>
                <li>✓ 우선 지원</li>
              </ul>
              <Link href="/signup?plan=premium_plus">
                <Button variant="outline" className="w-full">시작하기</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 재정 관리를 시작하세요
          </h2>
          <p className="text-xl opacity-90 mb-8">
            무료로 시작하고, 언제든지 업그레이드하세요
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-bold text-white">Kapital</span>
              <p className="mt-2 text-sm">
                복식부기 기반 개인 재무관리 앱
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">제품</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">기능</Link></li>
                <li><Link href="#pricing" className="hover:text-white">가격</Link></li>
                <li><Link href="/roadmap" className="hover:text-white">로드맵</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">회사</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">소개</Link></li>
                <li><Link href="/blog" className="hover:text-white">블로그</Link></li>
                <li><Link href="/contact" className="hover:text-white">문의</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">법적 고지</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">개인정보처리방침</Link></li>
                <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © 2025 Kapital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
