import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for common state selections
export const useUser = () => {
  return useAppSelector((state) => state.user);
};

export const useTransactions = () => {
  return useAppSelector((state) => state.transactions);
};

export const useSubscription = () => {
  return useAppSelector((state) => state.subscription);
};

export const useAssessment = () => {
  return useAppSelector((state) => state.assessment);
};

export const useUI = () => {
  return useAppSelector((state) => state.ui);
};

// Feature flag hooks
export const useFeatures = () => {
  return useAppSelector((state) => state.subscription.features);
};

// Legacy transaction limit hook - keeping for backward compatibility
export const useLegacyTransactionLimit = () => {
  const features = useFeatures();
  const transactions = useTransactions();

  return {
    hasUnlimitedTransactions: features.hasUnlimitedTransactions,
    currentCount: transactions.transactions.length,
    limit: transactions.transactionLimit,
    hasReachedLimit: transactions.hasReachedLimit,
    remaining: Math.max(0, transactions.transactionLimit - transactions.transactions.length),
  };
};

// Loading state hooks
export const useLoading = (key?: string) => {
  return useAppSelector((state) => {
    if (key) {
      return state.ui.loadingStates[key] || false;
    }
    return state.ui.globalLoading;
  });
};

// Error handling hooks
export const useErrors = () => {
  return useAppSelector((state) => state.ui.errors);
};

export const useLatestError = () => {
  const errors = useErrors();
  return errors.length > 0 ? errors[errors.length - 1] : null;
};

// Enhanced user hooks for Phase 1 features
export const useUserPermissions = () => {
  return useAppSelector((state) => state.user.permissions);
};

export const useProfileCompletion = () => {
  return useAppSelector((state) => state.user.profileCompletion);
};

export const useUserRole = () => {
  const user = useUser();
  return user.profile?.role || null;
};

export const useVerificationStatus = () => {
  const user = useUser();
  return {
    email: user.profile?.isEmailVerified || false,
    phone: user.profile?.isPhoneVerified || false,
    business: user.profile?.isBusinessVerified || false,
  };
};

// Permission checking hooks
export const useHasPermission = (permission: string) => {
  const permissions = useUserPermissions();
  return permissions.includes(permission as any);
};

export const useHasAnyPermission = (permissionList: string[]) => {
  const permissions = useUserPermissions();
  return permissionList.some(permission => permissions.includes(permission as any));
};

export const useRequiresProfileCompletion = (minimumPercentage: number = 80) => {
  const profileCompletion = useProfileCompletion();
  return {
    isComplete: profileCompletion.percentage >= minimumPercentage,
    percentage: profileCompletion.percentage,
    missingFields: profileCompletion.missingFields,
    required: minimumPercentage,
  };
};

// Enhanced subscription hooks for Phase 2
export const useSubscriptionTier = () => {
  return useAppSelector((state) => state.subscription.tier);
};

export const useSubscriptionFeatures = () => {
  return useAppSelector((state) => state.subscription.features);
};

export const useUsageStats = () => {
  return useAppSelector((state) => state.subscription.usage);
};

export const useBillingInfo = () => {
  return useAppSelector((state) => state.subscription.billing);
};

export const usePaymentHistory = () => {
  return useAppSelector((state) => state.subscription.paymentHistory);
};

export const useSubscriptionLoading = () => {
  return useAppSelector((state) => state.subscription.loading);
};

export const useSubscriptionErrors = () => {
  return useAppSelector((state) => state.subscription.errors);
};

// Combined usage limit hooks
export const useTransactionLimit = () => {
  const transactionUsage = useAppSelector((state) => state.subscription.usage.transactions);
  const features = useSubscriptionFeatures();

  return {
    current: transactionUsage.current,
    limit: transactionUsage.limit,
    remaining: transactionUsage.remaining,
    hasReachedLimit: transactionUsage.hasReachedLimit,
    hasUnlimitedTransactions: features.hasUnlimitedTransactions,
    percentage: transactionUsage.limit > 0 ? Math.round((transactionUsage.current / transactionUsage.limit) * 100) : 0,
  };
};

export const useReportLimit = () => {
  const reportUsage = useAppSelector((state) => state.subscription.usage.reports);

  return {
    current: reportUsage.current,
    limit: reportUsage.limit,
    remaining: reportUsage.remaining,
    hasReachedLimit: reportUsage.hasReachedLimit,
    percentage: reportUsage.limit > 0 ? Math.round((reportUsage.current / reportUsage.limit) * 100) : 0,
  };
};

export const useUserLimit = () => {
  const userUsage = useAppSelector((state) => state.subscription.usage.users);

  return {
    current: userUsage.current,
    limit: userUsage.limit,
    remaining: userUsage.remaining,
    hasReachedLimit: userUsage.hasReachedLimit,
    percentage: userUsage.limit > 0 ? Math.round((userUsage.current / userUsage.limit) * 100) : 0,
  };
};

// Feature access hooks
export const useCanExportData = () => {
  const features = useSubscriptionFeatures();
  return features.canExportData;
};

export const useHasAdvancedAnalytics = () => {
  const features = useSubscriptionFeatures();
  return features.hasAdvancedAnalytics;
};

export const useHasAcceleratorAccess = () => {
  const features = useSubscriptionFeatures();
  return features.hasAcceleratorAccess;
};

export const useHasPhoneSupport = () => {
  const features = useSubscriptionFeatures();
  return features.hasPhoneSupport;
};

// Subscription status hooks
export const useSubscriptionStatus = () => {
  const subscription = useAppSelector((state) => state.subscription);

  return {
    tier: subscription.tier,
    isActive: subscription.isActive,
    isPaid: subscription.tier !== 'free',
    cancelAtPeriodEnd: subscription.billing.cancelAtPeriodEnd,
    currentPeriodEnd: subscription.billing.currentPeriodEnd,
    expiresIn: subscription.billing.currentPeriodEnd
      ? Math.max(0, Math.ceil((new Date(subscription.billing.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null,
  };
};