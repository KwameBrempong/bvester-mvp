/**
 * Centralized error messages for better UX
 * Maps technical errors to user-friendly messages with actions
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  technical?: string;
}

// Error code mappings
export const ERROR_MESSAGES: Record<string, UserFriendlyError> = {
  // Authentication errors
  'AUTH_NO_TOKEN': {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again to continue.',
    action: 'Sign In',
  },
  'AUTH_TOKEN_EXPIRED': {
    title: 'Session Expired',
    message: 'For security, your session has expired.',
    action: 'Sign In Again',
  },
  'AUTH_INVALID_TOKEN': {
    title: 'Authentication Error',
    message: 'We couldn\'t verify your identity. Please sign out and sign back in.',
    action: 'Sign Out',
  },

  // Subscription errors
  'SUB_NO_EMAIL': {
    title: 'Email Required',
    message: 'Please enter your email address to continue to checkout.',
    action: 'Try Again',
  },
  'SUB_PRICE_NOT_FOUND': {
    title: 'Plan Not Available',
    message: 'This subscription plan is not currently available. Please try another plan.',
    action: 'View Plans',
  },
  'SUB_CHECKOUT_FAILED': {
    title: 'Checkout Failed',
    message: 'We couldn\'t create your checkout session. Please try again or contact support.',
    action: 'Contact Support',
  },
  'SUB_ALREADY_EXISTS': {
    title: 'Active Subscription',
    message: 'You already have an active subscription. Manage it from your billing page.',
    action: 'Go to Billing',
  },

  // Payment errors
  'PAYMENT_METHOD_DECLINED': {
    title: 'Payment Failed',
    message: 'Your payment method was declined. Please try a different card.',
    action: 'Update Payment Method',
  },
  'PAYMENT_INSUFFICIENT_FUNDS': {
    title: 'Payment Failed',
    message: 'The payment could not be processed due to insufficient funds.',
    action: 'Try Another Card',
  },

  // Network errors
  'NETWORK_ERROR': {
    title: 'Connection Issue',
    message: 'We\'re having trouble connecting to our servers. Please check your internet connection.',
    action: 'Retry',
  },
  'SERVER_ERROR': {
    title: 'Server Issue',
    message: 'Our servers are experiencing issues. Please try again in a few moments.',
    action: 'Try Again',
  },
  'RATE_LIMIT': {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a moment and try again.',
    action: 'Wait & Retry',
  },

  // Profile errors
  'PROFILE_INCOMPLETE': {
    title: 'Complete Your Profile',
    message: 'Please complete your business profile to access this feature.',
    action: 'Complete Profile',
  },
  'PROFILE_NOT_FOUND': {
    title: 'Profile Not Found',
    message: 'We couldn\'t find your profile. Please try refreshing the page.',
    action: 'Refresh',
  },

  // Generic fallback
  'UNKNOWN_ERROR': {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
    action: 'Try Again',
  },
};

/**
 * Parse error and return user-friendly message
 */
export function getUserFriendlyError(error: any): UserFriendlyError {
  // Check if error has a code
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Parse error message for known patterns
  const errorMessage = error?.message?.toLowerCase() || '';

  // Authentication patterns
  if (errorMessage.includes('token') || errorMessage.includes('jwt')) {
    if (errorMessage.includes('expired')) return ERROR_MESSAGES.AUTH_TOKEN_EXPIRED;
    if (errorMessage.includes('invalid')) return ERROR_MESSAGES.AUTH_INVALID_TOKEN;
    return ERROR_MESSAGES.AUTH_NO_TOKEN;
  }

  // Network patterns
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Server patterns
  if (errorMessage.includes('500') || errorMessage.includes('internal')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  // Rate limiting
  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }

  // Subscription patterns
  if (errorMessage.includes('subscription') || errorMessage.includes('checkout')) {
    if (errorMessage.includes('exists')) return ERROR_MESSAGES.SUB_ALREADY_EXISTS;
    if (errorMessage.includes('price')) return ERROR_MESSAGES.SUB_PRICE_NOT_FOUND;
    return ERROR_MESSAGES.SUB_CHECKOUT_FAILED;
  }

  // Payment patterns
  if (errorMessage.includes('payment') || errorMessage.includes('card')) {
    if (errorMessage.includes('declined')) return ERROR_MESSAGES.PAYMENT_METHOD_DECLINED;
    if (errorMessage.includes('insufficient')) return ERROR_MESSAGES.PAYMENT_INSUFFICIENT_FUNDS;
    return ERROR_MESSAGES.PAYMENT_METHOD_DECLINED;
  }

  // Profile patterns
  if (errorMessage.includes('profile')) {
    if (errorMessage.includes('not found')) return ERROR_MESSAGES.PROFILE_NOT_FOUND;
    if (errorMessage.includes('incomplete')) return ERROR_MESSAGES.PROFILE_INCOMPLETE;
    return ERROR_MESSAGES.PROFILE_NOT_FOUND;
  }

  // Default fallback with technical details
  return {
    ...ERROR_MESSAGES.UNKNOWN_ERROR,
    technical: error?.message || 'No error details available',
  };
}

/**
 * Format error for display in UI
 */
export function formatErrorForDisplay(error: any): string {
  const friendlyError = getUserFriendlyError(error);
  return friendlyError.message;
}

/**
 * Get action button text for error
 */
export function getErrorAction(error: any): string | undefined {
  const friendlyError = getUserFriendlyError(error);
  return friendlyError.action;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || '';

  // Retryable patterns
  const retryablePatterns = [
    'network',
    'timeout',
    'fetch',
    '500',
    '502',
    '503',
    '504',
    'rate limit',
  ];

  return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Log error with context
 */
export function logError(context: string, error: any, additionalData?: any): void {
  const errorInfo = {
    context,
    message: error?.message,
    stack: error?.stack,
    code: error?.code,
    ...additionalData,
    timestamp: new Date().toISOString(),
  };

  console.error(`❌ [${context}]`, errorInfo);

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, LogRocket, etc.
  }
}

export default {
  ERROR_MESSAGES,
  getUserFriendlyError,
  formatErrorForDisplay,
  getErrorAction,
  isRetryableError,
  logError,
};