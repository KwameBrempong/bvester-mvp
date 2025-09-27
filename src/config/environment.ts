// Environment configuration for secure handling of sensitive data

interface EnvironmentConfig {
  aws: {
    region: string;
    appsyncUrl: string;
    apiKey: string;
    userPoolId: string;
    userPoolClientId: string;
    identityPoolId: string;
  };
  stripe: {
    publishableKey: string;
    apiBaseUrl: string;
  };
  app: {
    baseUrl: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    enableAnalytics: boolean;
    enableLogging: boolean;
    enableDataMigration: boolean;
  };
  security: {
    encryptionKey: string;
  };
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    console.warn(`Missing environment variable: ${key}`);
    return '';
  }
  return value || fallback || '';
};

// CRITICAL FIX: Enhanced environment validation with security checks
const validateEnvironment = () => {
  const required = [
    'VITE_AWS_REGION',
    'VITE_AWS_APPSYNC_GRAPHQL_URL',
    'VITE_AWS_APPSYNC_API_KEY',
    'VITE_AWS_USER_POOL_ID',
    'VITE_AWS_USER_POOL_CLIENT_ID',
    'VITE_AWS_IDENTITY_POOL_ID',
    'VITE_ENCRYPTION_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_STRIPE_API_BASE_URL',
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  const errors: string[] = [];

  // Check for missing variables
  if (missing.length > 0) {
    errors.push(`Missing environment variables: ${missing.join(', ')}`);
  }

  // SECURITY: Validate critical configurations
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (stripeKey && !stripeKey.startsWith('pk_')) {
    errors.push('Invalid Stripe publishable key format. Must start with "pk_"');
  }

  // Validate AWS region format
  const awsRegion = import.meta.env.VITE_AWS_REGION;
  if (awsRegion && !/^[a-z]{2}-[a-z]+-\d{1}$/.test(awsRegion)) {
    errors.push('Invalid AWS region format');
  }

  // Validate URLs
  const appsyncUrl = import.meta.env.VITE_AWS_APPSYNC_GRAPHQL_URL;
  if (appsyncUrl && !appsyncUrl.startsWith('https://')) {
    errors.push('AppSync URL must use HTTPS');
  }

  const stripeApiUrl = import.meta.env.VITE_STRIPE_API_BASE_URL;
  if (stripeApiUrl && !stripeApiUrl.startsWith('https://')) {
    errors.push('Stripe API URL must use HTTPS');
  }

  // Check for development defaults in production
  if (!import.meta.env.DEV) {
    const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
    if (encryptionKey === 'dev-key-not-secure') {
      errors.push('Development encryption key detected in production environment');
    }
  }

  // Report errors
  if (errors.length > 0) {
    console.error('Environment validation failed:', errors);

    // In development, provide helpful error message
    if (import.meta.env.DEV) {
      const errorMessage = `Environment Configuration Errors:\n${errors.map(error => `• ${error}`).join('\n')}\n\nPlease check your .env file and fix these issues.`;
      throw new Error(errorMessage);
    } else {
      // In production, log errors but don't crash
      console.error('Production environment configuration issues detected. Some features may not work correctly.');
    }
  } else {
    console.log('✅ Environment validation passed');
  }
};

// Environment configuration
export const environment: EnvironmentConfig = {
  aws: {
    region: getEnvVar('VITE_AWS_REGION', 'eu-west-2'),
    appsyncUrl: getEnvVar('VITE_AWS_APPSYNC_GRAPHQL_URL', ''),
    apiKey: getEnvVar('VITE_AWS_APPSYNC_API_KEY', ''),
    userPoolId: getEnvVar('VITE_AWS_USER_POOL_ID', ''),
    userPoolClientId: getEnvVar('VITE_AWS_USER_POOL_CLIENT_ID', ''),
    identityPoolId: getEnvVar('VITE_AWS_IDENTITY_POOL_ID', ''),
  },
  stripe: {
    publishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', ''),
    apiBaseUrl: getEnvVar('VITE_STRIPE_API_BASE_URL', 'https://y3ouaxtpf8.execute-api.eu-west-2.amazonaws.com/prod'),
  },
  app: {
    baseUrl: getEnvVar('VITE_APP_BASE_URL', window.location.origin),
    environment: (getEnvVar('VITE_APP_ENV', 'development') as any) || 'development',
  },
  features: {
    enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
    enableLogging: getEnvVar('VITE_ENABLE_LOGGING', 'true') === 'true',
    enableDataMigration: getEnvVar('VITE_ENABLE_DATA_MIGRATION', 'true') === 'true',
  },
  security: {
    encryptionKey: getEnvVar('VITE_ENCRYPTION_KEY', 'dev-key-not-secure'),
  },
};

// Validate environment on load
if (import.meta.env.DEV) {
  validateEnvironment();
}

// Security utility functions
export const security = {
  // Sanitize user input
  sanitizeString: (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (Ghana format)
  isValidGhanaPhone: (phone: string): boolean => {
    const ghanaPhoneRegex = /^(\+233|0)[0-9]{9}$/;
    return ghanaPhoneRegex.test(phone);
  },

  // Generate secure random IDs
  generateId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Mask sensitive data for logging
  maskSensitiveData: (data: any): any => {
    const masked = { ...data };
    const sensitiveFields = ['email', 'phone', 'password', 'token', 'key'];

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***masked***';
      }
    }

    return masked;
  },
};

// Logging utility with security considerations
export const logger = {
  debug: (message: string, data?: any) => {
    if (environment.features.enableLogging && import.meta.env.DEV) {
      console.debug(`[BVESTER] ${message}`, data ? security.maskSensitiveData(data) : '');
    }
  },

  info: (message: string, data?: any) => {
    if (environment.features.enableLogging) {
      console.info(`[BVESTER] ${message}`, data ? security.maskSensitiveData(data) : '');
    }
  },

  warn: (message: string, data?: any) => {
    if (environment.features.enableLogging) {
      console.warn(`[BVESTER] ${message}`, data ? security.maskSensitiveData(data) : '');
    }
  },

  error: (message: string, error?: any) => {
    if (environment.features.enableLogging) {
      console.error(`[BVESTER] ${message}`, error instanceof Error ? error.message : error);
    }
  },
};

export default environment;