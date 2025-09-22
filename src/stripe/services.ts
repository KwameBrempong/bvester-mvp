import { stripePromise, STRIPE_PRODUCTS } from './config';

export interface PaymentIntent {
  type: 'subscription' | 'one-time';
  productType: 'pro' | 'business' | 'accelerator';
  billingCycle?: 'monthly' | 'yearly';
  paymentPlan?: 'full' | 'installments';
}

class StripeService {
  private async getStripe() {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }
    return stripe;
  }

  async createCheckoutSession(intent: PaymentIntent, customerInfo: {
    email: string;
    name: string;
    userId: string;
  }) {
    try {
      // Get the appropriate price ID
      const priceId = this.getPriceId(intent);
      
      // Create checkout session via your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          userId: customerInfo.userId,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/payment-cancelled`,
          metadata: {
            productType: intent.productType,
            billingCycle: intent.billingCycle,
            paymentPlan: intent.paymentPlan,
            type: intent.type
          }
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await this.getStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  }

  private getPriceId(intent: PaymentIntent): string {
    if (intent.type === 'subscription') {
      if (intent.productType === 'pro') {
        return intent.billingCycle === 'yearly' 
          ? STRIPE_PRODUCTS.pro_yearly 
          : STRIPE_PRODUCTS.pro_monthly;
      }
      if (intent.productType === 'business') {
        return intent.billingCycle === 'yearly' 
          ? STRIPE_PRODUCTS.business_yearly 
          : STRIPE_PRODUCTS.business_monthly;
      }
    }
    
    if (intent.type === 'one-time' && intent.productType === 'accelerator') {
      return intent.paymentPlan === 'installments' 
        ? STRIPE_PRODUCTS.accelerator_installment 
        : STRIPE_PRODUCTS.accelerator_full;
    }
    
    throw new Error('Invalid payment intent configuration');
  }

  // For testing purposes - simulate successful payment
  async simulatePayment(intent: PaymentIntent): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        resolve(Math.random() > 0.1);
      }, 2000);
    });
  }
}

export const stripeService = new StripeService();