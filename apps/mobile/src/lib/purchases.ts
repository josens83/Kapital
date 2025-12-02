import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API 키 (환경변수에서 가져오기)
const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
}) || '';

// 구독 플랜 식별자
export const ENTITLEMENTS = {
  PREMIUM: 'premium',
  PREMIUM_PLUS: 'premium_plus',
} as const;

export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'kapital_premium_monthly',
  PREMIUM_YEARLY: 'kapital_premium_yearly',
  PREMIUM_PLUS_MONTHLY: 'kapital_premium_plus_monthly',
  PREMIUM_PLUS_YEARLY: 'kapital_premium_plus_yearly',
} as const;

// RevenueCat 초기화
export async function initializePurchases(userId?: string) {
  if (!REVENUECAT_API_KEY) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    if (userId) {
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId,
      });
    } else {
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
      });
    }

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

// 사용자 ID 설정 (로그인 후)
export async function loginToPurchases(userId: string) {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('Failed to login to RevenueCat:', error);
    throw error;
  }
}

// 로그아웃
export async function logoutFromPurchases() {
  try {
    const { customerInfo } = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error('Failed to logout from RevenueCat:', error);
    throw error;
  }
}

// 현재 고객 정보 가져오기
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

// 구독 상태 확인
export async function checkSubscriptionStatus(): Promise<{
  isPremium: boolean;
  isPremiumPlus: boolean;
  activeSubscription: string | null;
}> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    const isPremiumPlus = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM_PLUS]?.isActive ?? false;
    const isPremium = isPremiumPlus || (customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM]?.isActive ?? false);

    let activeSubscription: string | null = null;
    if (isPremiumPlus) {
      activeSubscription = 'premium_plus';
    } else if (isPremium) {
      activeSubscription = 'premium';
    }

    return {
      isPremium,
      isPremiumPlus,
      activeSubscription,
    };
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return {
      isPremium: false,
      isPremiumPlus: false,
      activeSubscription: null,
    };
  }
}

// 구독 오퍼링 가져오기
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

// 패키지 구매
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
      return null;
    }
    console.error('Failed to purchase:', error);
    throw error;
  }
}

// 구매 복원
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
}

// 헬퍼: 가격 포맷팅
export function formatPrice(packageItem: PurchasesPackage): string {
  return packageItem.product.priceString;
}

// 헬퍼: 구독 기간 포맷팅
export function formatDuration(packageItem: PurchasesPackage): string {
  const identifier = packageItem.identifier;

  if (identifier.includes('monthly')) {
    return '월간';
  } else if (identifier.includes('yearly') || identifier.includes('annual')) {
    return '연간';
  } else if (identifier.includes('weekly')) {
    return '주간';
  }

  return '';
}
