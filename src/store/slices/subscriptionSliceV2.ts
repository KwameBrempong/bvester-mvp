/**
 * SIMPLIFIED Subscription Slice
 * Single source of truth: Stripe
 * No duplicate state, no localStorage conflicts
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { STRIPE_CONFIG } from '../../config/stripeConfig';

interface SubscriptionState {
  // From Stripe only
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | null;
  tier: 'free' | 'growth' | 'accelerate';
  billing: 'monthly' | 'annual' | null;
  nextPaymentDate: string | null;
  cancelAtPeriodEnd: boolean;

  // UI state
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: SubscriptionState = {
  status: null,
  tier: 'free',
  billing: null,
  nextPaymentDate: null,
  cancelAtPeriodEnd: false,
  loading: false,
  error: null,
  lastFetched: null,
};

// Fetch subscription status from Stripe (via Lambda)
export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async (userId: string) => {
    const response = await fetch(`${STRIPE_CONFIG.apiBaseUrl}/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_subscription_status',
        userId,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.subscription;
  }
);

// Create checkout session
export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckout',
  async (params: {
    priceId: string;
    userId: string;
    customerEmail: string;
  }) => {
    const response = await fetch(`${STRIPE_CONFIG.apiBaseUrl}/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_checkout_session',
        ...params,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Redirect to Stripe
    if (data.url) {
      window.location.href = data.url;
    }

    return data;
  }
);

const subscriptionSliceV2 = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSubscription: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch status
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload) {
          state.status = action.payload.status;
          state.tier = action.payload.tier || 'free';
          state.billing = action.payload.billing;
          state.nextPaymentDate = action.payload.nextPaymentDate;
          state.cancelAtPeriodEnd = action.payload.cancelAtPeriodEnd || false;
        } else {
          // No subscription = free tier
          state.status = null;
          state.tier = 'free';
          state.billing = null;
        }

        state.lastFetched = Date.now();
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscription status';
      })

      // Create checkout
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.loading = false;
        // Redirect happens automatically
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create checkout session';
      });
  },
});

export const { clearError, resetSubscription } = subscriptionSliceV2.actions;
export default subscriptionSliceV2.reducer;