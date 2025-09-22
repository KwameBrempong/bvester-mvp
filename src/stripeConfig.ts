import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePublishableKey = 'pk_test_your_stripe_publishable_key_here';

export const stripePromise = loadStripe(stripePublishableKey);

export const STRIPE_PRICES = {
  pro_monthly: 'price_1234567890', // Replace with actual price ID from Stripe
  business_monthly: 'price_0987654321', // Replace with actual price ID
  accelerator_full: 'price_accelerator_full', // One-time payment
  accelerator_installment: 'price_accelerator_installment' // Recurring 3 payments
};