/**
 * Feature Flags for Safe MVP Enhancement Rollout
 * This allows us to gradually enable new features without breaking existing functionality
 */

interface FeatureFlags {
  // Theme enhancements
  useBlackGoldTheme: boolean;

  // Assessment improvements
  useInvestmentXRay: boolean;
  showBlindSpotAnalysis: boolean;

  // Accelerator enhancements
  use30DayBootcamp: boolean;
  showPricingTiers: boolean;

  // Homepage improvements
  useOptimizedHomepage: boolean;
  showTrustBadges: boolean;

  // Analytics and tracking
  enableConversionTracking: boolean;
  enableEnhancedAnalytics: boolean;

  // MVP simplification
  hideComplexFeatures: boolean;
  showOnlyEssentials: boolean;
}

// Default configuration - start with all enhancements disabled for safety
const defaultFlags: FeatureFlags = {
  // Gradually enable theme (low risk)
  useBlackGoldTheme: true,

  // Assessment features (medium risk - test thoroughly)
  useInvestmentXRay: false,
  showBlindSpotAnalysis: false,

  // Accelerator features (medium risk)
  use30DayBootcamp: false,
  showPricingTiers: false,

  // Homepage (high impact - enable last)
  useOptimizedHomepage: false,
  showTrustBadges: false,

  // Analytics (low risk - can enable early)
  enableConversionTracking: false,
  enableEnhancedAnalytics: false,

  // Simplification (enable to hide complexity)
  hideComplexFeatures: false,
  showOnlyEssentials: false,
};

// Override flags from localStorage for testing
const getLocalOverrides = (): Partial<FeatureFlags> => {
  try {
    const overrides = localStorage.getItem('featureFlags');
    return overrides ? JSON.parse(overrides) : {};
  } catch {
    return {};
  }
};

// Combine defaults with overrides
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...getLocalOverrides(),
};

// Helper function to check feature availability
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature] === true;
};

// Helper function to enable feature (for testing)
export const enableFeature = (feature: keyof FeatureFlags): void => {
  const current = getLocalOverrides();
  current[feature] = true;
  localStorage.setItem('featureFlags', JSON.stringify(current));
  console.log(`✅ Feature '${feature}' enabled. Refresh to apply.`);
};

// Helper function to disable feature (for testing)
export const disableFeature = (feature: keyof FeatureFlags): void => {
  const current = getLocalOverrides();
  current[feature] = false;
  localStorage.setItem('featureFlags', JSON.stringify(current));
  console.log(`❌ Feature '${feature}' disabled. Refresh to apply.`);
};

// Helper function to reset all flags to defaults
export const resetFeatureFlags = (): void => {
  localStorage.removeItem('featureFlags');
  console.log('🔄 Feature flags reset to defaults. Refresh to apply.');
};

// Export for console access during development
if (process.env.NODE_ENV === 'development') {
  (window as any).featureFlags = {
    current: featureFlags,
    enable: enableFeature,
    disable: disableFeature,
    reset: resetFeatureFlags,
  };
  console.log('💡 Feature flags available in console: window.featureFlags');
}