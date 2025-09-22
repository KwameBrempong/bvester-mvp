import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userProfileService, UserProfile, profileUtils } from '../../services/dataService';
import { rbacService, Permission } from '../../services/rbacService';
import { logger } from '../../config/environment';

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  permissions: Permission[];
  profileCompletion: {
    percentage: number;
    missingFields: string[];
    lastUpdated: string | null;
  };
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  userId: null,
  permissions: [],
  profileCompletion: {
    percentage: 0,
    missingFields: [],
    lastUpdated: null,
  },
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      logger.info('Fetching user profile', { userId });
      const profile = await userProfileService.get(userId);
      return profile;
    } catch (error) {
      logger.error('Failed to fetch user profile', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  }
);

export const createUserProfile = createAsyncThunk(
  'user/createProfile',
  async (profileData: Omit<UserProfile, 'id'>, { rejectWithValue }) => {
    try {
      logger.info('Creating user profile', { userId: profileData.userId });
      const profile = await userProfileService.create(profileData);
      return profile;
    } catch (error) {
      logger.error('Failed to create user profile', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }, { rejectWithValue }) => {
    try {
      logger.info('Updating user profile', { userId });
      const profile = await userProfileService.update(userId, updates);
      return profile;
    } catch (error) {
      logger.error('Failed to update user profile', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

// Verification async thunks
export const sendEmailVerification = createAsyncThunk(
  'user/sendEmailVerification',
  async ({ userId, email }: { userId: string; email: string }, { rejectWithValue }) => {
    try {
      const { verificationService } = await import('../../services/verificationService');
      logger.info('Sending email verification', { userId });
      const success = await verificationService.sendEmailVerification(userId, email);
      if (!success) {
        throw new Error('Failed to send email verification');
      }
      return { userId, email };
    } catch (error) {
      logger.error('Failed to send email verification', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send email verification');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'user/verifyEmail',
  async ({ userId, code }: { userId: string; code: string }, { rejectWithValue, dispatch }) => {
    try {
      const { verificationService } = await import('../../services/verificationService');
      logger.info('Verifying email', { userId });
      const success = await verificationService.verifyEmail(userId, code);
      if (!success) {
        throw new Error('Invalid verification code');
      }

      // Update verification status in state
      dispatch(updateVerificationStatus({ type: 'email', verified: true }));
      return { userId, verified: true };
    } catch (error) {
      logger.error('Failed to verify email', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to verify email');
    }
  }
);

export const sendPhoneVerification = createAsyncThunk(
  'user/sendPhoneVerification',
  async ({ userId, phone }: { userId: string; phone: string }, { rejectWithValue }) => {
    try {
      const { verificationService } = await import('../../services/verificationService');
      logger.info('Sending phone verification', { userId });
      const success = await verificationService.sendPhoneVerification(userId, phone);
      if (!success) {
        throw new Error('Failed to send phone verification');
      }
      return { userId, phone };
    } catch (error) {
      logger.error('Failed to send phone verification', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send phone verification');
    }
  }
);

export const verifyPhone = createAsyncThunk(
  'user/verifyPhone',
  async ({ userId, code }: { userId: string; code: string }, { rejectWithValue, dispatch }) => {
    try {
      const { verificationService } = await import('../../services/verificationService');
      logger.info('Verifying phone', { userId });
      const success = await verificationService.verifyPhone(userId, code);
      if (!success) {
        throw new Error('Invalid verification code');
      }

      // Update verification status in state
      dispatch(updateVerificationStatus({ type: 'phone', verified: true }));
      return { userId, verified: true };
    } catch (error) {
      logger.error('Failed to verify phone', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to verify phone');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<{ userId: string; isAuthenticated: boolean }>) => {
      state.userId = action.payload.userId;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    clearUser: (state) => {
      state.profile = null;
      state.userId = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfileCompletion: (state) => {
      if (state.profile) {
        state.profileCompletion.percentage = state.profile.profileCompletionPercentage;
        state.profileCompletion.missingFields = profileUtils.getRequiredFieldsForCompletion(state.profile);
        state.profileCompletion.lastUpdated = new Date().toISOString();
      }
    },
    updatePermissions: (state) => {
      if (state.profile) {
        state.permissions = rbacService.getRolePermissions(state.profile.role);
      }
    },
    updateVerificationStatus: (state, action: PayloadAction<{
      type: 'email' | 'phone' | 'business';
      verified: boolean;
    }>) => {
      if (state.profile) {
        const { type, verified } = action.payload;
        if (type === 'email') {
          state.profile.isEmailVerified = verified;
        } else if (type === 'phone') {
          state.profile.isPhoneVerified = verified;
        } else if (type === 'business') {
          state.profile.isBusinessVerified = verified;
        }

        // Recalculate completion percentage
        state.profile.profileCompletionPercentage = profileUtils.calculateCompletionPercentage(state.profile);
        state.profileCompletion.percentage = state.profile.profileCompletionPercentage;
        state.profileCompletion.missingFields = profileUtils.getRequiredFieldsForCompletion(state.profile);
        state.profileCompletion.lastUpdated = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        if (action.payload) {
          // Update permissions and completion status
          state.permissions = rbacService.getRolePermissions(action.payload.role);
          state.profileCompletion.percentage = action.payload.profileCompletionPercentage;
          state.profileCompletion.missingFields = profileUtils.getRequiredFieldsForCompletion(action.payload);
          state.profileCompletion.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create profile
    builder
      .addCase(createUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        if (action.payload) {
          // Update permissions and completion status
          state.permissions = rbacService.getRolePermissions(action.payload.role);
          state.profileCompletion.percentage = action.payload.profileCompletionPercentage;
          state.profileCompletion.missingFields = profileUtils.getRequiredFieldsForCompletion(action.payload);
          state.profileCompletion.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        if (action.payload) {
          // Update permissions and completion status
          state.permissions = rbacService.getRolePermissions(action.payload.role);
          state.profileCompletion.percentage = action.payload.profileCompletionPercentage;
          state.profileCompletion.missingFields = profileUtils.getRequiredFieldsForCompletion(action.payload);
          state.profileCompletion.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setAuthenticated,
  clearUser,
  clearError,
  updateProfileCompletion,
  updatePermissions,
  updateVerificationStatus
} = userSlice.actions;
export default userSlice.reducer;