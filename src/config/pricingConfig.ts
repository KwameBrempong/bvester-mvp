// Unified Pricing Configuration for Bvester
// This file contains all pricing-related information for consistency across the app

export interface PricingTier {
  id: 'starter' | 'growth' | 'accelerate';
  name: string;
  displayName: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  currency: {
    primary: 'GHS';
    display: {
      ghs: { monthly: number; annual: number };
      usd: { monthly: number; annual: number };
    };
  };
  stripe: {
    monthly?: string;
    annual?: string;
  };
  trial?: {
    enabled: boolean;
    days: number;
  };
  foundingMember?: {
    enabled: boolean;
    discountPercentage: number;
    discountedPrice: {
      monthly: number;
      annual: number;
    };
    stripeMonthly?: string;
    stripeAnnual?: string;
  };
  features: string[];
  limits: {
    maxTransactions: number;
    maxReports: number;
    maxUsers: number;
    voiceNotes?: number;
    advisoryBoardSessions?: number;
  };
  capabilities: {
    hasVoiceRecording: boolean;
    hasAdvancedAssessment: boolean;
    hasAdvisoryBoard: boolean;
    hasInvestorMatching: boolean;
    hasAcceleratorProgram: boolean;
    canExportData: boolean;
    hasPhoneSupport: boolean;
    hasCustomBranding: boolean;
  };
  isComingSoon?: boolean;
  comingSoonFeatures?: string[];
}

export const PRICING_CONFIG: Record<PricingTier['id'], PricingTier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    displayName: 'Free (Starter)',
    description: 'Perfect for testing the waters',
    price: {
      monthly: 0,
      annual: 0,
    },
    currency: {
      primary: 'GHS',
      display: {
        ghs: { monthly: 0, annual: 0 },
        usd: { monthly: 0, annual: 0 },
      },
    },
    stripe: {
      // No Stripe products for free tier
    },
    features: [
      'Basic business assessment (self-guided checklist)',
      'Chat/Text based Record Keeping',
      'Access to public resources/forum',
      'Basic matching to free templates/advice',
    ],
    limits: {
      maxTransactions: 20,
      maxReports: 3,
      maxUsers: 1,
    },
    capabilities: {
      hasVoiceRecording: false,
      hasAdvancedAssessment: false,
      hasAdvisoryBoard: false,
      hasInvestorMatching: false,
      hasAcceleratorProgram: false,
      canExportData: false,
      hasPhoneSupport: false,
      hasCustomBranding: false,
    },
  },

  growth: {
    id: 'growth',
    name: 'Growth',
    displayName: 'Pro (Growth)',
    description: 'Everything you need to get funded',
    price: {
      monthly: 100, // GHS
      annual: 700,  // GHS (30% discount)
    },
    currency: {
      primary: 'GHS',
      display: {
        ghs: { monthly: 100, annual: 700 },
        usd: { monthly: 25, annual: 210 },
      },
    },
    stripe: {
      monthly: 'price_1SBvZfGUhOvqkzBNTrCPnEdr',
      annual: 'price_1SBvZfGUhOvqkzBNgYHVdRyy',
    },
    trial: {
      enabled: true,
      days: 14,
    },
    foundingMember: {
      enabled: true,
      discountPercentage: 50,
      discountedPrice: {
        monthly: 50, // GHS (50% off)
        annual: 350, // GHS (50% off)
      },
      stripeMonthly: 'price_1SBvZgGUhOvqkzBNvh2m1wpG',
      stripeAnnual: 'price_1SBvZgGUhOvqkzBN3dgtRGkY',
    },
    features: [
      'Limited voice record keeping with cloud storage (50 notes/month)',
      'Full business assessment (AI-scored reports on readiness)',
      'Virtual advisory board access (2 sessions/month with mentors)',
      'Premium matching to basic investor networks/resources',
    ],
    limits: {
      maxTransactions: 500,
      maxReports: 20,
      maxUsers: 3,
      voiceNotes: 50,
      advisoryBoardSessions: 2,
    },
    capabilities: {
      hasVoiceRecording: true,
      hasAdvancedAssessment: true,
      hasAdvisoryBoard: true,
      hasInvestorMatching: true,
      hasAcceleratorProgram: false,
      canExportData: true,
      hasPhoneSupport: false,
      hasCustomBranding: false,
    },
    isComingSoon: false, // Voice recording available immediately
    comingSoonFeatures: [
      'Virtual advisory board access',
      'Premium investor matching',
    ],
  },

  accelerate: {
    id: 'accelerate',
    name: 'Accelerate',
    displayName: 'Premium (Accelerate)',
    description: 'Fast-track to funding',
    price: {
      monthly: 500,  // GHS
      annual: 4200,  // GHS (30% discount)
    },
    currency: {
      primary: 'GHS',
      display: {
        ghs: { monthly: 500, annual: 4200 },
        usd: { monthly: 125, annual: 1050 },
      },
    },
    stripe: {
      monthly: 'price_1SBvZhGUhOvqkzBNHKbJp2fS',
      annual: 'price_1SBvZhGUhOvqkzBNHmGc5aRv',
    },
    features: [
      'All Pro features + advanced voice analytics (transcription/search)',
      'Full Access to Investment Accelerator Program',
      'Customized business assessments with expert reviews',
      'Unlimited virtual advisory board (dedicated mentors, group calls)',
      'Priority premium matching to pre-vetted investors/advisors',
    ],
    limits: {
      maxTransactions: Infinity,
      maxReports: Infinity,
      maxUsers: 10,
      voiceNotes: Infinity,
      advisoryBoardSessions: Infinity,
    },
    capabilities: {
      hasVoiceRecording: true,
      hasAdvancedAssessment: true,
      hasAdvisoryBoard: true,
      hasInvestorMatching: true,
      hasAcceleratorProgram: true,
      canExportData: true,
      hasPhoneSupport: true,
      hasCustomBranding: true,
    },
    isComingSoon: true, // All premium features coming soon
    comingSoonFeatures: [
      'Advanced voice analytics',
      'Investment Accelerator Program access',
      'Expert assessment reviews',
      'Unlimited advisory board access',
      'Priority investor matching',
    ],
  },
};

