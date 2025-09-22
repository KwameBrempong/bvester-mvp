import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { logger } from '../config/environment';
import { apiService } from './apiService';

// Lazy initialize Amplify Data client
let client: ReturnType<typeof generateClient<Schema>> | null = null;

function getClient() {
  if (!client) {
    try {
      client = generateClient<Schema>();
    } catch (error) {
      logger.warn('Failed to initialize Amplify client, using fallback mode', error);
      // Return a mock client for MVP mode that throws errors
      const mockClient = {
        models: {
          UserProfile: {
            create: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            list: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            update: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            delete: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
          },
          Transaction: {
            create: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            list: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            update: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            delete: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
          },
          BusinessAssessment: {
            create: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            list: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            update: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            delete: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
          },
          UserSubscription: {
            create: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            list: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            update: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            delete: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
          },
          PaymentEvent: {
            create: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            list: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            update: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
            delete: () => Promise.reject(new Error('Database unavailable - MVP fallback mode')),
          }
        }
      };
      return mockClient as any;
    }
  }
  return client;
}

// Types for our data models
export interface UserProfile {
  userId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  location: string;
  region: string;
  businessType: string;
  businessDescription?: string;
  registrationNumber?: string;
  tinNumber?: string;
  yearEstablished?: string;
  employeeCount?: string;
  businessStage?: string;
  profileCompletedAt?: string;
  lastUpdated: string;

  // Enhanced fields for Phase 1
  role: 'owner' | 'accountant' | 'viewer';
  profileCompletionPercentage: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBusinessVerified: boolean;

