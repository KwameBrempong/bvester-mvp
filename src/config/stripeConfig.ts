/**
 * Centralized Stripe Configuration
 * Single source of truth for all Stripe-related IDs and settings
 */

// CRITICAL: These must match your Stripe dashboard EXACTLY
// To verify: Go to Stripe Dashboard → Products → Click on each product → Copy price ID

export const STRIPE_PRICE_IDS = {
  // Growth/Pro Tier (₵100/month regular, ₵50/month founding)
  growth: {
    regular: {
      monthly: 'price_1SBvZfGUhOvqkzBNTrCPnEdr',  // ₵100/month
      annual: 'price_1SBvZfGUhOvqkzBNgYHVdRyy',   // ₵700/year (30% off)
    },
    founding: {
      monthly: 'price_1SBvZgGUhOvqkzBNvh2m1wpG',  // ₵50/month (50% off)
      annual: 'price_1SBvZgGUhOvqkzBN3dgtRGkY',   // ₵350/year (50% off)
    }
  },

  // Accelerate Tier (₵500/month regular, ₵250/month founding)
  accelerate: {
    regular: {
      monthly: 'price_1SBvZhGUhOvqkzBNHKbJp2fS',  // ₵500/month
      annual: 'price_1SBvZhGUhOvqkzBNHmGc5aRv',   // ₵4200/year (30% off)
    },
    founding: {
      monthly: null, // TODO: Create in Stripe dashboard
      annual: null,  // TODO: Create in Stripe dashboard
    }
  }
};

// Map price IDs to tier names for webhook processing
export const PRICE_TO_TIER_MAP: Record<string, { tier: string; billing: string; isFoundingMember: boolean }> = {
  // Growth/Pro tier
  'price_1SBvZfGUhOvqkzBNTrCPnEdr': { tier: 'growth', billing: 'monthly', isFoundingMember: false },
  'price_1SBvZfGUhOvqkzBNgYHVdRyy': { tier: 'growth', billing: 'annual', isFoundingMember: false },
  'price_1SBvZgGUhOvqkzBNvh2m1wpG': { tier: 'growth', billing: 'monthly', isFoundingMember: true },
  'price_1SBvZgGUhOvqkzBN3dgtRGkY': { tier: 'growth', billing: 'annual', isFoundingMember: true },

  // Accelerate tier
  'price_1SBvZhGUhOvqkzBNHKbJp2fS': { tier: 'accelerate', billing: 'monthly', isFoundingMember: false },
  'price_1SBvZhGUhOvqkzBNHmGc5aRv': { tier: 'accelerate', billing: 'annual', isFoundingMember: false },
};

// Stripe configuration
export const STRIPE_CONFIG = {
  // Public key (safe to expose)
  publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51P7ZjIGUhOvqkzBNm8F9pBC8KTqeXImUPO8VZW6A1a7SLqQDM14XBGQCBmPA2qr3OWP2C6nUEgoNAdopJ9oMVjZm007Ak2uKT0',

  // API endpoints
  apiBaseUrl: process.env.VITE_STRIPE_API_BASE_URL || 'https://y3ouaxtpf8.execute-api.eu-west-2.amazonaws.com/prod',

  // Checkout settings
  checkoutSettings: {
    successUrl: '/signup-success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: '/?cancelled=true',
    billingAddressCollection: 'auto',
    shippingAddressCollection: null,
    automaticTax: { enabled: false },
    allowPromotionCodes: false,
    customerCreation: 'always',
  },

  // Subscription settings
  subscriptionSettings: {
    defaultTrialDays: 14,
    prorationBehavior: 'create_prorations',
    cancelAtPeriodEnd: true, // Don't cancel immediately
    expandSubscriptionData: ['latest_invoice', 'customer'],
  }
};

// Helper function to get the correct price ID
export function getStripePriceId(
  tier: 'growth' | 'accelerate',
  billing: 'monthly' | 'annual' = 'monthly',
  isFoundingMember: boolean = true
): string | null {
  const tierConfig = STRIPE_PRICE_IDS[tier];
  if (!tierConfig) return null;

  const priceSet = isFoundingMember ? tierConfig.founding : tierConfig.regular;
  return priceSet[billing];
}

// Helper to identify tier from price ID
export function getTierFromPriceId(priceId: string): { tier: string; billing: string; isFoundingMember: boolean } | null {
  return PRICE_TO_TIER_MAP[priceId] || null;
}

// Validate that all required price IDs are configured
export function validateStripeConfiguration(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check Growth tier
  if (!STRIPE_PRICE_IDS.growth.regular.monthly) {
    errors.push('Missing Growth regular monthly price ID');
  }
  if (!STRIPE_PRICE_IDS.growth.founding.monthly) {
    errors.push('Missing Growth founding monthly price ID');
  }

  // Check Accelerate tier
  if (!STRIPE_PRICE_IDS.accelerate.regular.monthly) {
    errors.push('Missing Accelerate regular monthly price ID');
  }

  // Warn about missing founding member prices for Accelerate
  if (!STRIPE_PRICE_IDS.accelerate.founding.monthly) {
    console.warn('⚠️ Accelerate founding member prices not configured - using regular prices');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default STRIPE_CONFIG;