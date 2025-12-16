'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@kapital/ui';
import {
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  CreditCard,
  Repeat,
  Target,
  FileText,
  Shield
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: '시작하기',
    question: '복식부기란 무엇인가요?',
    answer: '복식부기는 모든 거래를 두 개 이상의 계정에 동시에 기록하는 회계 방식입니다. 한 계정의 차변(Debit) 증가는 반드시 다른 계정의 대변(Credit) 증가와 일치해야 합니다. 이를 통해 재무 상태를 정확하게 파악하고 오류를 방지할 수 있습니다.',
  },
  {
    category: '시작하기',
    question: '계정은 어떻게 설정하나요?',
    answer: '설정 > 계정관리에서 은행 계좌, 신용카드, 현금 등 자산과 부채 계정을 추가할 수 있습니다. 또한 수입과 지출 카테고리도 설정하여 거래를 분류할 수 있습니다.',
  },
  {
    category: '거래',
    question: '거래를 추가하는 방법은?',
    answer: '거래내역 페이지에서 "거래 추가" 버튼을 클릭하세요. 지출, 수입, 이체 중 유형을 선택하고 금액, 계정, 카테고리를 입력하면 됩니다. Kapital이 자동으로 복식부기 분개를 생성합니다.',
  },
  {
    category: '거래',
    question: '반복 거래는 어떻게 설정하나요?',
    answer: '반복거래 메뉴에서 정기적으로 발생하는 거래(월급, 구독료, 공과금 등)를 설정할 수 있습니다. 주기(매일, 매주, 매월 등)를 선택하면 자동으로 거래가 기록됩니다.',
  },
  {
    category: '예산',
    question: '예산을 어떻게 설정하나요?',
    answer: '예산 페이지에서 카테고리별 월간 예산을 설정할 수 있습니다. 예산 사용률이 80%를 넘으면 경고가 표시되고, 100%를 초과하면 초과 알림을 받을 수 있습니다.',
  },
  {
    category: '리포트',
    question: '재무제표는 어떻게 확인하나요?',
    answer: '재무제표 페이지에서 대차대조표(자산, 부채, 순자산), 손익계산서(수입, 지출), 현금흐름표를 확인할 수 있습니다. 기간을 선택하여 원하는 시점의 재무 상태를 분석할 수 있습니다.',
  },
  {
    category: '구독',
    question: '프리미엄 구독의 혜택은?',
    answer: '프리미엄 구독 시 무제한 계정, 고급 리포트, 데이터 내보내기, 반복 거래 기능을 사용할 수 있습니다. 프리미엄+ 구독은 추가로 투자 추적, AI 재무 분석, 우선 지원을 제공합니다.',
  },
  {
    category: '보안',
    question: '내 데이터는 안전한가요?',
    answer: 'Kapital은 은행급 암호화(AES-256)를 사용하여 모든 데이터를 보호합니다. 2단계 인증(2FA)을 활성화하여 추가 보안을 설정할 수 있습니다. 데이터는 절대 제3자와 공유되지 않습니다.',
  },
];

const categories = [
  { name: '시작하기', icon: BookOpen },
  { name: '거래', icon: CreditCard },
  { name: '예산', icon: Target },
  { name: '리포트', icon: FileText },
  { name: '구독', icon: Repeat },
  { name: '보안', icon: Shield },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">도움이 필요하신가요?</h1>
        <p className="text-gray-500">자주 묻는 질문을 확인하거나 문의해 주세요</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="질문 검색..."
          className="pl-12 py-6 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          전체
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.name}
            variant={selectedCategory === cat.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.name)}
          >
            <cat.icon className="h-4 w-4 mr-1" />
            {cat.name}
          </Button>
        ))}
      </div>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            자주 묻는 질문
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="py-4">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.question ? null : faq.question)}
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  {expandedFAQ === faq.question ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === faq.question && (
                  <div className="mt-3 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
            {filteredFAQs.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                검색 결과가 없습니다
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">실시간 채팅</h3>
                <p className="text-sm text-gray-500 mb-3">
                  평일 9:00 - 18:00 실시간 상담 가능
                </p>
                <Button variant="outline" size="sm">
                  채팅 시작
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">이메일 문의</h3>
                <p className="text-sm text-gray-500 mb-3">
                  support@kapital.app
                </p>
                <Button variant="outline" size="sm">
                  이메일 보내기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">바로가기</h3>
          <div className="grid gap-2 md:grid-cols-3">
            <Link href="/settings" className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">설정</p>
              <p className="text-sm text-gray-500">계정 및 앱 설정</p>
            </Link>
            <Link href="/terms" className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">이용약관</p>
              <p className="text-sm text-gray-500">서비스 이용 조건</p>
            </Link>
            <Link href="/privacy" className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">개인정보처리방침</p>
              <p className="text-sm text-gray-500">개인정보 보호 정책</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
