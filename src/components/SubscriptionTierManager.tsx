import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  useSubscriptionTier,
  useSubscriptionFeatures,
  useUsageStats,
  useBillingInfo,
  useSubscriptionStatus,
  useSubscriptionLoading,
} from '../store/hooks';
import { fetchSubscription, createCheckoutSession } from '../store/slices/subscriptionSlice';
import { stripeService } from '../stripeService';

interface SubscriptionTierManagerProps {
  userId: string;
  userEmail: string;
  onClose?: () => void;
}

const SubscriptionTierManager: React.FC<SubscriptionTierManagerProps> = ({
  userId,
  userEmail,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const currentTier = useSubscriptionTier();
  const features = useSubscriptionFeatures();
  const usage = useUsageStats();
  const billing = useBillingInfo();
  const subscriptionStatus = useSubscriptionStatus();
  const loading = useSubscriptionLoading();

  const [selectedTier, setSelectedTier] = useState<'pro' | 'business'>('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const priceConfig = stripeService.getPriceConfig();

  useEffect(() => {
    if (userId) {
      dispatch(fetchSubscription(userId));
    }
  }, [userId, dispatch]);

  const handleUpgrade = async (tier: 'growth' | 'accelerate') => {
    try {
      const priceInfo = priceConfig.platform[tier][billingPeriod];
      const priceId = typeof priceInfo === 'string' ? priceInfo : priceInfo.priceId;

      await dispatch(createCheckoutSession({
        priceId,
        userId,
        customerEmail: userEmail,
        planType: tier,
        billingPeriod,
      }));
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const getPriceDisplay = (tier: 'growth' | 'accelerate', period: 'monthly' | 'yearly') => {
    const priceInfo = priceConfig.platform[tier][period];
    if (typeof priceInfo === 'string') return { amount: 0, savings: 0 };

    const monthlyPrice = priceConfig.platform[tier].monthly;
    const monthlyAmount = typeof monthlyPrice === 'string' ? 0 : monthlyPrice.amount;

    return {
      amount: priceInfo.amount,
      savings: period === 'yearly' ? (monthlyAmount * 12) - priceInfo.amount : 0,
      trialDays: priceInfo.trialDays || 0,
    };
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === 999999) return 0; // Unlimited
    return limit > 0 ? Math.round((current / limit) * 100) : 0;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return '#DC143C';
    if (percentage >= 75) return '#FF8C00';
    if (percentage >= 50) return '#FFD700';
    return '#2E8B57';
  };

  const tierFeatures = {
    starter: {
      name: 'Starter',
      color: '#95a5a6',
      features: [
        '20 transactions per month',
        '3 reports per month',
        '1 user',
        'Basic analytics',
        'Email support',
      ],
    },
    growth: {
      name: 'Growth',
      color: '#3498db',
      features: [
        '500 transactions per month',
        '20 reports per month',
        '3 users',
        'Voice recording (50/month)',
        'Advanced analytics',
        'Data export',
        'Advisory board access',
        'Email support',
      ],
    },
    accelerate: {
      name: 'Accelerate',
      color: '#2E8B57',
      features: [
        'Unlimited transactions',
        'Unlimited reports',
        '10 users',
        'Unlimited voice recording',
        'Advanced analytics',
        'Data export',
        'Full accelerator access',
        'Phone support',
        'Custom branding',
      ],
    },
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#2E8B57', fontSize: '24px' }}>
              Subscription Management
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              Current Plan: <strong style={{ color: tierFeatures[currentTier].color }}>
                {tierFeatures[currentTier].name}
              </strong>
              {subscriptionStatus.expiresIn && (
                <span> • Expires in {subscriptionStatus.expiresIn} days</span>
              )}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          {/* Current Usage Stats */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
              Current Usage
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {/* Transactions */}
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#333' }}>Transactions</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {usage.transactions.current} / {usage.transactions.limit === 999999 ? '∞' : usage.transactions.limit}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${getUsagePercentage(usage.transactions.current, usage.transactions.limit)}%`,
                    height: '100%',
                    background: getUsageColor(getUsagePercentage(usage.transactions.current, usage.transactions.limit)),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Reports */}
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#333' }}>Reports</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {usage.reports.current} / {usage.reports.limit === 999999 ? '∞' : usage.reports.limit}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${getUsagePercentage(usage.reports.current, usage.reports.limit)}%`,
                    height: '100%',
                    background: getUsageColor(getUsagePercentage(usage.reports.current, usage.reports.limit)),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Users */}
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#333' }}>Users</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {usage.users.current} / {usage.users.limit}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${getUsagePercentage(usage.users.current, usage.users.limit)}%`,
                    height: '100%',
                    background: getUsageColor(getUsagePercentage(usage.users.current, usage.users.limit)),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Period Toggle */}
          {currentTier === 'starter' && (
            <>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  background: '#f0f0f0',
                  borderRadius: '8px',
                  padding: '4px',
                }}>
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: billingPeriod === 'monthly' ? '#2E8B57' : 'transparent',
                      color: billingPeriod === 'monthly' ? 'white' : '#666',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: billingPeriod === 'yearly' ? '#2E8B57' : 'transparent',
                      color: billingPeriod === 'yearly' ? 'white' : '#666',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Yearly (Save 30%)
                  </button>
                </div>
              </div>

              {/* Subscription Tiers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {(['pro', 'business'] as const).map((tier) => {
                  const tierInfo = tierFeatures[tier];
                  const pricing = getPriceDisplay(tier, billingPeriod);

                  return (
                    <div
                      key={tier}
                      style={{
                        border: `2px solid ${selectedTier === tier ? tierInfo.color : '#e0e0e0'}`,
                        borderRadius: '12px',
                        padding: '24px',
                        background: selectedTier === tier ? `${tierInfo.color}0a` : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setSelectedTier(tier)}
                    >
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{
                          margin: '0 0 8px 0',
                          color: tierInfo.color,
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          {tierInfo.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#333'
                          }}>
                            {pricing.amount} GHS
                          </span>
                          <span style={{ color: '#666', fontSize: '14px' }}>
                            / {billingPeriod === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {pricing.savings > 0 && (
                          <div style={{
                            color: '#2E8B57',
                            fontSize: '12px',
                            fontWeight: '600',
                            marginTop: '4px'
                          }}>
                            Save {pricing.savings} GHS per year
                          </div>
                        )}
                        {(pricing.trialDays || 0) > 0 && (
                          <div style={{
                            color: '#3498db',
                            fontSize: '12px',
                            fontWeight: '600',
                            marginTop: '4px'
                          }}>
                            {pricing.trialDays || 0} days free trial
                          </div>
                        )}
                      </div>

                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {tierInfo.features.map((feature, index) => (
                          <li key={index} style={{
                            padding: '4px 0',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ color: '#2E8B57' }}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpgrade(tier);
                        }}
                        disabled={loading.payment}
                        style={{
                          width: '100%',
                          padding: '12px',
                          marginTop: '20px',
                          background: tierInfo.color,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: loading.payment ? 'not-allowed' : 'pointer',
                          opacity: loading.payment ? 0.7 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading.payment ? 'Processing...' : `Upgrade to ${tierInfo.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Current Tier Benefits */}
          {currentTier !== 'starter' && (
            <div style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
                Your {tierFeatures[currentTier].name} Plan Benefits
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Features</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
                    {tierFeatures[currentTier].features.map((feature, index) => (
                      <li key={index} style={{
                        padding: '2px 0',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#2E8B57' }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Billing Info</h4>
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    {billing.currentPeriodEnd && (
                      <div>Next billing: {new Date(billing.currentPeriodEnd).toLocaleDateString()}</div>
                    )}
                    {billing.totalPaid > 0 && (
                      <div>Total paid: {billing.totalPaid} GHS</div>
                    )}
                    {billing.cancelAtPeriodEnd && (
                      <div style={{ color: '#DC143C', fontWeight: '600' }}>
                        Subscription will cancel at period end
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTierManager;