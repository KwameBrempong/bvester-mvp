import React from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  useUsageStats,
  useSubscriptionFeatures,
  useSubscriptionTier
} from '../store/hooks';
import { updateUsageCount } from '../store/slices/subscriptionSlice';

export interface UsageLimitResult {
  canProceed: boolean;
  isAtLimit: boolean;
  isNearLimit: boolean;
  remaining: number;
  limitMessage?: string;
  upgradeMessage?: string;
}

export interface UsageType {
  type: 'transactions' | 'reports' | 'users';
  action: 'create' | 'check';
  userId: string;
}

export const useUsageLimits = () => {
  const dispatch = useAppDispatch();
  const usage = useUsageStats();
  const features = useSubscriptionFeatures();
  const tier = useSubscriptionTier();

  const checkUsageLimit = (usageType: Omit<UsageType, 'action'>): UsageLimitResult => {
    const { type, userId } = usageType;

    let current: number;
    let limit: number;
    let featureName: string;

    switch (type) {
      case 'transactions':
        current = usage.transactions.current;
        limit = usage.transactions.limit;
        featureName = 'transactions';
        break;
      case 'reports':
        current = usage.reports.current;
        limit = usage.reports.limit;
        featureName = 'reports';
        break;
      case 'users':
        current = usage.users.current;
        limit = usage.users.limit;
        featureName = 'users';
        break;
      default:
        throw new Error(`Unknown usage type: ${type}`);
    }

    const isUnlimited = limit === 999999;
    const remaining = isUnlimited ? Infinity : Math.max(0, limit - current);
    const isAtLimit = !isUnlimited && current >= limit;
    const isNearLimit = !isUnlimited && current >= limit * 0.8; // 80% of limit

    let limitMessage: string | undefined;
    let upgradeMessage: string | undefined;

    if (isAtLimit) {
      limitMessage = `You've reached your ${featureName} limit of ${limit} for this month.`;

      if (tier === 'free') {
        upgradeMessage = `Upgrade to Pro for ${type === 'transactions' ? '500' : type === 'reports' ? '20' : '3'} ${featureName} per month, or Business for unlimited.`;
      } else if (tier === 'pro' && type === 'users') {
        upgradeMessage = `Upgrade to Business for 10 users.`;
      }
    } else if (isNearLimit) {
      limitMessage = `You're approaching your ${featureName} limit. ${remaining} ${featureName} remaining this month.`;
    }

    return {
      canProceed: !isAtLimit,
      isAtLimit,
      isNearLimit,
      remaining: isUnlimited ? Infinity : remaining,
      limitMessage,
      upgradeMessage
    };
  };

  const consumeUsage = async (usageType: Omit<UsageType, 'action'>, amount: number = 1): Promise<UsageLimitResult> => {
    const limitCheck = checkUsageLimit(usageType);

    if (!limitCheck.canProceed) {
      return limitCheck;
    }

    // Check if consumption would exceed limit
    if (!limitCheck.isAtLimit && limitCheck.remaining < amount) {
      return {
        ...limitCheck,
        canProceed: false,
        isAtLimit: true,
        limitMessage: `This action would exceed your ${usageType.type} limit. ${limitCheck.remaining} remaining.`,
      };
    }

    try {
      // Update usage count in the store
      await dispatch(updateUsageCount({
        userId: usageType.userId,
        type: usageType.type,
        increment: amount
      }));

      return {
        ...limitCheck,
        remaining: limitCheck.remaining === Infinity ? Infinity : limitCheck.remaining - amount
      };
    } catch (error) {
      console.error('Error updating usage count:', error);
      return {
        ...limitCheck,
        canProceed: false,
        limitMessage: 'Error updating usage. Please try again.'
      };
    }
  };

  const getUsageWarningComponent = (limitResult: UsageLimitResult) => {
    if (!limitResult.limitMessage) return null;

    const warningStyle = {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid',
      backgroundColor: limitResult.isAtLimit ? '#fff5f5' : '#fff8e1',
      borderColor: limitResult.isAtLimit ? '#ffcdd2' : '#ffecb3',
      color: limitResult.isAtLimit ? '#d32f2f' : '#f57c00'
    };

    return (
      <div style={warningStyle}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          {limitResult.isAtLimit ? '⚠️ Limit Reached' : '⚠️ Usage Warning'}
        </div>
        <div style={{ fontSize: '14px', marginBottom: limitResult.upgradeMessage ? '8px' : '0' }}>
          {limitResult.limitMessage}
        </div>
        {limitResult.upgradeMessage && (
          <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
            {limitResult.upgradeMessage}
          </div>
        )}
      </div>
    );
  };

  return {
    checkUsageLimit,
    consumeUsage,
    getUsageWarningComponent,
    usage,
    features,
    tier
  };
};