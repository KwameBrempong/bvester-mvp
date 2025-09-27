import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  subscriptionService,
  UserSubscription,
  paymentEventService,
  transactionService,
  assessmentService,
} from '../../services/dataService';
import { stripeService } from '../../stripeService';
import { rbacService } from '../../services/rbacService';
import { logger } from '../../config/environment';

export type SubscriptionTier = 'starter' | 'growth' | 'accelerate';
export type AcceleratorAccess = 'none' | 'enrolled' | 'completed';

interface SubscriptionFeatures {
  maxTransactions: number;
  maxReports: number;
  maxUsers: number;
  hasUnlimitedTransactions: boolean;
  canExportData: boolean;
  hasAdvancedAnalytics: boolean;
  hasAcceleratorAccess: boolean;
  hasPhoneSupport: boolean;
  hasCustomBranding: boolean;
}

interface UsageStats {
  transactions: {
    current: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
  reports: {
    current: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
  users: {
    current: number;
    limit: number;
    remaining: number;
    hasReachedLimit: boolean;
  };
}

interface BillingInfo {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  totalPaid: number;
  lastPaymentDate?: string;
  nextPaymentAmount?: number;
  nextPaymentDate?: string;
}

interface SubscriptionState {
  // Core subscription data
  subscription: UserSubscription | null;
  tier: SubscriptionTier;
  isActive: boolean;
  features: SubscriptionFeatures;

  // Usage tracking
  usage: UsageStats;

  // Billing information
  billing: BillingInfo;

  // Payment history
  paymentHistory: Array<{
    id: string;
    type: string;
    amount?: number;
    status: 'pending' | 'succeeded' | 'failed';
    timestamp: string;
    description: string;
  }>;

  // Loading states
  loading: {
    subscription: boolean;
    payment: boolean;
    usage: boolean;
    billing: boolean;
  };

  // Error handling
  errors: {
    subscription?: string;
    payment?: string;
    usage?: string;
    billing?: string;
  };

  // Sync information
  lastSync: string | null;
}

// Helper functions
const getFeaturesByTier = (tier: SubscriptionTier): SubscriptionFeatures => {
  const featureAccess = rbacService.getFeatureAccess(tier);
  return {
    maxTransactions: featureAccess.maxTransactions,
    maxReports: featureAccess.maxReports,
    maxUsers: featureAccess.maxUsers,
    hasUnlimitedTransactions: featureAccess.maxTransactions === Infinity,
    canExportData: featureAccess.canExportData,
    hasAdvancedAnalytics: featureAccess.hasAdvancedAnalytics,
    hasAcceleratorAccess: featureAccess.hasAcceleratorAccess,
    hasPhoneSupport: featureAccess.hasPhoneSupport,
    hasCustomBranding: featureAccess.hasCustomBranding,
  };
};

const calculateUsageStats = (tier: SubscriptionTier, currentUsage: { transactions: number; reports: number; users: number }): UsageStats => {
  const features = getFeaturesByTier(tier);

  return {
    transactions: {
      current: currentUsage.transactions,
      limit: features.maxTransactions === Infinity ? 999999 : features.maxTransactions,
      remaining: features.maxTransactions === Infinity ? 999999 : Math.max(0, features.maxTransactions - currentUsage.transactions),
      hasReachedLimit: features.maxTransactions !== Infinity && currentUsage.transactions >= features.maxTransactions,
    },
    reports: {
      current: currentUsage.reports,
      limit: features.maxReports === Infinity ? 999999 : features.maxReports,
      remaining: features.maxReports === Infinity ? 999999 : Math.max(0, features.maxReports - currentUsage.reports),
      hasReachedLimit: features.maxReports !== Infinity && currentUsage.reports >= features.maxReports,
    },
    users: {
      current: currentUsage.users,
      limit: features.maxUsers,
      remaining: Math.max(0, features.maxUsers - currentUsage.users),
      hasReachedLimit: currentUsage.users >= features.maxUsers,
    },
  };
};

const initialState: SubscriptionState = {
  subscription: null,
  tier: 'starter',
  isActive: false,
  features: getFeaturesByTier('starter'),
  usage: calculateUsageStats('starter', { transactions: 0, reports: 0, users: 1 }),
  billing: {
    cancelAtPeriodEnd: false,
    totalPaid: 0,
  },
  paymentHistory: [],
  loading: {
    subscription: false,
    payment: false,
    usage: false,
    billing: false,
  },
  errors: {},
  lastSync: null,
};

// Async thunks
export const fetchSubscription = createAsyncThunk(
  'subscription/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      logger.info('Fetching subscription', { userId });

      // Get both database and Stripe status
      const [dbSubscription, stripeStatus] = await Promise.all([
        subscriptionService.get(userId),
        stripeService.getSubscriptionStatus(userId)
      ]);

      // If no database subscription exists, create one
      if (!dbSubscription) {
        const newSubscription = await subscriptionService.create({
          userId,
          platformTier: 'starter',
          acceleratorAccess: 'none',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
        return newSubscription;
      }

      // Update with latest Stripe data if available
      if (stripeStatus.isActive !== undefined) {
        const updatedSubscription = await subscriptionService.update(userId, {
          platformTier: stripeStatus.isActive ?
            (stripeStatus.plan as 'growth' | 'accelerate') || 'starter' : 'starter',
          platformExpiryDate: stripeStatus.currentPeriodEnd ?
            new Date(stripeStatus.currentPeriodEnd * 1000).toISOString() : undefined,
          cancelAtPeriodEnd: stripeStatus.cancelAtPeriodEnd,
        });
        return updatedSubscription;
      }

      return dbSubscription;
    } catch (error) {
      logger.error('Failed to fetch subscription', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/update',
  async ({ userId, updates }: { userId: string; updates: Partial<UserSubscription> }, { rejectWithValue }) => {
    try {
      logger.info('Updating subscription', { userId });
      const subscription = await subscriptionService.update(userId, updates);
      return subscription;
    } catch (error) {
      logger.error('Failed to update subscription', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update subscription');
    }
  }
);

export const syncWithStripe = createAsyncThunk(
  'subscription/syncWithStripe',
  async (userId: string, { rejectWithValue, dispatch }) => {
    try {
      logger.info('Syncing with Stripe', { userId });

      // Get fresh Stripe status
      const stripeStatus = await stripeService.getSubscriptionStatus(userId);

      // Update database with Stripe data
      if (stripeStatus.isActive !== undefined) {
        const platformTier: 'starter' | 'growth' | 'accelerate' = stripeStatus.isActive ?
          (stripeStatus.plan === 'growth' || stripeStatus.plan === 'accelerate' ? stripeStatus.plan : 'starter') : 'starter';

        const updates = {
          platformTier,
          platformExpiryDate: stripeStatus.currentPeriodEnd ?
            new Date(stripeStatus.currentPeriodEnd * 1000).toISOString() : undefined,
          cancelAtPeriodEnd: stripeStatus.cancelAtPeriodEnd,
        };

        await dispatch(updateSubscription({ userId, updates }));
      }

      return new Date().toISOString(); // Return sync timestamp
    } catch (error) {
      logger.error('Failed to sync with Stripe', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync with Stripe');
    }
  }
);

// New enhanced async thunks for Phase 2
export const updateUsageCount = createAsyncThunk(
  'subscription/updateUsage',
  async ({ userId, type, increment = 1 }: { userId: string; type: 'transactions' | 'reports' | 'users'; increment?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { subscription: SubscriptionState };
      const currentUsage = state.subscription.usage[type];

      if (currentUsage.current + increment > currentUsage.limit && currentUsage.limit !== 999999) {
        throw new Error(`${type} limit exceeded. Current: ${currentUsage.current}, Limit: ${currentUsage.limit}`);
      }

      logger.info('Updating usage count', { userId, type, increment });

      return {
        type,
        increment,
        newCurrent: currentUsage.current + increment,
      };
    } catch (error) {
      logger.error('Failed to update usage', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update usage');
    }
  }
);

export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckoutSession',
  async (params: {
    priceId: string;
    userId: string;
    customerEmail: string;
    planType: 'growth' | 'accelerate';
    billingPeriod: 'monthly' | 'yearly';
  }, { rejectWithValue }) => {
    try {
      logger.info('Creating checkout session', params);

      await stripeService.createCheckoutSession({
        ...params,
        successUrl: `${window.location.origin}/subscription-success?plan=${params.planType}&period=${params.billingPeriod}`,
        cancelUrl: `${window.location.origin}/subscription-cancelled`,
        metadata: {
          planType: params.planType,
          billingPeriod: params.billingPeriod,
          userId: params.userId,
        }
      });

      return params;
    } catch (error) {
      logger.error('Failed to create checkout session', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create checkout session');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async ({ userId, subscriptionId }: { userId: string; subscriptionId: string }, { rejectWithValue }) => {
    try {
      logger.info('Cancelling subscription', { userId, subscriptionId });

      const success = await stripeService.cancelSubscription(subscriptionId);
      if (!success) {
        throw new Error('Failed to cancel subscription with Stripe');
      }

      // Update local database
      await subscriptionService.update(userId, {
        cancelAtPeriodEnd: true,
      });

      return { userId, subscriptionId };
    } catch (error) {
      logger.error('Failed to cancel subscription', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to cancel subscription');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'subscription/fetchPaymentHistory',
  async (userId: string, { rejectWithValue }) => {
    try {
      logger.info('Fetching payment history', { userId });

      // Note: This is a placeholder. The actual implementation would depend on
      // how paymentEventService.list is implemented in the dataService
      const events: any[] = []; // Placeholder for payment events

      return events.length > 0 ? events.map(event => ({
        id: event.eventId,
        type: event.eventType,
        amount: event.amount,
        status: event.processed ? 'succeeded' as const : 'pending' as const,
        timestamp: event.createdAt,
        description: `${event.eventType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
      })) : [];
    } catch (error) {
      logger.error('Failed to fetch payment history', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch payment history');
    }
  }
);

export const refreshUsageStats = createAsyncThunk(
  'subscription/refreshUsageStats',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      logger.info('Refreshing usage statistics', { userId });

      let transactionsCount = 0;
      let reportsCount = 0;

      try {
        const [transactions, assessments] = await Promise.all([
          transactionService.list(userId, 500),
          assessmentService.list(userId),
        ]);

        transactionsCount = transactions.length;
        reportsCount = assessments.length;
      } catch (dataError) {
        logger.warn('Unable to fetch remote usage stats, falling back to cached values', dataError);

        if (typeof window !== 'undefined') {
          const cachedTransactions = window.localStorage.getItem(`transactions_${userId}`);
          if (cachedTransactions) {
            try {
              transactionsCount = JSON.parse(cachedTransactions).length;
            } catch (parseError) {
              logger.warn('Failed to parse cached transactions for usage stats', parseError);
            }
          }

          const cachedAssessments = window.localStorage.getItem(`assessment_${userId}`);
          if (cachedAssessments) {
            reportsCount = 1;
          }
        }
      }

      const currentUsage = {
        transactions: transactionsCount,
        reports: reportsCount,
        users: 1,
      };

      const state = getState() as { subscription: SubscriptionState };
      const tier = state.subscription.tier;

      return calculateUsageStats(tier, currentUsage);
    } catch (error) {
      logger.error('Failed to refresh usage stats', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to refresh usage stats');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = {};
    },

    setTier: (state, action: PayloadAction<SubscriptionTier>) => {
      state.tier = action.payload;
      state.isActive = action.payload !== 'starter';
      state.features = getFeaturesByTier(action.payload);

      // Recalculate usage stats with new limits
      const currentUsage = {
        transactions: state.usage.transactions.current,
        reports: state.usage.reports.current,
        users: state.usage.users.current,
      };
      state.usage = calculateUsageStats(action.payload, currentUsage);
    },

    updateFeatures: (state) => {
      if (!state.subscription) return;

      const tier = state.subscription.platformTier;
      const acceleratorAccess = state.subscription.acceleratorAccess;

      state.tier = tier;
      state.isActive = tier !== 'starter';
      state.features = getFeaturesByTier(tier);

      // Update usage limits
      const currentUsage = {
        transactions: state.usage.transactions.current,
        reports: state.usage.reports.current,
        users: state.usage.users.current,
      };
      state.usage = calculateUsageStats(tier, currentUsage);
    },

    enrollInAccelerator: (state, action: PayloadAction<{
      enrollmentDate: string;
      paymentType: 'full' | 'installment'
    }>) => {
      if (state.subscription) {
        state.subscription.acceleratorAccess = 'enrolled';
        state.subscription.acceleratorEnrollmentDate = action.payload.enrollmentDate;
        state.subscription.acceleratorPaymentType = action.payload.paymentType;

        // Update features
        subscriptionSlice.caseReducers.updateFeatures(state);
      }
    },

    addPaymentEvent: (state, action: PayloadAction<SubscriptionState['paymentHistory'][0]>) => {
      state.paymentHistory.unshift(action.payload);

      // Keep only the last 50 events
      if (state.paymentHistory.length > 50) {
        state.paymentHistory = state.paymentHistory.slice(0, 50);
      }
    },

    incrementUsage: (state, action: PayloadAction<{ type: 'transactions' | 'reports' | 'users'; increment?: number }>) => {
      const { type, increment = 1 } = action.payload;
      const usage = state.usage[type];

      if (usage.current + increment <= usage.limit || usage.limit === 999999) {
        usage.current += increment;
        usage.remaining = usage.limit === 999999 ? 999999 : Math.max(0, usage.limit - usage.current);
        usage.hasReachedLimit = usage.limit !== 999999 && usage.current >= usage.limit;
      }
    },

    resetUsageForPeriod: (state, action: PayloadAction<{ type?: 'transactions' | 'reports' | 'users' }>) => {
      const { type } = action.payload;

      if (type) {
        // Reset specific usage type
        state.usage[type].current = 0;
        state.usage[type].remaining = state.usage[type].limit === 999999 ? 999999 : state.usage[type].limit;
        state.usage[type].hasReachedLimit = false;
      } else {
        // Reset all usage
        Object.keys(state.usage).forEach((key) => {
          const usageType = key as keyof UsageStats;
          state.usage[usageType].current = 0;
          state.usage[usageType].remaining = state.usage[usageType].limit === 999999 ? 999999 : state.usage[usageType].limit;
          state.usage[usageType].hasReachedLimit = false;
        });
      }
    },

    updateBillingInfo: (state, action: PayloadAction<Partial<BillingInfo>>) => {
      state.billing = { ...state.billing, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Fetch subscription
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading.subscription = true;
        delete state.errors.subscription;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading.subscription = false;
        state.subscription = action.payload;
        state.lastSync = new Date().toISOString();
        // Update feature flags
        subscriptionSlice.caseReducers.updateFeatures(state);
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading.subscription = false;
        state.errors.subscription = action.payload as string;
      });

    // Update subscription
    builder
      .addCase(updateSubscription.pending, (state) => {
        state.loading.subscription = true;
        delete state.errors.subscription;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading.subscription = false;
        state.subscription = action.payload;
        state.lastSync = new Date().toISOString();
        // Update feature flags
        subscriptionSlice.caseReducers.updateFeatures(state);
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading.subscription = false;
        state.errors.subscription = action.payload as string;
      });

    // Sync with Stripe
    builder
      .addCase(syncWithStripe.pending, (state) => {
        state.loading.subscription = true;
      })
      .addCase(syncWithStripe.fulfilled, (state, action) => {
        state.loading.subscription = false;
        state.lastSync = action.payload;
      })
      .addCase(syncWithStripe.rejected, (state, action) => {
        state.loading.subscription = false;
        state.errors.subscription = action.payload as string;
      });

    // Update usage count
    builder
      .addCase(updateUsageCount.pending, (state) => {
        state.loading.usage = true;
        delete state.errors.usage;
      })
      .addCase(updateUsageCount.fulfilled, (state, action) => {
        state.loading.usage = false;
        const { type, newCurrent } = action.payload;

        state.usage[type].current = newCurrent;
        state.usage[type].remaining = state.usage[type].limit === 999999 ? 999999 : Math.max(0, state.usage[type].limit - newCurrent);
        state.usage[type].hasReachedLimit = state.usage[type].limit !== 999999 && newCurrent >= state.usage[type].limit;
      })
      .addCase(updateUsageCount.rejected, (state, action) => {
        state.loading.usage = false;
        state.errors.usage = action.payload as string;
      });

    // Create checkout session
    builder
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading.payment = true;
        delete state.errors.payment;
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.loading.payment = false;
        // Note: Actual subscription update will happen via webhook
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading.payment = false;
        state.errors.payment = action.payload as string;
      });

    // Cancel subscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading.subscription = true;
        delete state.errors.subscription;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading.subscription = false;
        state.billing.cancelAtPeriodEnd = true;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading.subscription = false;
        state.errors.subscription = action.payload as string;
      });

    // Fetch payment history
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading.billing = true;
        delete state.errors.billing;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading.billing = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading.billing = false;
        state.errors.billing = action.payload as string;
      });

    // Refresh usage stats
    builder
      .addCase(refreshUsageStats.pending, (state) => {
        state.loading.usage = true;
        delete state.errors.usage;
      })
      .addCase(refreshUsageStats.fulfilled, (state, action) => {
        state.loading.usage = false;
        state.usage = action.payload;
      })
      .addCase(refreshUsageStats.rejected, (state, action) => {
        state.loading.usage = false;
        state.errors.usage = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  setTier,
  updateFeatures,
  enrollInAccelerator,
  addPaymentEvent,
  incrementUsage,
  resetUsageForPeriod,
  updateBillingInfo,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
