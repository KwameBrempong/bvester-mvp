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
      console.log('🆕 Creating user profile for userId:', profile.userId);
      console.log('📝 Profile data:', {
        businessName: profile.businessName,
        email: profile.email,
        location: profile.location,
        region: profile.region,
        role: profile.role
      });

      // Verify user doesn't already exist to prevent conflicts
      console.log('🔍 Checking if profile already exists...');
      const existingProfile = await this.getUserProfile(profile.userId);
      if (existingProfile) {
        const errorMsg = `User profile already exists for userId: ${profile.userId}`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ No existing profile found, proceeding with creation');

      const createPayload = {
        userId: profile.userId,
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location,
        region: profile.region,
        businessType: profile.businessType,
        businessDescription: profile.businessDescription || '',
        businessLogo: profile.businessLogo || '',
        ceoName: profile.ceoName || '',
        ceoEmail: profile.ceoEmail || '',
        ceoPhone: profile.ceoPhone || '',
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
      };

      console.log('📤 Sending create request to Amplify API...');
      const result = await client.models.UserProfile.create(createPayload);

      console.log('📨 API Response:', {
        hasData: !!result.data,
        hasErrors: !!(result.errors && result.errors.length > 0),
        errorCount: result.errors?.length || 0
      });

      if (result.errors && result.errors.length > 0) {
        const errorMessage = `Failed to create user profile: ${result.errors[0].message}`;
        console.error('❌ API Error:', result.errors);
        throw new Error(errorMessage);
      }

      console.log('✅ Profile created successfully');
      return profile;
    } catch (error) {
      console.error('💥 Error in createUserProfile:', error);

      // Enhanced error logging for debugging
      if (error instanceof Error) {
        console.error('🔍 Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack trace
        });

        // Check for specific error patterns
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to the backend service. Please check your internet connection.');
        }

        if (error.message.includes('403') || error.message.includes('unauthorized')) {
          throw new Error('Authentication error: Please sign out and sign back in.');
        }

        if (error.message.includes('404')) {
          throw new Error('API endpoint not found. The backend service may be unavailable.');
        }
      }

      throw error;
    }
  }

  /**
   * Fetch user profile from database
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 Fetching user profile for userId:', userId);

      const result = await client.models.UserProfile.list({
        filter: { userId: { eq: userId } }
      });

      console.log('📨 Profile fetch response:', {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        hasErrors: !!(result.errors && result.errors.length > 0),
        errorCount: result.errors?.length || 0
      });

      if (result.errors && result.errors.length > 0) {
        console.error('❌ Profile fetch errors:', result.errors);
        throw new Error(`Failed to fetch user profile: ${result.errors[0].message}`);
      }

      if (!result.data || result.data.length === 0) {
        console.log('📭 No profile found for userId:', userId);
        return null;
      }

      console.log('✅ Profile found for userId:', userId);
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
        businessLogo: dbProfile.businessLogo || '',
        ceoName: dbProfile.ceoName || '',
        ceoEmail: dbProfile.ceoEmail || '',
        ceoPhone: dbProfile.ceoPhone || '',
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

      // Verify userId consistency
      if (updates.userId && updates.userId !== userId) {
        throw new Error('Cannot change userId in profile update');
      }

      // First fetch the existing profile
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      // Additional verification that the profile belongs to the correct user
      if (existingProfile.userId !== userId) {
        throw new Error('Profile ownership verification failed');
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
        businessLogo: updates.businessLogo !== undefined ? updates.businessLogo : existingProfile.businessLogo,
        ceoName: updates.ceoName !== undefined ? updates.ceoName : existingProfile.ceoName,
        ceoEmail: updates.ceoEmail !== undefined ? updates.ceoEmail : existingProfile.ceoEmail,
        ceoPhone: updates.ceoPhone !== undefined ? updates.ceoPhone : existingProfile.ceoPhone,
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
      // Check if subscription already exists
      const existingSubscriptions = await client.models.UserSubscription.list({
        filter: { userId: { eq: userId } }
      });

      if (existingSubscriptions.data && existingSubscriptions.data.length > 0) {
        console.log('Subscription already exists for user:', userId);
        return;
      }

      const result = await client.models.UserSubscription.create({
        userId: userId,
        platformTier: 'starter',
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