// Environment configuration for secure handling of sensitive data

interface EnvironmentConfig {
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

// Validate required environment variables
const validateEnvironment = () => {
  const required = [
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_STRIPE_API_BASE_URL',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    // In development, provide helpful error message
    if (import.meta.env.DEV) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}. Please check your .env file.`);
    }
  }
};

// Environment configuration
export const environment: EnvironmentConfig = {
  stripe: {
    publishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', ''),
    apiBaseUrl: getEnvVar('VITE_STRIPE_API_BASE_URL', 'https://y3ouaxtpf8.execute-api.eu-west-2.amazonaws.com/prod'),
  },
  app: {
    baseUrl: getEnvVar('VITE_APP_BASE_URL', window.location.origin),
    environment: (getEnvVar('VITE_NODE_ENV', 'development') as any) || 'development',
  },
  features: {
    enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
    enableLogging: getEnvVar('VITE_ENABLE_LOGGING', 'true') === 'true',
    enableDataMigration: getEnvVar('VITE_ENABLE_DATA_MIGRATION', 'true') === 'true',
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