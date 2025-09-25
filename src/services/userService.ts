import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { UserProfile } from './dataService';

const client = generateClient<Schema>();

export class UserService {
  /**
   * Create user profile in database
   */
  static async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const result = await client.models.UserProfile.create({
        userId: profile.userId,
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location,
        region: profile.region,
        businessType: profile.businessType,
        businessDescription: profile.businessDescription || '',
        registrationNumber: profile.registrationNumber || '',
        tinNumber: profile.tinNumber || '',
        yearEstablished: profile.yearEstablished || '',
        employeeCount: profile.employeeCount || '',
        businessStage: profile.businessStage || 'existing',
        role: profile.role,
        profileCompletionPercentage: profile.profileCompletionPercentage || 0,
        isEmailVerified: profile.isEmailVerified || false,
        isPhoneVerified: profile.isPhoneVerified || false,
        isBusinessVerified: profile.isBusinessVerified || false,
        profileCompletedAt: profile.profileCompletedAt,
        lastUpdated: profile.lastUpdated
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(`Failed to create user profile: ${result.errors[0].message}`);
      }

      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Fetch user profile from database
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } }
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(`Failed to fetch user profile: ${result.errors[0].message}`);
      }

      if (!result.data || result.data.length === 0) {
        return null;
      }

      const dbProfile = result.data[0];

      // Convert database record to UserProfile format
      const profile: UserProfile = {
        userId: dbProfile.userId,
        businessName: dbProfile.businessName,
        ownerName: dbProfile.ownerName,
        email: dbProfile.email,
        phone: dbProfile.phone || '',
        location: dbProfile.location,
        region: dbProfile.region,
        businessType: dbProfile.businessType,
        businessDescription: dbProfile.businessDescription || '',
        registrationNumber: dbProfile.registrationNumber || '',
        tinNumber: dbProfile.tinNumber || '',
        yearEstablished: dbProfile.yearEstablished || '',
        employeeCount: dbProfile.employeeCount || '',
        businessStage: dbProfile.businessStage || 'existing',
        role: (dbProfile.role as any) || 'owner',
        profileCompletionPercentage: dbProfile.profileCompletionPercentage || 0,
        isEmailVerified: dbProfile.isEmailVerified || false,
        isPhoneVerified: dbProfile.isPhoneVerified || false,
        isBusinessVerified: dbProfile.isBusinessVerified || false,
        profileCompletedAt: dbProfile.profileCompletedAt || undefined,
        lastUpdated: dbProfile.lastUpdated,
        securitySettings: {
          mfaEnabled: false,
          loginAttempts: 0,
          accountLocked: false,
          lastPasswordChange: undefined,
          lockoutUntil: undefined
        },
        preferences: {
          language: 'en',
          currency: 'GHS',
          timezone: 'Africa/Accra',
          notifications: {
            email: true,
            sms: true,
            push: true
          }
        }
      };

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile in database
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // First fetch the existing profile
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      // Find the profile record to update
      const result = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } }
      });

      if (!result.data || result.data.length === 0) {
        throw new Error('Profile record not found');
      }

      const profileId = result.data[0].id;

      // Update the profile
      const updateResult = await client.models.UserProfile.update({
        id: profileId,
        businessName: updates.businessName || existingProfile.businessName,
        ownerName: updates.ownerName || existingProfile.ownerName,
        email: updates.email || existingProfile.email,
        phone: updates.phone !== undefined ? updates.phone : existingProfile.phone,
        location: updates.location || existingProfile.location,
        region: updates.region || existingProfile.region,
        businessType: updates.businessType || existingProfile.businessType,
        businessDescription: updates.businessDescription !== undefined ? updates.businessDescription : existingProfile.businessDescription,
        registrationNumber: updates.registrationNumber !== undefined ? updates.registrationNumber : existingProfile.registrationNumber,
        tinNumber: updates.tinNumber !== undefined ? updates.tinNumber : existingProfile.tinNumber,
        yearEstablished: updates.yearEstablished !== undefined ? updates.yearEstablished : existingProfile.yearEstablished,
        employeeCount: updates.employeeCount !== undefined ? updates.employeeCount : existingProfile.employeeCount,
        businessStage: updates.businessStage !== undefined ? updates.businessStage : existingProfile.businessStage,
        role: updates.role || existingProfile.role,
        profileCompletionPercentage: updates.profileCompletionPercentage !== undefined ? updates.profileCompletionPercentage : existingProfile.profileCompletionPercentage,
        isEmailVerified: updates.isEmailVerified !== undefined ? updates.isEmailVerified : existingProfile.isEmailVerified,
        isPhoneVerified: updates.isPhoneVerified !== undefined ? updates.isPhoneVerified : existingProfile.isPhoneVerified,
        isBusinessVerified: updates.isBusinessVerified !== undefined ? updates.isBusinessVerified : existingProfile.isBusinessVerified,
        profileCompletedAt: updates.profileCompletedAt !== undefined ? updates.profileCompletedAt : existingProfile.profileCompletedAt,
        lastUpdated: new Date().toISOString()
      });

      if (updateResult.errors && updateResult.errors.length > 0) {
        throw new Error(`Failed to update user profile: ${updateResult.errors[0].message}`);
      }

      // Return updated profile
      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Check if user exists in database
   */
  static async userExists(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile !== null;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Initialize user subscription record
   */
  static async initializeUserSubscription(userId: string): Promise<void> {
    try {
      const result = await client.models.UserSubscription.create({
        userId: userId,
        platformTier: 'free',
        acceleratorAccess: 'none',
        totalPaid: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      if (result.errors && result.errors.length > 0) {
        console.warn('Failed to create subscription record:', result.errors[0].message);
      }
    } catch (error) {
      console.error('Error initializing user subscription:', error);
      // Don't throw - subscription is not critical for basic functionality
    }
  }
}

export default UserService;