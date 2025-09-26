import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
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
        businessLogo: (profile as any).businessLogo || '',
        ceoName: (profile as any).ceoName || '',
        ceoEmail: (profile as any).ceoEmail || '',
        ceoPhone: (profile as any).ceoPhone || '',
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
      // Error creating user profile
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
        businessLogo: (dbProfile as any).businessLogo || '',
        ceoName: (dbProfile as any).ceoName || '',
        ceoEmail: (dbProfile as any).ceoEmail || '',
        ceoPhone: (dbProfile as any).ceoPhone || '',
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
      // Error fetching user profile
      return null;
    }
  }

  /**
   * Update user profile in database
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('🔄 Starting profile update for userId:', userId);
      console.log('📝 Updates to apply:', updates);

      // First fetch the existing profile
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      console.log('📋 Existing profile found:', {
        id: existingProfile.userId,
        businessName: existingProfile.businessName
      });

      // Find the profile record to update
      const result = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } }
      });

      if (!result.data || result.data.length === 0) {
        throw new Error('Profile record not found in database');
      }

      const profileId = result.data[0].id;
      console.log('🔍 Found profile record with ID:', profileId);

      // Prepare update payload
      const updatePayload = {
        id: profileId,
        businessName: updates.businessName !== undefined ? updates.businessName : existingProfile.businessName,
        ownerName: updates.ownerName !== undefined ? updates.ownerName : existingProfile.ownerName,
        email: updates.email !== undefined ? updates.email : existingProfile.email,
        phone: updates.phone !== undefined ? updates.phone : existingProfile.phone,
        location: updates.location !== undefined ? updates.location : existingProfile.location,
        region: updates.region !== undefined ? updates.region : existingProfile.region,
        businessType: updates.businessType !== undefined ? updates.businessType : existingProfile.businessType,
        businessDescription: updates.businessDescription !== undefined ? updates.businessDescription : existingProfile.businessDescription,
        businessLogo: (updates as any).businessLogo !== undefined ? (updates as any).businessLogo : (existingProfile as any).businessLogo,
        ceoName: (updates as any).ceoName !== undefined ? (updates as any).ceoName : (existingProfile as any).ceoName,
        ceoEmail: (updates as any).ceoEmail !== undefined ? (updates as any).ceoEmail : (existingProfile as any).ceoEmail,
        ceoPhone: (updates as any).ceoPhone !== undefined ? (updates as any).ceoPhone : (existingProfile as any).ceoPhone,
        registrationNumber: updates.registrationNumber !== undefined ? updates.registrationNumber : existingProfile.registrationNumber,
        tinNumber: updates.tinNumber !== undefined ? updates.tinNumber : existingProfile.tinNumber,
        yearEstablished: updates.yearEstablished !== undefined ? updates.yearEstablished : existingProfile.yearEstablished,
        employeeCount: updates.employeeCount !== undefined ? updates.employeeCount : existingProfile.employeeCount,
        businessStage: updates.businessStage !== undefined ? updates.businessStage : existingProfile.businessStage,
        role: updates.role !== undefined ? updates.role : existingProfile.role,
        profileCompletionPercentage: updates.profileCompletionPercentage !== undefined ? updates.profileCompletionPercentage : existingProfile.profileCompletionPercentage,
        isEmailVerified: updates.isEmailVerified !== undefined ? updates.isEmailVerified : existingProfile.isEmailVerified,
        isPhoneVerified: updates.isPhoneVerified !== undefined ? updates.isPhoneVerified : existingProfile.isPhoneVerified,
        isBusinessVerified: updates.isBusinessVerified !== undefined ? updates.isBusinessVerified : existingProfile.isBusinessVerified,
        profileCompletedAt: updates.profileCompletedAt !== undefined ? updates.profileCompletedAt : existingProfile.profileCompletedAt,
        lastUpdated: new Date().toISOString()
      };

      console.log('📤 Sending update to database:', updatePayload);

      // Update the profile
      const updateResult = await client.models.UserProfile.update(updatePayload);

      if (updateResult.errors && updateResult.errors.length > 0) {
        console.error('❌ Database update failed:', updateResult.errors);
        throw new Error(`Failed to update user profile: ${updateResult.errors[0].message}`);
      }

      console.log('✅ Database update successful');

      // Also update localStorage for immediate UI feedback
      const updatedProfile = { ...existingProfile, ...updates, lastUpdated: new Date().toISOString() };
      localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));

      // Return updated profile
      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('💥 Error updating user profile:', error);
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
      // Error checking user existence
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
        // Failed to create subscription record
      }
    } catch (error) {
      // Error initializing user subscription
      // Don't throw - subscription is not critical for basic functionality
    }
  }
}

export default UserService;