import { useState, useEffect, useCallback } from 'react';
import { stripeService } from './stripeService';
import { subscriptionService, migrationService } from './services/dataService';
import { notify } from './utils/notifications';
import { logger } from './config/environment';

interface UserSubscription {
  platformTier: 'starter' | 'growth' | 'accelerate';
  acceleratorAccess: 'none' | 'enrolled' | 'completed';
  platformExpiryDate?: string;
  acceleratorEnrollmentDate?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  cancelAtPeriodEnd?: boolean;
}

export const useSubscription = (username?: string) => {
  const [subscription, setSubscription] = useState<UserSubscription>({
    platformTier: 'starter',
    acceleratorAccess: 'none'
  });
  const [loading, setLoading] = useState(false);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!username) return;

    setLoading(true);
    try {
      logger.info('Fetching subscription status', { username });

      // Get subscription status from secure service
      const stripeStatus = await stripeService.getSubscriptionStatus(username);

      // Get database subscription data (with fallback for MVP)
      let dbSubscription;
      try {
        dbSubscription = await subscriptionService.get(username);
      } catch (error) {
        logger.warn('Database subscription service unavailable, using localStorage fallback', error);
        dbSubscription = null;
      }

      // Create default subscription if none exists
      let currentSubscription: UserSubscription;

      if (!dbSubscription) {
        currentSubscription = {
          platformTier: 'starter',
          acceleratorAccess: 'none'
        };

        // Try to create in database, but continue if it fails (MVP mode)
        try {
          await subscriptionService.create({
            userId: username,
            platformTier: 'starter',
            acceleratorAccess: 'none',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          logger.warn('Could not create subscription in database, continuing in localStorage mode', error);
        }
      } else {
        currentSubscription = {
          platformTier: dbSubscription.platformTier,
          acceleratorAccess: dbSubscription.acceleratorAccess,
          platformExpiryDate: dbSubscription.platformExpiryDate,
          stripeSubscriptionId: dbSubscription.stripeSubscriptionId,
          stripeCustomerId: dbSubscription.stripeCustomerId,
          cancelAtPeriodEnd: dbSubscription.cancelAtPeriodEnd,
        };
      }

      // Update with fresh Stripe data if available
      if (stripeStatus.isActive !== undefined) {
        const updatedSubscription: UserSubscription = {
          ...currentSubscription,
          platformTier: stripeStatus.isActive ?
            (stripeStatus.plan as 'growth' | 'accelerate') || 'starter' : 'starter',
          platformExpiryDate: stripeStatus.currentPeriodEnd ?
            new Date(stripeStatus.currentPeriodEnd * 1000).toISOString() : undefined,
          cancelAtPeriodEnd: stripeStatus.cancelAtPeriodEnd,
        };

        // Handle subscription expiry
        if (updatedSubscription.platformExpiryDate) {
          const expiryDate = new Date(updatedSubscription.platformExpiryDate);
          const now = new Date();

          if (now > expiryDate && !stripeStatus.isActive) {
            updatedSubscription.platformTier = 'starter';
            updatedSubscription.platformExpiryDate = undefined;
            updatedSubscription.stripeSubscriptionId = undefined;
            updatedSubscription.cancelAtPeriodEnd = false;
          }
        }

        // Update database (with fallback for MVP)
        try {
          await subscriptionService.update(username, {
            platformTier: updatedSubscription.platformTier,
            platformExpiryDate: updatedSubscription.platformExpiryDate,
            cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
            stripeSubscriptionId: updatedSubscription.stripeSubscriptionId,
            stripeCustomerId: updatedSubscription.stripeCustomerId,
          });
        } catch (error) {
          logger.warn('Could not update subscription in database, continuing in localStorage mode', error);
        }

        setSubscription(updatedSubscription);

        // Also update localStorage for backward compatibility during transition
        localStorage.setItem(`subscription_${username}`, JSON.stringify(updatedSubscription));
      } else {
        setSubscription(currentSubscription);
      }

    } catch (error) {
      logger.error('Failed to fetch subscription status', error);

      // Fallback to localStorage for backward compatibility
      const saved = localStorage.getItem(`subscription_${username}`);
      if (saved) {
        try {
          const parsedSubscription = JSON.parse(saved);

          // Check if platform subscription is expired (fallback)
          if (parsedSubscription.platformExpiryDate) {
            const expiryDate = new Date(parsedSubscription.platformExpiryDate);
            const now = new Date();

            if (now > expiryDate) {
              parsedSubscription.platformTier = 'starter';
              parsedSubscription.platformExpiryDate = undefined;
              parsedSubscription.stripeSubscriptionId = undefined;
              parsedSubscription.cancelAtPeriodEnd = false;
            }
          }

          setSubscription(parsedSubscription);
        } catch (parseError) {
          logger.error('Error parsing localStorage subscription data', parseError);
          // Set default subscription
          setSubscription({
            platformTier: 'starter',
            acceleratorAccess: 'none'
          });
        }
      } else {
        // Set default subscription
        setSubscription({
          platformTier: 'starter',
          acceleratorAccess: 'none'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Initialize subscription when username changes
  useEffect(() => {
    if (username) {
      // Create an async function inside useEffect to avoid dependency issues
      const initializeSubscription = async () => {
        try {
          // For MVP mode, skip migration if service unavailable
          if (migrationService && typeof migrationService.migrateUserData === 'function') {
            await migrationService.migrateUserData(username);
          } else {
            logger.info('Migration service not available, skipping data migration for MVP mode');
          }
          // Then fetch current status
          fetchSubscriptionStatus();
        } catch (error) {
          logger.warn('Error during subscription initialization, continuing in fallback mode:', error);
          // Continue without migration in MVP mode
          fetchSubscriptionStatus();
        }
      };

      initializeSubscription();
    }
  }, [username]); // Remove fetchSubscriptionStatus from dependencies

  const updateSubscription = (newSubscription: UserSubscription) => {
    setSubscription(newSubscription);
    if (username) {
      localStorage.setItem(`subscription_${username}`, JSON.stringify(newSubscription));
    }
  };

  // Handle successful Stripe webhook updates
  const handleStripeWebhookUpdate = (webhookData: {
    userId: string;
    subscriptionStatus: 'active' | 'inactive';
    plan: 'growth' | 'accelerate' | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
  }) => {
    if (webhookData.userId === username) {
      const updatedSubscription: UserSubscription = {
        ...subscription,
        platformTier: webhookData.subscriptionStatus === 'active' && webhookData.plan ? 
          webhookData.plan : 'starter',
        platformExpiryDate: webhookData.currentPeriodEnd ? 
          new Date(webhookData.currentPeriodEnd * 1000).toISOString() : undefined,
        cancelAtPeriodEnd: webhookData.cancelAtPeriodEnd,
        stripeSubscriptionId: webhookData.stripeSubscriptionId,
        stripeCustomerId: webhookData.stripeCustomerId
      };
      
      updateSubscription(updatedSubscription);
    }
  };

  // Handle accelerator enrollment
  const enrollInAccelerator = (enrollmentData: {
    enrollmentDate: string;
    paymentType: 'full' | 'installment';
  }) => {
    const updatedSubscription: UserSubscription = {
      ...subscription,
      acceleratorAccess: 'enrolled',
      acceleratorEnrollmentDate: enrollmentData.enrollmentDate
    };
    
    updateSubscription(updatedSubscription);
  };

  // Feature access checks (keeping your existing logic)
  const hasUnlimitedTransactions = () => {
    return subscription.platformTier !== 'starter';
  };

  const hasDetailedReports = () => {
    return subscription.platformTier !== 'starter';
  };

  const hasAcceleratorAccess = () => {
    return subscription.acceleratorAccess !== 'none';
  };

  const hasAdvancedAnalytics = () => {
    return subscription.platformTier === 'accelerate';
  };

  const getTransactionLimit = () => {
    return subscription.platformTier === 'starter' ? 20 : Infinity;
  };

  const canAccessFeature = (feature: string) => {
    switch (feature) {
      case 'unlimited_transactions':
        return hasUnlimitedTransactions();
      case 'detailed_reports':
        return hasDetailedReports();
      case 'accelerator_access':
        return hasAcceleratorAccess();
      case 'advanced_analytics':
        return hasAdvancedAnalytics();
      default:
        return true; // Basic features available to all
    }
  };

  // Additional helper methods for Stripe integration
  const openCustomerPortal = async () => {
    if (subscription.stripeCustomerId) {
      try {
        const portalUrl = await stripeService.createCustomerPortalSession(
          subscription.stripeCustomerId,
          window.location.origin
        );
        if (portalUrl) {
          window.open(portalUrl, '_blank');
        }
      } catch (error) {
        console.error('Failed to open customer portal:', error);
        notify.error('Unable to open billing portal. Please contact support.', 'Portal Error');
      }
    }
  };

  const refreshSubscriptionStatus = () => {
    fetchSubscriptionStatus();
  };

  return {
    subscription,
    loading,
    updateSubscription,
    hasUnlimitedTransactions,
    hasDetailedReports,
    hasAcceleratorAccess,
    hasAdvancedAnalytics,
    getTransactionLimit,
    canAccessFeature,
    isPaidUser: subscription.platformTier !== 'starter',
    isAcceleratorUser: subscription.acceleratorAccess !== 'none',
    // New Stripe-specific methods
    handleStripeWebhookUpdate,
    enrollInAccelerator,
    openCustomerPortal,
    refreshSubscriptionStatus,
    fetchSubscriptionStatus
  };
};