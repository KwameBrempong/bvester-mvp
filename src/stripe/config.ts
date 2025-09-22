import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Product IDs from your Stripe Dashboard
export const STRIPE_PRODUCTS = {
  // Platform Subscriptions
  pro_monthly: 'price_pro_monthly_id', // Replace with actual price ID
  pro_yearly: 'price_pro_yearly_id',
  business_monthly: 'price_business_monthly_id', 
  business_yearly: 'price_business_yearly_id',
  
  // Growth Accelerator
  accelerator_full: 'price_accelerator_full_id',
  accelerator_installment: 'price_accelerator_installment_id'
};

// Pricing information for display
export const PRICING_INFO = {
  pro: {
    monthly: { price: 50, currency: 'GHS' },
    yearly: { price: 420, currency: 'GHS', savings: 180 }
  },
  business: {
    monthly: { price: 150, currency: 'GHS' },
    yearly: { price: 1260, currency: 'GHS', savings: 540 }
  },
  accelerator: {
    full: { price: 2000, currency: 'GHS' },
    installment: { price: 750, currency: 'GHS', installments: 3 }
  }
};