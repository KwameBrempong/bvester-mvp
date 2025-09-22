import React, { useState } from 'react';
import { stripeService } from './stripeService';

interface SubscriptionManagerProps {
  user: any;
  userProfile: any;
  onClose: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ user, userProfile, onClose }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const priceConfig = stripeService.getPriceConfig();

  const handleSubscription = async (planType: 'pro' | 'business') => {
    setLoading(planType);

    try {
      const priceInfo = priceConfig.platform[planType][billingPeriod];
      const priceId = typeof priceInfo === 'string' ? priceInfo : priceInfo.priceId;

      await stripeService.createCheckoutSession({
        priceId,
        userId: user?.username || user?.userId || 'anonymous',
        customerEmail: user?.signInDetails?.loginId || userProfile?.email || 'user@bvester.com',
        successUrl: `${window.location.origin}/subscription-success?plan=${planType}&period=${billingPeriod}`,
        cancelUrl: `${window.location.origin}/subscription-cancelled`,
        metadata: {
          planType,
          billingPeriod,
          userId: user?.username || user?.userId || 'anonymous',
          businessName: userProfile?.businessName || 'Unknown'
        }
      });
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Sorry, there was an error processing your subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleAcceleratorEnrollment = async (paymentType: 'full' | 'installment') => {
    setLoading(`accelerator_${paymentType}`);

    try {
      const priceInfo = priceConfig.accelerator[paymentType];
      const priceId = typeof priceInfo === 'string' ? priceInfo : priceInfo.priceId;

      await stripeService.createCheckoutSession({
        priceId,
        userId: user?.username || user?.userId || 'anonymous',
        customerEmail: user?.signInDetails?.loginId || userProfile?.email || 'user@bvester.com',
        successUrl: `${window.location.origin}/accelerator-success?type=${paymentType}`,
        cancelUrl: `${window.location.origin}/accelerator-cancelled`,
        metadata: {
          productType: 'accelerator',
          paymentType,
          userId: user?.username || user?.userId || 'anonymous',
          businessName: userProfile?.businessName || 'Unknown'
        }
      });
    } catch (error) {
      console.error('Accelerator enrollment error:', error);
      alert('Sorry, there was an error processing your enrollment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getPlanPrice = (planType: 'pro' | 'business') => {
    const priceInfo = priceConfig.platform[planType][billingPeriod];
    const amount = typeof priceInfo === 'string' ? 0 : priceInfo.amount;
    const monthlyPrice = priceConfig.platform[planType].monthly;
    const monthlyAmount = typeof monthlyPrice === 'string' ? 0 : monthlyPrice.amount;

    if (billingPeriod === 'yearly') {
      return {
        price: amount,
        period: 'year',
        savings: (monthlyAmount * 12) - amount,
        monthlyEquivalent: Math.round(amount / 12),
        trialDays: typeof priceInfo === 'string' ? 0 : priceInfo.trialDays || 0,
      };
    }
    return {
      price: amount,
      period: 'month',
      savings: 0,
      monthlyEquivalent: amount,
      trialDays: typeof priceInfo === 'string' ? 0 : priceInfo.trialDays || 0,
    };
  };

  const proPrice = getPlanPrice('pro');
  const businessPrice = getPlanPrice('business');

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      background: 'rgba(0,0,0,0.8)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        width: '90%', 
        maxWidth: '900px',
        height: '90%',
        maxHeight: '700px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2E8B57, #3CB371)', 
          color: 'white', 
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Choose Your Plan</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Unlock premium features for your Ghana SME</p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '30px'
        }}>
          {/* Platform Subscriptions */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Platform Access</h3>
              
              {/* Billing Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', color: billingPeriod === 'monthly' ? '#333' : '#666' }}>Monthly</span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                  style={{
                    width: '50px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: billingPeriod === 'yearly' ? '#2E8B57' : '#ccc',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: billingPeriod === 'yearly' ? '28px' : '2px',
                    transition: 'all 0.3s'
                  }} />
                </button>
                <span style={{ fontSize: '14px', color: billingPeriod === 'yearly' ? '#333' : '#666' }}>
                  Yearly <span style={{ fontSize: '12px', background: '#FFD700', color: '#333', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>Save 30%</span>
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Pro Plan */}
              <div style={{ 
                border: '2px solid #e0e0e0', 
                borderRadius: '12px', 
                padding: '25px',
                background: '#f8f9fa'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>Pro Plan</h4>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#2E8B57' }}>
                    {proPrice.price} GHS
                  </span>
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '5px' }}>
                    /{proPrice.period}
                  </span>
                  {billingPeriod === 'yearly' && (
                    <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '5px' }}>
                      Save {proPrice.savings} GHS/year • {proPrice.monthlyEquivalent} GHS/month
                    </div>
                  )}
                </div>
                <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 20px', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>Unlimited transaction records</li>
                  <li>Detailed PDF assessment reports</li>
                  <li>Priority customer support</li>
                  <li>Advanced dashboard analytics</li>
                  <li>Export data to Excel/PDF</li>
                </ul>
                <button 
                  onClick={() => handleSubscription('pro')}
                  disabled={loading === 'pro'}
                  style={{ 
                    width: '100%',
                    padding: '12px', 
                    background: loading === 'pro' ? '#ccc' : '#2E8B57', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: loading === 'pro' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {loading === 'pro' ? 'Processing...' : 'Choose Pro Plan'}
                </button>
              </div>

              {/* Business Plan */}
              <div style={{ 
                border: '2px solid #3498db', 
                borderRadius: '12px', 
                padding: '25px',
                background: 'linear-gradient(135deg, #f8f9ff, #e8f4ff)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  right: '20px', 
                  background: '#3498db', 
                  color: 'white', 
                  padding: '5px 15px', 
                  borderRadius: '20px', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  RECOMMENDED
                </div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>Business Plan</h4>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
                    {businessPrice.price} GHS
                  </span>
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '5px' }}>
                    /{businessPrice.period}
                  </span>
                  {billingPeriod === 'yearly' && (
                    <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '5px' }}>
                      Save {businessPrice.savings} GHS/year • {businessPrice.monthlyEquivalent} GHS/month
                    </div>
                  )}
                </div>
                <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 20px', fontSize: '14px', lineHeight: '1.6' }}>
                  <li><strong>Everything in Pro, plus:</strong></li>
                  <li>AI Business Advisor (coming soon)</li>
                  <li>Team member access (up to 5 users)</li>
                  <li>Advanced financial forecasting</li>
                  <li>Custom business templates</li>
                  <li>Priority phone support</li>
                </ul>
                <button 
                  onClick={() => handleSubscription('business')}
                  disabled={loading === 'business'}
                  style={{ 
                    width: '100%',
                    padding: '12px', 
                    background: loading === 'business' ? '#ccc' : '#3498db', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: loading === 'business' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {loading === 'business' ? 'Processing...' : 'Choose Business Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* Growth Accelerator Program */}
          <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>Growth Accelerator Program</h3>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Comprehensive 7-module business development program designed to achieve 90% investment readiness for Ghana SMEs.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Full Payment */}
              <div style={{ 
                border: '2px solid #e74c3c', 
                borderRadius: '12px', 
                padding: '25px',
                background: 'linear-gradient(135deg, #fff8f8, #ffe8e8)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>Full Program</h4>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>2,000 GHS</span>
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '5px' }}>one-time</span>
                  <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '5px' }}>
                    Best Value • Save 250 GHS
                  </div>
                </div>
                <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 20px', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>All 7 business development modules</li>
                  <li>Investment readiness certification</li>
                  <li>Lifetime access to content updates</li>
                  <li>Priority mentor matching (when available)</li>
                  <li>SME community access</li>
                </ul>
                <button 
                  onClick={() => handleAcceleratorEnrollment('full')}
                  disabled={loading === 'accelerator_full'}
                  style={{ 
                    width: '100%',
                    padding: '12px', 
                    background: loading === 'accelerator_full' ? '#ccc' : '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: loading === 'accelerator_full' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {loading === 'accelerator_full' ? 'Processing...' : 'Enroll Full Program'}
                </button>
              </div>

              {/* 3-Month Payment Plan */}
              <div style={{ 
                border: '2px solid #f39c12', 
                borderRadius: '12px', 
                padding: '25px',
                background: 'linear-gradient(135deg, #fffaf5, #fff3e0)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>3-Month Plan</h4>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#f39c12' }}>750 GHS</span>
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '5px' }}>/month × 3</span>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Total: 2,250 GHS
                  </div>
                </div>
                <ul style={{ margin: '0 0 20px 0', padding: '0 0 0 20px', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>Same comprehensive program</li>
                  <li>Spread payments over 3 months</li>
                  <li>Immediate access to all modules</li>
                  <li>All certification benefits</li>
                  <li>Flexible payment schedule</li>
                </ul>
                <button 
                  onClick={() => handleAcceleratorEnrollment('installment')}
                  disabled={loading === 'accelerator_installment'}
                  style={{ 
                    width: '100%',
                    padding: '12px', 
                    background: loading === 'accelerator_installment' ? '#ccc' : '#f39c12', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: loading === 'accelerator_installment' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {loading === 'accelerator_installment' ? 'Processing...' : 'Start 3-Month Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* Early Bird Notice */}
          <div style={{ 
            background: 'linear-gradient(135deg, #FFD700, #FFA500)', 
            padding: '20px', 
            borderRadius: '12px', 
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
              Limited Time: First 100 SMEs Get 20% Off Growth Accelerator!
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Join the founding cohort of Ghana's premier SME investment readiness program
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;