import { useState, useEffect, useCallback } from 'react';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import {
  checkSubscriptionStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  formatPrice,
  formatDuration,
} from '../lib/purchases';

export interface SubscriptionState {
  isPremium: boolean;
  isPremiumPlus: boolean;
  activeSubscription: 'free' | 'premium' | 'premium_plus';
  offerings: PurchasesOffering | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    isPremiumPlus: false,
    activeSubscription: 'free',
    offerings: null,
    loading: true,
    error: null,
  });

  const loadSubscriptionData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [status, offerings] = await Promise.all([
        checkSubscriptionStatus(),
        getOfferings(),
      ]);

      setState({
        isPremium: status.isPremium,
        isPremiumPlus: status.isPremiumPlus,
        activeSubscription: (status.activeSubscription as 'free' | 'premium' | 'premium_plus') || 'free',
        offerings,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load subscription data',
      }));
    }
  }, []);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const purchase = useCallback(async (packageItem: PurchasesPackage) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const customerInfo = await purchasePackage(packageItem);

      if (customerInfo) {
        // 구매 성공 - 상태 새로고침
        await loadSubscriptionData();
        return true;
      }

      // 사용자 취소
      setState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Purchase failed',
      }));
      return false;
    }
  }, [loadSubscriptionData]);

  const restore = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await restorePurchases();
      await loadSubscriptionData();
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Restore failed',
      }));
      return false;
    }
  }, [loadSubscriptionData]);

  const getPackageInfo = useCallback((packageItem: PurchasesPackage) => {
    return {
      price: formatPrice(packageItem),
      duration: formatDuration(packageItem),
      identifier: packageItem.identifier,
      product: packageItem.product,
    };
  }, []);

  return {
    ...state,
    purchase,
    restore,
    refresh: loadSubscriptionData,
    getPackageInfo,
  };
}