  // Payment-related fields for Phase 2
  stripeCustomerId?: string;
  verificationDocuments?: {
    businessRegistration?: string;
    taxCertificate?: string;
    idDocument?: string;
    proofOfAddress?: string;
  };
  securitySettings: {
    mfaEnabled: boolean;
    lastPasswordChange?: string;
    loginAttempts: number;
    accountLocked: boolean;
    lockoutUntil?: string;
  };
  preferences: {
    language: 'en' | 'tw' | 'ga';
    currency: 'GHS' | 'USD';
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

export type Transaction = {
  userId: string;
  transactionId: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  paymentMethod?: string;
  createdAt: string;
};

export interface AssessmentResponses {
  [questionId: string]: string | number | boolean | string[];
}

export interface AssessmentRecommendations {
  marketRecommendations?: string[];
  financialRecommendations?: string[];
  operationsRecommendations?: string[];
  teamRecommendations?: string[];
  growthRecommendations?: string[];
  priorityActions?: string[];
}

export type BusinessAssessment = {
  userId: string;
  assessmentId: string;
  marketScore: number;
  financialScore: number;
  operationsScore: number;
  teamScore: number;
  growthScore: number;
  totalScore: number;
  responses: AssessmentResponses;
  recommendations?: AssessmentRecommendations;
  completedAt: string;
  reportGenerated?: boolean;
};

export type UserSubscription = {
  userId: string;
  platformTier: 'free' | 'pro' | 'business';
  platformExpiryDate?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  cancelAtPeriodEnd?: boolean;
  acceleratorAccess: 'none' | 'enrolled' | 'completed';
  acceleratorEnrollmentDate?: string;
  acceleratorPaymentType?: 'full' | 'installment';
  createdAt: string;
  lastUpdated: string;
  totalPaid?: number;
  lastPaymentDate?: string;
};

export interface PaymentEventData {
  subscriptionId?: string;
  customerId?: string;
  invoiceId?: string;
  paymentIntentId?: string;
  priceId?: string;
  quantity?: number;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

export type PaymentEvent = {
  userId: string;
  eventId: string;
  eventType: 'checkout_session_created' | 'payment_succeeded' | 'payment_failed' | 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'invoice_payment_succeeded' | 'invoice_payment_failed';
  stripeEventId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  amount?: number;
  currency?: string;
  eventData?: PaymentEventData;
  processed?: boolean;
  processedAt?: string;
  createdAt: string;
};

// Profile completion utilities
export const profileUtils = {
  calculateCompletionPercentage(profile: Partial<UserProfile>): number {
    const requiredFields = [
      'businessName', 'ownerName', 'email', 'phone', 'location',
      'region', 'businessType', 'registrationNumber', 'tinNumber',
      'yearEstablished', 'employeeCount', 'businessDescription'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value && value.toString().trim() !== '';
    });

    const basePercentage = Math.round((completedFields.length / requiredFields.length) * 70);

    // Add bonus points for verification
    let bonusPoints = 0;
    if (profile.isEmailVerified) bonusPoints += 10;
    if (profile.isPhoneVerified) bonusPoints += 10;
    if (profile.isBusinessVerified) bonusPoints += 10;

    return Math.min(100, basePercentage + bonusPoints);
  },

  getDefaultUserProfile(userId: string, email: string): Partial<UserProfile> {
    return {
      userId,
      email,
      role: 'owner',
      profileCompletionPercentage: 0,
      isEmailVerified: false,
      isPhoneVerified: false,
      isBusinessVerified: false,
      securitySettings: {
        mfaEnabled: false,
        loginAttempts: 0,
        accountLocked: false,
      },
      preferences: {
        language: 'en',
        currency: 'GHS',
        timezone: 'Africa/Accra',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
      },
      lastUpdated: new Date().toISOString(),
    };
  },

  getRequiredFieldsForCompletion(profile: Partial<UserProfile>): string[] {
    const requiredFields = [
      { field: 'businessName', label: 'Business Name' },
      { field: 'ownerName', label: 'Owner Name' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'registrationNumber', label: 'Business Registration Number' },
      { field: 'tinNumber', label: 'TIN Number' },
      { field: 'yearEstablished', label: 'Year Established' },
      { field: 'employeeCount', label: 'Employee Count' },
      { field: 'businessDescription', label: 'Business Description' },
    ];

    return requiredFields
      .filter(({ field }) => {
        const value = profile[field as keyof UserProfile];
        return !value || value.toString().trim() === '';
      })
      .map(({ label }) => label);
  }
};

// User Profile Service
export const userProfileService = {
  async create(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    try {
      // Calculate completion percentage before creating
      const completionPercentage = profileUtils.calculateCompletionPercentage(profile);

      const result = await getClient().models.UserProfile.create({
        ...profile,
        profileCompletionPercentage: completionPercentage,
        lastUpdated: new Date().toISOString(),
        profileCompletedAt: completionPercentage === 100 ? new Date().toISOString() : undefined,
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear profile cache after creation
      apiService.clearCache(`/profile/${profile.userId}`);
      logger.info('User profile created', { userId: profile.userId });

      return result.data as UserProfile;
    } catch (error) {
      logger.error('Error creating user profile', { error, userId: profile.userId });
      throw error;
    }
  },

  async get(userId: string): Promise<UserProfile | null> {
    return apiService.execute(
      async () => {
        const client = getClient();
        if (!client) {
          // Fallback: return null for MVP mode without backend
          logger.info('Using fallback mode for user profile - no backend connected');
          return null;
        }

        const result = await client.models.UserProfile.list({
          filter: { userId: { eq: userId } }
        });

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        return result.data[0] as UserProfile || null;
      },
      {
        method: 'GET',
        url: `/profile/${userId}`,
        cacheEnabled: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
      }
    );
  },

  async update(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // First get the current profile to get the ID
      const current = await this.get(userId);
      if (!current) {
        throw new Error('Profile not found');
      }

      // Merge current profile with updates for completion calculation
      const mergedProfile = { ...current, ...updates };
      const completionPercentage = profileUtils.calculateCompletionPercentage(mergedProfile);

      const result = await getClient().models.UserProfile.update({
        id: (current as unknown as { id: string }).id,
        ...updates,
        profileCompletionPercentage: completionPercentage,
        lastUpdated: new Date().toISOString(),
        profileCompletedAt: completionPercentage === 100 ? new Date().toISOString() : current.profileCompletedAt,
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear profile cache after update
      apiService.clearCache(`/profile/${userId}`);
      logger.info('User profile updated', { userId });

      return result.data as UserProfile;
    } catch (error) {
      logger.error('Error updating user profile', { error, userId });
      throw error;
    }
  }
};

// Transaction Service
export const transactionService = {
  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      const result = await getClient().models.Transaction.create({
        ...transaction,
        createdAt: new Date().toISOString(),
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear transactions cache after creation
      apiService.clearCache(`/transactions/${transaction.userId}`);
      logger.info('Transaction created', { userId: transaction.userId, transactionId: transaction.transactionId });

      return result.data as Transaction;
    } catch (error) {
      logger.error('Error creating transaction', { error, userId: transaction.userId });
      throw error;
    }
  },

  async list(userId: string, limit = 100): Promise<Transaction[]> {
    return apiService.execute(
      async () => {
        const result = await getClient().models.Transaction.list({
          filter: { userId: { eq: userId } },
          limit,
        });

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        return result.data as Transaction[];
      },
      {
        method: 'GET',
        url: `/transactions/${userId}`,
        params: { limit },
        cacheEnabled: true,
        cacheTTL: 2 * 60 * 1000, // 2 minutes for transactions
      }
    );
  },

  async update(transactionId: string, userId: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      // Find the transaction first
      const transactions = await this.list(userId);
      const transaction = transactions.find(t => t.transactionId === transactionId);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const result = await getClient().models.Transaction.update({
        id: (transaction as unknown as { id: string }).id,
        ...updates,
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear transactions cache after update
      apiService.clearCache(`/transactions/${userId}`);
      logger.info('Transaction updated', { userId, transactionId });

      return result.data as Transaction;
    } catch (error) {
      logger.error('Error updating transaction', { error, userId, transactionId });
      throw error;
    }
  },

  async delete(transactionId: string, userId: string): Promise<boolean> {
    try {
      // Find the transaction first
      const transactions = await this.list(userId);
      const transaction = transactions.find(t => t.transactionId === transactionId);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const result = await getClient().models.Transaction.delete({
        id: (transaction as unknown as { id: string }).id,
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear transactions cache after deletion
      apiService.clearCache(`/transactions/${userId}`);
      logger.info('Transaction deleted', { userId, transactionId });

      return true;
    } catch (error) {
      logger.error('Error deleting transaction', { error, userId, transactionId });
      throw error;
    }
  }
};

// Business Assessment Service
export const assessmentService = {
  async create(assessment: Omit<BusinessAssessment, 'id'>): Promise<BusinessAssessment> {
    try {
      const result = await getClient().models.BusinessAssessment.create({
        ...assessment,
        completedAt: new Date().toISOString(),
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear assessments cache after creation
      apiService.clearCache(`/assessments/${assessment.userId}`);
      logger.info('Assessment created', { userId: assessment.userId, assessmentId: assessment.assessmentId });

      return result.data as BusinessAssessment;
    } catch (error) {
      logger.error('Error creating assessment', { error, userId: assessment.userId });
      throw error;
    }
  },

  async list(userId: string): Promise<BusinessAssessment[]> {
    return apiService.execute(
      async () => {
        const result = await getClient().models.BusinessAssessment.list({
          filter: { userId: { eq: userId } },
        });

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        return result.data as BusinessAssessment[];
      },
      {
        method: 'GET',
        url: `/assessments/${userId}`,
        cacheEnabled: true,
        cacheTTL: 15 * 60 * 1000, // 15 minutes for assessments
      }
    );
  },

  async getLatest(userId: string): Promise<BusinessAssessment | null> {
    try {
      const assessments = await this.list(userId);
      if (assessments.length === 0) return null;

      // Sort by completedAt and return the most recent
      return assessments.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];
    } catch (error) {
      console.error('Error fetching latest assessment:', error);
      throw error;
    }
  }
};

// Subscription Service
export const subscriptionService = {
  async create(subscription: Omit<UserSubscription, 'id'>): Promise<UserSubscription> {
    try {
      const result = await getClient().models.UserSubscription.create({
        ...subscription,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear subscription cache after creation
      apiService.clearCache(`/subscription/${subscription.userId}`);
      logger.info('Subscription created', { userId: subscription.userId });

      return result.data as UserSubscription;
    } catch (error) {
      logger.error('Error creating subscription', { error, userId: subscription.userId });
      throw error;
    }
  },

  async get(userId: string): Promise<UserSubscription | null> {
    return apiService.execute(
      async () => {
        const client = getClient();
        if (!client) {
          // Fallback: return null for MVP mode without backend
          logger.info('Using fallback mode for subscription - no backend connected');
          return null;
        }

        const result = await client.models.UserSubscription.list({
          filter: { userId: { eq: userId } }
        });

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        return result.data[0] as UserSubscription || null;
      },
      {
        method: 'GET',
        url: `/subscription/${userId}`,
        cacheEnabled: true,
        cacheTTL: 10 * 60 * 1000, // 10 minutes for subscription
      }
    );
  },

  async update(userId: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    try {
      // First get the current subscription to get the ID
      const current = await this.get(userId);
      if (!current) {
        // Create new subscription if none exists
        return await this.create({
          userId,
          platformTier: 'free',
          acceleratorAccess: 'none',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          ...updates,
        });
      }

      const result = await getClient().models.UserSubscription.update({
        id: (current as unknown as { id: string }).id,
        ...updates,
        lastUpdated: new Date().toISOString(),
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear subscription cache after update
      apiService.clearCache(`/subscription/${userId}`);
      logger.info('Subscription updated', { userId });

      return result.data as UserSubscription;
    } catch (error) {
      logger.error('Error updating subscription', { error, userId });
      throw error;
    }
  }
};

// Payment Event Service
export const paymentEventService = {
  async create(event: Omit<PaymentEvent, 'id'>): Promise<PaymentEvent> {
    try {
      const result = await getClient().models.PaymentEvent.create({
        ...event,
        createdAt: new Date().toISOString(),
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data as PaymentEvent;
    } catch (error) {
      console.error('Error creating payment event:', error);
      throw error;
    }
  },

  async list(userId: string): Promise<PaymentEvent[]> {
    try {
      const result = await getClient().models.PaymentEvent.list({
        filter: { userId: { eq: userId } },
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data as PaymentEvent[];
    } catch (error) {
      console.error('Error fetching payment events:', error);
      throw error;
    }
  },

  async markProcessed(eventId: string): Promise<boolean> {
    try {
      // This would need to be implemented with a more specific query
      // For now, we'll keep it simple
      console.log('Marking event as processed:', eventId);
      return true;
    } catch (error) {
      console.error('Error marking event as processed:', error);
      throw error;
    }
  }
};

// Utility function to handle data migration from localStorage
export const migrationService = {
  async migrateUserData(userId: string): Promise<void> {
    try {
      console.log('Starting data migration for user:', userId);

      // Migrate user profile
      const savedProfile = localStorage.getItem(`profile_${userId}`);
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        const existingProfile = await userProfileService.get(userId);

        if (!existingProfile) {
          await userProfileService.create({
            userId,
            ...profileData,
          });
          console.log('Migrated user profile to database');
        }
      }

      // Migrate transactions
      const savedTransactions = localStorage.getItem(`transactions_${userId}`);
      if (savedTransactions) {
        const transactionsData = JSON.parse(savedTransactions);
        const existingTransactions = await transactionService.list(userId);

        if (existingTransactions.length === 0 && transactionsData.length > 0) {
          for (const transaction of transactionsData) {
            await transactionService.create({
              userId,
              ...transaction,
            });
          }
          console.log('Migrated transactions to database');
        }
      }

      // Migrate subscription
      const savedSubscription = localStorage.getItem(`subscription_${userId}`);
      if (savedSubscription) {
        const subscriptionData = JSON.parse(savedSubscription);
        const existingSubscription = await subscriptionService.get(userId);

        if (!existingSubscription) {
          await subscriptionService.create({
            userId,
            ...subscriptionData,
          });
          console.log('Migrated subscription to database');
        }
      }

      // Migrate assessments
      const savedAssessments = localStorage.getItem(`assessments_${userId}`);
      if (savedAssessments) {
        const assessmentsData = JSON.parse(savedAssessments);
        const existingAssessments = await assessmentService.list(userId);

        if (existingAssessments.length === 0 && assessmentsData.length > 0) {
          for (const assessment of assessmentsData) {
            await assessmentService.create({
              userId,
              ...assessment,
            });
          }
          console.log('Migrated assessments to database');
        }
      }

      console.log('Data migration completed for user:', userId);
    } catch (error) {
      console.error('Error during data migration:', error);
      // Don't throw error to avoid breaking the app
    }
  }
};