// Utility functions
export const getPricingTier = (tierId: PricingTier['id']): PricingTier => {
  return PRICING_CONFIG[tierId];
};

export const getAllPricingTiers = (): PricingTier[] => {
  return Object.values(PRICING_CONFIG);
};

export const getStripePrice = (tierId: PricingTier['id'], billing: 'monthly' | 'annual', isFoundingMember = false): string | undefined => {
  const tier = getPricingTier(tierId);

  if (isFoundingMember && tier.foundingMember?.enabled) {
    return billing === 'monthly' ? tier.foundingMember.stripeMonthly : tier.foundingMember.stripeAnnual;
  }

  return tier.stripe[billing];
};

export const calculateAnnualSavings = (tierId: PricingTier['id']): { amount: number; percentage: number } => {
  const tier = getPricingTier(tierId);
  const monthlyTotal = tier.price.monthly * 12;
  const annualPrice = tier.price.annual;
  const savings = monthlyTotal - annualPrice;
  const percentage = monthlyTotal > 0 ? Math.round((savings / monthlyTotal) * 100) : 0;

  return { amount: savings, percentage };
};

export const formatPrice = (amount: number, currency: 'GHS' | 'USD' = 'GHS'): string => {
  if (amount === 0) return 'Free';

  const formatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency === 'GHS' ? 'GHS' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

export const isFeatureAvailable = (tierId: PricingTier['id'], feature: keyof PricingTier['capabilities']): boolean => {
  const tier = getPricingTier(tierId);
  return tier.capabilities[feature];
};

export const checkUsageLimit = (tierId: PricingTier['id'], limitType: keyof PricingTier['limits'], currentUsage: number): {
  isWithinLimit: boolean;
  limit: number;
  remaining: number;
  usagePercentage: number;
} => {
  const tier = getPricingTier(tierId);
  const limit = tier.limits[limitType] as number;

  if (limit === Infinity) {
    return {
      isWithinLimit: true,
      limit: Infinity,
      remaining: Infinity,
      usagePercentage: 0,
    };
  }

  return {
    isWithinLimit: currentUsage < limit,
    limit,
    remaining: Math.max(0, limit - currentUsage),
    usagePercentage: limit > 0 ? (currentUsage / limit) * 100 : 0,
  };
};

// Founding member utilities
export const isFoundingMemberEligible = async (userId?: string): Promise<boolean> => {
  // TODO: Implement actual founding member check
  // For now, return true to enable for all users
  return true;
};

export const getFoundingMemberSpotInfo = async (): Promise<{ remaining: number; total: number }> => {
  // TODO: Implement actual spot tracking
  // For now, return mock data
  return { remaining: 633, total: 1000 };
};

export default PRICING_CONFIG;