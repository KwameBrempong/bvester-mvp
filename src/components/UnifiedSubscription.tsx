/**
 * SINGLE SUBSCRIPTION COMPONENT
 * This replaces ALL other subscription components
 * One flow, one source of truth, no duplicates
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getStripePriceId, STRIPE_CONFIG } from '../config/stripeConfig';
import { getUserFriendlyError, logError } from '../utils/errorMessages';
import '../styles/unified-subscription.css';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface UnifiedSubscriptionProps {
  userEmail?: string;  // If user is logged in
  userId?: string;     // If user is logged in
  onClose?: () => void;
  source?: 'homepage' | 'dashboard' | 'email';
}

export const UnifiedSubscription: React.FC<UnifiedSubscriptionProps> = ({
  userEmail,
  userId,
  onClose,
  source = 'homepage'
}) => {
  const [selectedTier, setSelectedTier] = useState<'growth' | 'accelerate'>('growth');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [email, setEmail] = useState(userEmail || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(!userEmail);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Calculate prices
  const getPrice = () => {
    const isMonthly = billing === 'monthly';
    const basePrice = selectedTier === 'growth'
      ? (isMonthly ? 100 : 700)  // Growth: ₵100/mo or ₵700/yr
      : (isMonthly ? 500 : 4200); // Accelerate: ₵500/mo or ₵4200/yr

    // Always show founding member price (50% off)
    const foundingPrice = basePrice / 2;

    return {
      regular: basePrice,
      founding: foundingPrice,
      savings: basePrice - foundingPrice
    };
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate email
      const checkoutEmail = email || userEmail;
      if (!checkoutEmail) {
        throw new Error('Please enter your email address');
      }

      // Get the correct price ID - always use founding member pricing
      const priceId = getStripePriceId(selectedTier, billing, true);

      if (!priceId) {
        throw new Error('Selected plan is not available');
      }

      console.log('🎯 Creating checkout session:', {
        tier: selectedTier,
        billing,
        priceId,
        email: checkoutEmail,
        isAuthenticated: !!userId
      });

      // Create checkout session directly via API
      const response = await fetch(`${STRIPE_CONFIG.apiBaseUrl}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'Authorization': `Bearer ${await getAuthToken()}` } : {})
        },
        body: JSON.stringify({
          action: 'create_checkout_session',
          priceId,
          userId: userId || `guest_${Date.now()}`,
          customerEmail: checkoutEmail,
          metadata: {
            tier: selectedTier,
            billing,
            source,
            isGuestCheckout: !userId
          }
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.sessionId) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) {
        throw stripeError;
      }

    } catch (err) {
      logError('UnifiedSubscription', err);
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError.message);
      setIsProcessing(false);
    }
  };

  // Helper to get auth token if user is logged in
  const getAuthToken = async () => {
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch {
      return null;
    }
  };

  const prices = getPrice();

  return (
    <div className="unified-subscription">
      <div className="unified-subscription__container">
        {/* Header */}
        <div className="unified-subscription__header">
          <h2>Choose Your Growth Plan</h2>
          <p>No trials, no tricks. Just immediate access to powerful tools.</p>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="billing-toggle">
          <button
            className={billing === 'monthly' ? 'active' : ''}
            onClick={() => setBilling('monthly')}
            disabled={isProcessing}
          >
            Monthly
          </button>
          <button
            className={billing === 'annual' ? 'active' : ''}
            onClick={() => setBilling('annual')}
            disabled={isProcessing}
          >
            Annual (Save 30%)
          </button>
        </div>

        {/* Tier Selection */}
        <div className="tier-cards">
          {/* Growth/Pro Tier */}
          <div
            className={`tier-card ${selectedTier === 'growth' ? 'selected' : ''}`}
            onClick={() => !isProcessing && setSelectedTier('growth')}
          >
            <div className="tier-header">
              <h3>Pro (Growth)</h3>
              <div className="price">
                <span className="currency">₵</span>
                <span className="amount">{prices.founding}</span>
                <span className="period">/{billing === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <div className="original-price">
                Regular: ₵{prices.regular}
              </div>
              <div className="badge">50% OFF - Founding Member</div>
            </div>
            <ul className="features">
              <li>✓ Unlimited transactions</li>
              <li>✓ Smart analytics & reports</li>
              <li>✓ Business health X-Ray</li>
              <li>✓ Investor matching</li>
              <li>✓ Email support</li>
            </ul>
            {selectedTier === 'growth' && (
              <div className="selected-indicator">✓ Selected</div>
            )}
          </div>

          {/* Accelerate Tier */}
          <div
            className={`tier-card ${selectedTier === 'accelerate' ? 'selected' : ''}`}
            onClick={() => !isProcessing && setSelectedTier('accelerate')}
          >
            <div className="tier-header">
              <h3>Accelerator</h3>
              <div className="price">
                <span className="currency">₵</span>
                <span className="amount">{selectedTier === 'accelerate' ? prices.founding : '250'}</span>
                <span className="period">/{billing === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <div className="original-price">
                Regular: ₵{selectedTier === 'accelerate' ? prices.regular : '500'}
              </div>
              <div className="badge">COMING SOON</div>
            </div>
            <ul className="features">
              <li>✓ Everything in Pro</li>
              <li>✓ Investment Accelerator Program</li>
              <li>✓ Dedicated growth coach</li>
              <li>✓ Priority investor access</li>
              <li>✓ Phone & video support</li>
            </ul>
            {selectedTier === 'accelerate' && (
              <div className="disabled-overlay">
                Available Q1 2025
              </div>
            )}
          </div>
        </div>

        {/* Email Input (for guests) */}
        {showEmailInput && (
          <div className="email-section">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isProcessing}
              required
            />
            <small>Your account will be created with this email after payment</small>
          </div>
        )}

        {/* Checkout Button */}
        <button
          className="checkout-button"
          onClick={handleCheckout}
          disabled={isProcessing || selectedTier === 'accelerate' || (!email && !userEmail)}
        >
          {isProcessing ? (
            <span>Processing...</span>
          ) : (
            <span>
              Pay ₵{prices.founding} {billing === 'monthly' ? 'Monthly' : 'Yearly'} →
            </span>
          )}
        </button>

        {/* Trust Badges */}
        <div className="trust-section">
          <div className="trust-badge">
            <span>🔒</span>
            <span>Secure payment via Stripe</span>
          </div>
          <div className="trust-badge">
            <span>⚡</span>
            <span>Instant access</span>
          </div>
          <div className="trust-badge">
            <span>❌</span>
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* Fine Print */}
        <div className="fine-print">
          <p>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            {!userId && ' Your account will be created automatically after payment.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSubscription;