import { loadStripe } from '@stripe/stripe-js';
import { environment, logger, security } from './config/environment';
import { subscriptionService, paymentEventService } from './services/dataService';

// Enhanced types for Phase 2
export interface PaymentAnalytics {
  sessionId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  completionTime?: number;
  errorType?: string;
  retryCount?: number;
}

export interface EnhancedCheckoutSessionParams extends CreateCheckoutSessionParams {
  trialDays?: number;
  allowPromotionCodes?: boolean;
  collectTaxId?: boolean;
  collectShippingAddress?: boolean;
  analytics?: Partial<PaymentAnalytics>;
}

// Initialize Stripe with environment configuration
const stripePromise = loadStripe(environment.stripe.publishableKey);

// Use environment configuration for API base URL
const API_BASE_URL = environment.stripe.apiBaseUrl;

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

class StripeService {
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        logger.warn(`${context} attempt ${attempt} failed`, {
          error: lastError.message,
          attempt,
          maxAttempts: this.retryAttempts
        });

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams | EnhancedCheckoutSessionParams) {
    const startTime = Date.now();

    try {
      // Validate input parameters
      if (!params.priceId || !params.userId || !params.customerEmail) {
        throw new Error('Missing required parameters: priceId, userId, or customerEmail');
      }

      // Validate email format
      if (!security.isValidEmail(params.customerEmail)) {
        throw new Error('Invalid email format');
      }

      logger.info('Creating checkout session', {
        userId: params.userId,
        priceId: params.priceId,
        hasEnhancedParams: 'trialDays' in params
      });

      // Enhanced payment event logging
      const eventId = security.generateId();
      const analytics: PaymentAnalytics = {
        amount: ('analytics' in params && params.analytics?.amount) || 0,
        currency: 'GHS',
        ...(('analytics' in params && params.analytics) || {}),
      };

      await paymentEventService.create({
        userId: params.userId,
        eventId,
        eventType: 'checkout_session_created',
        eventData: {
          priceId: params.priceId,
          customerEmail: params.customerEmail,
          analytics,
          enhancedParams: 'trialDays' in params,
        },
        createdAt: new Date().toISOString(),
      });

      // Enhanced request body for advanced features
      const requestBody = {
        action: 'create_checkout_session',
        ...params,
        sessionId: eventId,
        analytics,
      };

      const response = await this.executeWithRetry(
        () => fetch(`${API_BASE_URL}/stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': eventId,
          },
          body: JSON.stringify(requestBody),
        }),
        'Checkout session creation'
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Lambda error response', { status: response.status, error: errorText });
        throw new Error(`Failed to create checkout session: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      logger.debug('Lambda response received', responseData);

      // Handle API Gateway response wrapper
      let parsedResponse = responseData;

      // If the response has statusCode and body properties, it's wrapped by API Gateway
      if (responseData.statusCode && responseData.body) {
        logger.debug('Detected API Gateway wrapped response, parsing body...');
        try {
          parsedResponse = JSON.parse(responseData.body);
          logger.debug('Parsed response body', parsedResponse);
        } catch (parseError) {
          logger.error('Failed to parse response body', responseData.body);
          throw new Error(`Failed to parse Lambda response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        // Check if it's an error response
        if (responseData.statusCode !== 200) {
          logger.error('Lambda returned error status', {
            status: responseData.statusCode,
            error: parsedResponse
          });
          throw new Error(`Lambda error: ${parsedResponse.error || 'Unknown error'}${parsedResponse.details ? '\nDetails: ' + parsedResponse.details : ''}`);
        }
      }

      // Check for error in parsed response
      if (parsedResponse.error) {
        logger.error('Lambda returned error', {
          error: parsedResponse.error,
          details: parsedResponse.details
        });
        throw new Error(`Lambda error: ${parsedResponse.error}${parsedResponse.details ? '\nDetails: ' + parsedResponse.details : ''}`);
      }

      const { sessionId } = parsedResponse;

      if (!sessionId) {
        logger.error('No sessionId in response', parsedResponse);
        throw new Error('No sessionId returned from Lambda function. Check Lambda logs for details.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      logger.info('Redirecting to checkout', { sessionId });

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        logger.error('Stripe redirect error', error);
        throw error;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';

      // Enhanced error logging with analytics
      logger.error('Error creating checkout session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: params.userId,
        priceId: params.priceId,
        duration,
        errorType,
        retryAttempts: this.retryAttempts,
      });

      // Log failure event
      try {
        await paymentEventService.create({
          userId: params.userId,
          eventId: security.generateId(),
          eventType: 'payment_failed',
          eventData: {
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType,
            duration,
            context: 'checkout_session_creation',
          },
          createdAt: new Date().toISOString(),
        });
      } catch (loggingError) {
        logger.warn('Failed to log payment failure event', loggingError);
      }

      throw error;
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      logger.info('Fetching subscription status', { userId });

      // First check our database for cached subscription data
      const dbSubscription = await subscriptionService.get(userId);

      // Then verify with Stripe if we have subscription IDs
      if (dbSubscription?.stripeSubscriptionId) {
        try {
          const response = await fetch(`${API_BASE_URL}/stripe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'get_subscription_status',
              userId,
              stripeSubscriptionId: dbSubscription.stripeSubscriptionId,
            }),
          });

          if (response.ok) {
            const stripeStatus = await response.json();

            // Update our database with latest Stripe data
            if (stripeStatus.isActive !== undefined) {
              await subscriptionService.update(userId, {
                platformTier: stripeStatus.isActive ?
                  (stripeStatus.plan as 'growth' | 'accelerate') || 'starter' : 'starter',
                platformExpiryDate: stripeStatus.currentPeriodEnd ?
                  new Date(stripeStatus.currentPeriodEnd * 1000).toISOString() : undefined,
                cancelAtPeriodEnd: stripeStatus.cancelAtPeriodEnd,
              });
            }

            return {
              isActive: stripeStatus.isActive || false,
              plan: stripeStatus.plan || null,
              currentPeriodEnd: stripeStatus.currentPeriodEnd || null,
              cancelAtPeriodEnd: stripeStatus.cancelAtPeriodEnd || false,
            };
          }
        } catch (stripeError) {
          logger.warn('Failed to verify with Stripe, using database data', stripeError);
        }
      }

      // Fallback to database data
      if (dbSubscription) {
        const isActive = dbSubscription.platformTier !== 'starter' &&
          (!dbSubscription.platformExpiryDate ||
           new Date(dbSubscription.platformExpiryDate) > new Date());

        return {
          isActive,
          plan: dbSubscription.platformTier !== 'starter' ? dbSubscription.platformTier : null,
          currentPeriodEnd: dbSubscription.platformExpiryDate ?
            Math.floor(new Date(dbSubscription.platformExpiryDate).getTime() / 1000) : null,
          cancelAtPeriodEnd: dbSubscription.cancelAtPeriodEnd || false,
        };
      }

      // Default response for new users
      return {
        isActive: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };

    } catch (error) {
      logger.error('Error getting subscription status', error);

      // Return safe default
      return {
        isActive: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel_subscription',
          subscriptionId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_portal_session',
          customerId,
          returnUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      return null;
    }
  }

  // Enhanced pricing configuration with additional metadata
  getPriceConfig() {
    return {
      platform: {
        growth: {
          monthly: {
            priceId: 'PLACEHOLDER_GROWTH_MONTHLY',
            amount: 100,
            currency: 'GHS',
            interval: 'month',
            trialDays: 14,
          },
          yearly: {
            priceId: 'PLACEHOLDER_GROWTH_ANNUAL',
            amount: 700, // 30% discount
            currency: 'GHS',
            interval: 'year',
            trialDays: 14,
          },
          foundingMonthly: {
            priceId: 'PLACEHOLDER_GROWTH_FOUNDING_MONTHLY',
            amount: 50, // 50% discount
            currency: 'GHS',
            interval: 'month',
            trialDays: 14,
          },
          foundingYearly: {
            priceId: 'PLACEHOLDER_GROWTH_FOUNDING_ANNUAL',
            amount: 350, // 50% discount
            currency: 'GHS',
            interval: 'year',
            trialDays: 14,
          },
        },
        accelerate: {
          monthly: {
            priceId: 'PLACEHOLDER_ACCELERATE_MONTHLY',
            amount: 500,
            currency: 'GHS',
            interval: 'month',
          },
          yearly: {
            priceId: 'PLACEHOLDER_ACCELERATE_ANNUAL',
            amount: 4200, // 30% discount
            currency: 'GHS',
            interval: 'year',
          },
        },
      },
      // Keep legacy accelerator config for now (will be removed later)
      accelerator: {
        full: {
          priceId: 'price_1S9omIGUhOvqkzBNnonB74p5',
          amount: 500,
          currency: 'GHS',
          interval: 'one_time',
        },
        installment: {
          priceId: 'price_1S9pPsGUhOvqkzBNt6pmrvF1',
          amount: 200,
          currency: 'GHS',
          interval: 'month',
          installments: 3,
        },
      },
    };
  }

  // New methods for Phase 2 enhancements

  async updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const response = await this.executeWithRetry(
        () => fetch(`${API_BASE_URL}/stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update_payment_method',
            customerId,
            paymentMethodId,
          }),
        }),
        'Update payment method'
      );

      return response.ok;
    } catch (error) {
      logger.error('Error updating payment method', { error, customerId });
      return false;
    }
  }

  async getPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const response = await this.executeWithRetry(
        () => fetch(`${API_BASE_URL}/stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_payment_methods',
            customerId,
          }),
        }),
        'Get payment methods'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      logger.error('Error fetching payment methods', { error, customerId });
      return [];
    }
  }

  async getInvoices(customerId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.executeWithRetry(
        () => fetch(`${API_BASE_URL}/stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_invoices',
            customerId,
            limit,
          }),
        }),
        'Get invoices'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      return data.invoices || [];
    } catch (error) {
      logger.error('Error fetching invoices', { error, customerId });
      return [];
    }
  }

  async generateUsageReport(customerId: string, period: { start: string; end: string }): Promise<any> {
    try {
      const response = await this.executeWithRetry(
        () => fetch(`${API_BASE_URL}/stripe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate_usage_report',
            customerId,
            period,
          }),
        }),
        'Generate usage report'
      );

      if (!response.ok) {
        throw new Error('Failed to generate usage report');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error generating usage report', { error, customerId, period });
      return null;
    }
  }
}

export const stripeService = new StripeService();