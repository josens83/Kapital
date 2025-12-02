import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripeClient;
}

// Backward compatibility alias
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
};

// 가격 ID (Stripe Dashboard에서 생성)
export const PRICE_IDS = {
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly',
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly',
  premium_plus_monthly: process.env.STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID || 'price_premium_plus_monthly',
  premium_plus_yearly: process.env.STRIPE_PREMIUM_PLUS_YEARLY_PRICE_ID || 'price_premium_plus_yearly',
};

// 플랜 정보
export const PLANS = {
  free: {
    name: '무료',
    price: 0,
    features: [
      '3개 계좌',
      '월 50건 거래',
      '기본 대시보드',
      '30일 데이터 보관',
    ],
  },
  premium: {
    name: '프리미엄',
    monthlyPrice: 8500,
    yearlyPrice: 69000,
    features: [
      '무제한 계좌',
      '무제한 거래',
      '모든 재무제표',
      '예산 관리',
      'CSV/PDF 내보내기',
      '2명 가족 공유',
    ],
  },
  premium_plus: {
    name: '프리미엄+',
    monthlyPrice: 12500,
    yearlyPrice: 99000,
    features: [
      '프리미엄 모든 기능',
      '은행 자동 연동',
      '투자 자산 추적',
      '5명 가족 공유',
      '우선 지원',
      'API 접근',
    ],
  },
};
