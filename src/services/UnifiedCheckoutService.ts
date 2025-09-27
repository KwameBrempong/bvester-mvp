/**
 * Unified Checkout Service
 * Single service to handle ALL subscription checkout flows
 * Eliminates duplicate code and ensures consistent behavior
 */

import { stripeService } from '../stripeService';
import { getStripePriceId, validateStripeConfiguration, STRIPE_CONFIG } from '../config/stripeConfig';
import { getUserFriendlyError, logError } from '../utils/errorMessages';

export interface CheckoutParams {
  email: string;
  tierId: 'growth' | 'accelerate';
  billing?: 'monthly' | 'annual';
  isFoundingMember?: boolean;
  userId?: string;  // Optional for guest checkout
  returnUrl?: string;  // Where to go after checkout
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
  mode: 'guest' | 'authenticated';
}

class UnifiedCheckoutService {
  /**
   * Create a checkout session for any scenario
   * This handles:
   * - Guest checkout from homepage
   * - Authenticated upgrade from dashboard
   * - Email campaign links
   * - Admin-initiated upgrades
   */
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const startTime = Date.now();

    try {
      // Validate configuration first
      const configValidation = validateStripeConfiguration();
      if (!configValidation.isValid) {
        logError('UnifiedCheckout', new Error('Invalid Stripe configuration'), {
          errors: configValidation.errors
        });
        throw new Error('SUB_PRICE_NOT_FOUND');
      }

      // Destructure params with defaults
      const {
        email,
        tierId,
        billing = 'monthly',
        isFoundingMember = true,  // Default to founding member pricing
        userId,
        returnUrl = window.location.origin
      } = params;

      // Validate required fields
      if (!email) {
        throw new Error('SUB_NO_EMAIL');
      }

      // Get the correct price ID
      const priceId = getStripePriceId(tierId, billing, isFoundingMember);

      if (!priceId) {
        // Special handling for accelerate founding member
        if (tierId === 'accelerate' && isFoundingMember) {
          logError('UnifiedCheckout', new Error('Accelerate founding member price not configured'), {
            tierId,
            billing,
            isFoundingMember
          });
          throw new Error('Founding member pricing for Accelerate tier is coming soon! Please use regular pricing.');
        }
        throw new Error('SUB_PRICE_NOT_FOUND');
      }

      // Determine checkout mode
      const isGuestCheckout = !userId;
      const checkoutUserId = userId || `guest_${Date.now()}`;

      console.log('🎯 Creating unified checkout session:', {
        email,
        tierId,
        billing,
        isFoundingMember,
        mode: isGuestCheckout ? 'guest' : 'authenticated',
        priceId
      });

      // Build success and cancel URLs
      const successUrl = isGuestCheckout
        ? `${returnUrl}/signup-success?session_id={CHECKOUT_SESSION_ID}&tier=${tierId}`
        : `${returnUrl}/dashboard?upgraded=true&session_id={CHECKOUT_SESSION_ID}`;

      const cancelUrl = isGuestCheckout
        ? `${returnUrl}?cancelled=true`
        : `${returnUrl}/dashboard/billing?cancelled=true`;

      // Create checkout session parameters
      const checkoutParams = {
        priceId,
        userId: checkoutUserId,
        customerEmail: email,
        successUrl,
        cancelUrl,
        metadata: {
          tierId,
          billing,
          isGuestCheckout: String(isGuestCheckout),
          isFoundingMember: String(isFoundingMember),
          source: isGuestCheckout ? 'homepage' : 'dashboard',
          createdAt: new Date().toISOString()
        }
      };

      // Use stripeService to create the session
      const result = await stripeService.createCheckoutSession(
        checkoutParams,
        { requireAuth: !isGuestCheckout }  // Only require auth for dashboard upgrades
      );

      console.log('✅ Checkout session created successfully:', {
        sessionId: result.sessionId,
        mode: isGuestCheckout ? 'guest' : 'authenticated',
        duration: Date.now() - startTime
      });

      return {
        sessionId: result.sessionId,
        url: result.url,
        mode: isGuestCheckout ? 'guest' : 'authenticated'
      };

    } catch (error) {
      logError('UnifiedCheckout', error, params);

      // Re-throw with user-friendly error codes
      if (error instanceof Error) {
        // If already a known error code, re-throw as is
        if (error.message in ['SUB_NO_EMAIL', 'SUB_PRICE_NOT_FOUND', 'SUB_CHECKOUT_FAILED']) {
          throw error;
        }

        // Map specific error patterns to codes
        if (error.message.includes('authentication') || error.message.includes('token')) {
          throw new Error('AUTH_INVALID_TOKEN');
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('NETWORK_ERROR');
        }
      }

      // Default error
      throw new Error('SUB_CHECKOUT_FAILED');
    }
  }

  /**
   * Get subscription status for a user
   * Single source of truth from Stripe
   */
  async getSubscriptionStatus(email: string): Promise<{
    hasSubscription: boolean;
    tier?: string;
    status?: string;
    cancelAtPeriodEnd?: boolean;
  }> {
    try {
      // TODO: Implement Stripe customer lookup by email
      // For now, return mock data
      return {
        hasSubscription: false
      };
    } catch (error) {
      logError('GetSubscriptionStatus', error, { email });
      return {
        hasSubscription: false
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const result = await stripeService.cancelSubscription(subscriptionId);
      return result.success;
    } catch (error) {
      logError('CancelSubscription', error, { subscriptionId });
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Reactivate subscription (remove cancellation)
   */
  async reactivateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const result = await stripeService.reactivateSubscription(subscriptionId);
      return result.success;
    } catch (error) {
      logError('ReactivateSubscription', error, { subscriptionId });
      throw new Error('Failed to reactivate subscription');
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(customerId: string): Promise<string> {
    try {
      // Create a setup session for updating payment method
      const result = await stripeService.createSetupSession(customerId);
      return result.url;
    } catch (error) {
      logError('UpdatePaymentMethod', error, { customerId });
      throw new Error('Failed to update payment method');
    }
  }
}

// Export singleton instance
export const unifiedCheckoutService = new UnifiedCheckoutService();

// Export for convenience
export default unifiedCheckoutService;