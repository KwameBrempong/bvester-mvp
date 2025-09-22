import { userProfileService } from './dataService';
import { logger } from '../config/environment';

export interface VerificationToken {
  token: string;
  expires: string;
  attempts: number;
}

export interface VerificationState {
  emailVerification?: VerificationToken;
  phoneVerification?: VerificationToken;
  businessVerification?: {
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    reviewNotes?: string;
    documentsUploaded: string[];
  };
}

// In-memory store for verification tokens (in production, use Redis or database)
const verificationStore = new Map<string, VerificationState>();

export const verificationService = {
  // Email verification
  async sendEmailVerification(userId: string, email: string): Promise<boolean> {
    try {
      // Generate 6-digit verification code
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Store verification token
      const currentState = verificationStore.get(userId) || {};
      verificationStore.set(userId, {
        ...currentState,
        emailVerification: { token, expires, attempts: 0 }
      });

      // In production, integrate with email service (AWS SES, SendGrid, etc.)
      logger.info('Email verification sent', { userId, email, token: token.substring(0, 2) + '****' });

      // For demo purposes, log the verification code
      console.log(`📧 Email verification code for ${email}: ${token}`);

      return true;
    } catch (error) {
      logger.error('Failed to send email verification', { error, userId, email });
      return false;
    }
  },

  async verifyEmail(userId: string, token: string): Promise<boolean> {
    try {
      const state = verificationStore.get(userId);
      if (!state?.emailVerification) {
        logger.warn('No email verification found', { userId });
        return false;
      }

      const verification = state.emailVerification;

      // Check if token expired
      if (new Date() > new Date(verification.expires)) {
        logger.warn('Email verification token expired', { userId });
        return false;
      }

      // Check attempts limit
      if (verification.attempts >= 3) {
        logger.warn('Email verification attempts exceeded', { userId });
        return false;
      }

      // Verify token
      if (verification.token !== token) {
        verification.attempts += 1;
        logger.warn('Invalid email verification token', { userId, attempts: verification.attempts });
        return false;
      }

      // Update user profile
      await userProfileService.update(userId, {
        isEmailVerified: true,
      });

      // Clean up verification state
      delete state.emailVerification;
      verificationStore.set(userId, state);

      logger.info('Email verified successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Email verification failed', { error, userId });
      return false;
    }
  },

  // Phone verification
  async sendPhoneVerification(userId: string, phone: string): Promise<boolean> {
    try {
      // Generate 6-digit verification code
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Store verification token
      const currentState = verificationStore.get(userId) || {};
      verificationStore.set(userId, {
        ...currentState,
        phoneVerification: { token, expires, attempts: 0 }
      });

      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      logger.info('SMS verification sent', { userId, phone: phone.substring(0, 4) + '****', token: token.substring(0, 2) + '****' });

      // For demo purposes, log the verification code
      console.log(`📱 SMS verification code for ${phone}: ${token}`);

      return true;
    } catch (error) {
      logger.error('Failed to send SMS verification', { error, userId, phone });
      return false;
    }
  },

  async verifyPhone(userId: string, token: string): Promise<boolean> {
    try {
      const state = verificationStore.get(userId);
      if (!state?.phoneVerification) {
        logger.warn('No phone verification found', { userId });
        return false;
      }

      const verification = state.phoneVerification;

      // Check if token expired
      if (new Date() > new Date(verification.expires)) {
        logger.warn('Phone verification token expired', { userId });
        return false;
      }

      // Check attempts limit
      if (verification.attempts >= 3) {
        logger.warn('Phone verification attempts exceeded', { userId });
        return false;
      }

      // Verify token
      if (verification.token !== token) {
        verification.attempts += 1;
        logger.warn('Invalid phone verification token', { userId, attempts: verification.attempts });
        return false;
      }

      // Update user profile
      await userProfileService.update(userId, {
        isPhoneVerified: true,
      });

      // Clean up verification state
      delete state.phoneVerification;
      verificationStore.set(userId, state);

      logger.info('Phone verified successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Phone verification failed', { error, userId });
      return false;
    }
  },

  // Business verification
  async submitBusinessVerification(
    userId: string,
    documents: {
      businessRegistration?: string;
      taxCertificate?: string;
      idDocument?: string;
      proofOfAddress?: string;
    }
  ): Promise<boolean> {
    try {
      const documentsUploaded = Object.entries(documents)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);

      // Store business verification state
      const currentState = verificationStore.get(userId) || {};
      verificationStore.set(userId, {
        ...currentState,
        businessVerification: {
          status: 'pending',
          submittedAt: new Date().toISOString(),
          documentsUploaded,
        }
      });

      // Update user profile with documents
      await userProfileService.update(userId, {
        verificationDocuments: documents,
      });

      logger.info('Business verification submitted', { userId, documentsCount: documentsUploaded.length });

      // In production, notify verification team
      console.log(`🏢 Business verification submitted for user ${userId} with ${documentsUploaded.length} documents`);

      return true;
    } catch (error) {
      logger.error('Business verification submission failed', { error, userId });
      return false;
    }
  },

  async approveBusinessVerification(userId: string, reviewNotes?: string): Promise<boolean> {
    try {
      const state = verificationStore.get(userId) || {};
      if (state.businessVerification) {
        state.businessVerification.status = 'approved';
        state.businessVerification.reviewedAt = new Date().toISOString();
        state.businessVerification.reviewNotes = reviewNotes;
        verificationStore.set(userId, state);
      }

      // Update user profile
      await userProfileService.update(userId, {
        isBusinessVerified: true,
      });

      logger.info('Business verification approved', { userId, reviewNotes });
      return true;
    } catch (error) {
      logger.error('Business verification approval failed', { error, userId });
      return false;
    }
  },

  async rejectBusinessVerification(userId: string, reviewNotes: string): Promise<boolean> {
    try {
      const state = verificationStore.get(userId) || {};
      if (state.businessVerification) {
        state.businessVerification.status = 'rejected';
        state.businessVerification.reviewedAt = new Date().toISOString();
        state.businessVerification.reviewNotes = reviewNotes;
        verificationStore.set(userId, state);
      }

      logger.info('Business verification rejected', { userId, reviewNotes });
      return true;
    } catch (error) {
      logger.error('Business verification rejection failed', { error, userId });
      return false;
    }
  },

  // Get verification status
  getVerificationStatus(userId: string): VerificationState | null {
    return verificationStore.get(userId) || null;
  },

  // Clean up expired tokens
  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [userId, state] of verificationStore.entries()) {
      let updated = false;

      if (state.emailVerification && new Date(state.emailVerification.expires) < now) {
        delete state.emailVerification;
        updated = true;
      }

      if (state.phoneVerification && new Date(state.phoneVerification.expires) < now) {
        delete state.phoneVerification;
        updated = true;
      }

      if (updated) {
        verificationStore.set(userId, state);
      }
    }
  }
};

// Clean up expired tokens every 5 minutes
setInterval(() => {
  verificationService.cleanupExpiredTokens();
}, 5 * 60 * 1000);