import { loadStripe } from '@stripe/stripe-js';
import { fetchAuthSession } from 'aws-amplify/auth';
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
  private maxRetryDelay = 10000; // 10 seconds max

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // CRITICAL FIX: Get JWT token for authenticated API calls
  private async getAuthToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        logger.warn('No ID token found in auth session');
        return null;
      }

      return idToken;
    } catch (error) {
      logger.error('Failed to get auth token', error);
      return null;
    }
  }

  // CRITICAL FIX: Enhanced retry logic with better error handling
  private async executeWithRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: Error;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await operation();

        if (attempt > 1) {
          logger.info(`${context} succeeded on attempt ${attempt}`, {
            totalTime: Date.now() - startTime,
            attempt
          });
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);

        logger.warn(`${context} attempt ${attempt} failed`, {
          error: lastError.message,
          isRetryable,
          attempt,
          maxAttempts: this.retryAttempts
        });

        // Don't retry non-retryable errors
        if (!isRetryable) {
          logger.error(`${context} failed with non-retryable error`, {
            error: lastError.message,
            attempt
          });
          break;
        }

        if (attempt < this.retryAttempts) {
          const delay = Math.min(this.retryDelay * Math.pow(2, attempt - 1), this.maxRetryDelay);
          await this.delay(delay);
        }
      }
    }

    // Log final failure
    logger.error(`${context} failed after ${this.retryAttempts} attempts`, {
      error: lastError!.message,
      totalTime: Date.now() - startTime
    });

    throw this.enhanceError(lastError!, context);
  }

  // CRITICAL FIX: Determine if error is worth retrying
  private isRetryableError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || error.status;

    // Don't retry client errors (4xx)
    if (errorCode >= 400 && errorCode < 500) {
      return false;
    }

    // Don't retry authentication errors
    if (errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('forbidden')) {
      return false;
    }

    // Retry network/server errors
    return (
      errorCode >= 500 || // Server errors
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('fetch')
    );
  }

  // CRITICAL FIX: Enhance error messages for users
  private enhanceError(error: Error, context: string): Error {
    const enhanced = new Error();
    enhanced.name = error.name;
    enhanced.stack = error.stack;

    // Provide user-friendly error messages
    if (error.message.includes('network') || error.message.includes('fetch')) {
      enhanced.message = 'Network connection failed. Please check your internet connection and try again.';
    } else if (error.message.includes('timeout')) {
      enhanced.message = 'The request timed out. Please try again.';
    } else if (error.message.includes('invalid') && context.includes('checkout')) {
      enhanced.message = 'Invalid payment information. Please check your details and try again.';
    } else if (error.message.includes('declined') && context.includes('payment')) {
      enhanced.message = 'Payment was declined. Please check with your bank or try a different payment method.';
    } else if (context.includes('subscription') && error.message.includes('not found')) {
      enhanced.message = 'Subscription not found. Please contact support for assistance.';
    } else {
      enhanced.message = `Payment processing failed: ${error.message}. Please try again or contact support.`;
    }

    return enhanced;
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

      // CRITICAL FIX: Get JWT token for authentication
      const authToken = await this.getAuthToken();
      if (!authToken) {
        throw new Error('Authentication required. Please sign in and try again.');
      }

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
            'Authorization': `Bearer ${authToken}`, // CRITICAL FIX: Add JWT token
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

      // CRITICAL FIX: Enhanced redirect with better error handling
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        logger.error('Stripe redirect error', error);

        // Provide user-friendly error message
        const enhancedError = new Error();
        if (error.message?.includes('network')) {
          enhancedError.message = 'Unable to connect to payment processor. Please check your internet connection.';
        } else if (error.message?.includes('invalid')) {
          enhancedError.message = 'Invalid payment session. Please try creating a new payment.';
        } else {
          enhancedError.message = 'Payment redirect failed. Please try again or contact support.';
        }

        throw enhancedError;
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
          const authToken = await this.getAuthToken();
          const response = await fetch(`${API_BASE_URL}/stripe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
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
      const authToken = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
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
      const authToken = await this.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
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
            priceId: 'price_1SBvZfGUhOvqkzBNTrCPnEdr',
            amount: 100,
            currency: 'GHS',
            interval: 'month',
            trialDays: 14,
          },
          yearly: {
            priceId: 'price_1SBvZfGUhOvqkzBNgYHVdRyy',
            amount: 700, // 30% discount
            currency: 'GHS',
            interval: 'year',
            trialDays: 14,
          },
          foundingMonthly: {
            priceId: 'price_1SBvZgGUhOvqkzBNvh2m1wpG',
            amount: 50, // 50% discount
            currency: 'GHS',
            interval: 'month',
            trialDays: 14,
          },
          foundingYearly: {
            priceId: 'price_1SBvZgGUhOvqkzBN3dgtRGkY',
            amount: 350, // 50% discount
            currency: 'GHS',
            interval: 'year',
            trialDays: 14,
          },
        },
        accelerate: {
          monthly: {
            priceId: 'price_1SBvZhGUhOvqkzBNHKbJp2fS',
            amount: 500,
            currency: 'GHS',
            interval: 'month',
          },
          yearly: {
            priceId: 'price_1SBvZhGUhOvqkzBNHmGc5aRv',
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
        async () => {
          const authToken = await this.getAuthToken();
          return fetch(`${API_BASE_URL}/stripe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              action: 'update_payment_method',
              customerId,
              paymentMethodId,
            }),
          });
        },
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
        async () => {
          const authToken = await this.getAuthToken();
          return fetch(`${API_BASE_URL}/stripe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              action: 'get_payment_methods',
              customerId,
            }),
          });
        },
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
        async () => {
          const authToken = await this.getAuthToken();
          return fetch(`${API_BASE_URL}/stripe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              action: 'get_invoices',
              customerId,
              limit,
            }),
          });
        },
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
        async () => {
          const authToken = await this.getAuthToken();
          return fetch(`${API_BASE_URL}/stripe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              action: 'generate_usage_report',
              customerId,
              period,
            }),
          });
        },
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