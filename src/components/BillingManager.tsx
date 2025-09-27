import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  useBillingInfo,
  usePaymentHistory,
  useSubscriptionTier,
  useSubscriptionLoading,
} from '../store/hooks';
import { fetchPaymentHistory, fetchSubscription } from '../store/slices/subscriptionSlice';
import { stripeService } from '../stripeService';

interface BillingManagerProps {
  userId: string;
  userEmail: string;
  customerId?: string;
  onClose?: () => void;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string;
  period_start: number;
  period_end: number;
}

const BillingManager: React.FC<BillingManagerProps> = ({
  userId,
  userEmail,
  customerId,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const billing = useBillingInfo();
  const paymentHistory = usePaymentHistory();
  const tier = useSubscriptionTier();
  const loading = useSubscriptionLoading();

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'methods'>('overview');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      console.log('BillingManager: Fetching subscription data for userId:', userId);
      dispatch(fetchSubscription(userId))
        .then((result) => {
          console.log('BillingManager: fetchSubscription result:', result);
        })
        .catch((error) => {
          console.error('BillingManager: fetchSubscription error:', error);
        });

      dispatch(fetchPaymentHistory(userId))
        .then((result) => {
          console.log('BillingManager: fetchPaymentHistory result:', result);
        })
        .catch((error) => {
          console.error('BillingManager: fetchPaymentHistory error:', error);
        });

      loadBillingData();
    }
  }, [userId, dispatch]);

  const loadBillingData = async () => {
    if (!customerId) {
      console.log('No customerId available, skipping billing data load');
      return;
    }

    console.log('Loading billing data for customerId:', customerId);
    setIsLoading(true);
    try {
      const [methods, invoiceList] = await Promise.all([
        stripeService.getPaymentMethods(customerId),
        stripeService.getInvoices(customerId)
      ]);

      console.log('Billing data loaded:', { methods, invoiceList });
      setPaymentMethods(methods);
      setInvoices(invoiceList);
    } catch (error) {
      setError('Failed to load billing information');
      console.error('Error loading billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!customerId) return;

    setIsLoading(true);
    try {
      const returnUrl = window.location.origin;
      const portalUrl = await stripeService.createCustomerPortalSession(customerId, returnUrl);

      if (portalUrl) {
        window.open(portalUrl, '_blank');
      }
    } catch (error) {
      setError('Failed to open billing portal');
      console.error('Error opening portal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GHS') => {
    return `${amount.toLocaleString()} ${currency.toUpperCase()}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return '#2E8B57';
      case 'pending': return '#f39c12';
      case 'failed': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const TabButton = ({ id, label, isActive, onClick }: {
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      style={{
        padding: '12px 24px',
        border: 'none',
        borderBottom: isActive ? '2px solid #2E8B57' : '2px solid transparent',
        background: 'transparent',
        color: isActive ? '#2E8B57' : '#666',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s ease'
      }}
    >
      {label}
    </button>
  );

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
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
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
              Billing & Invoices
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              Manage your subscription billing and payment methods
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

        {/* Tabs */}
        <div style={{
          borderBottom: '1px solid #e0e0e0',
          display: 'flex'
        }}>
          <TabButton
            id="overview"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="invoices"
            label="Invoices"
            isActive={activeTab === 'invoices'}
            onClick={() => setActiveTab('invoices')}
          />
          <TabButton
            id="methods"
            label="Payment Methods"
            isActive={activeTab === 'methods'}
            onClick={() => setActiveTab('methods')}
          />
        </div>

        <div style={{ padding: '24px', maxHeight: '60vh', overflow: 'auto' }}>
          {error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #ffcdd2',
              color: '#d32f2f',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Current Plan */}
                <div style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '18px' }}>Current Plan</h3>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2E8B57', marginBottom: '8px' }}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                  </div>
                  {billing.currentPeriodEnd && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Next billing: {new Date(billing.currentPeriodEnd).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Total Paid */}
                <div style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '18px' }}>Total Paid</h3>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2E8B57', marginBottom: '8px' }}>
                    {formatCurrency(billing.totalPaid)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Lifetime payments
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={openCustomerPortal}
                    disabled={!customerId || isLoading}
                    style={{
                      padding: '12px 16px',
                      background: '#2E8B57',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: customerId && !isLoading ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      opacity: customerId && !isLoading ? 1 : 0.7
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Manage Billing'}
                  </button>

                  <button
                    onClick={() => setActiveTab('invoices')}
                    style={{
                      padding: '12px 16px',
                      background: 'white',
                      color: '#2E8B57',
                      border: '1px solid #2E8B57',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    View Invoices
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px' }}>Invoice History</h3>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Loading invoices...
                </div>
              ) : invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No invoices found
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          {formatCurrency(invoice.amount_paid, invoice.currency)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: 'white',
                            background: getStatusColor(invoice.status)
                          }}
                        >
                          {invoice.status.toUpperCase()}
                        </span>
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '6px 12px',
                              background: '#2E8B57',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'methods' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px' }}>Payment Methods</h3>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Loading payment methods...
                </div>
              ) : (
                <div>
                  {paymentMethods.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No payment methods found
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          style={{
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '24px',
                              background: '#f0f0f0',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#666'
                            }}>
                              {method.card?.brand.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>
                                •••• •••• •••• {method.card?.last4}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                Expires {method.card?.exp_month}/{method.card?.exp_year}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0 0 12px 0', color: '#666' }}>
                      To add or modify payment methods, use the billing portal
                    </p>
                    <button
                      onClick={openCustomerPortal}
                      disabled={!customerId || isLoading}
                      style={{
                        padding: '10px 16px',
                        background: '#2E8B57',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: customerId && !isLoading ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        opacity: customerId && !isLoading ? 1 : 0.7
                      }}
                    >
                      {isLoading ? 'Loading...' : 'Manage Payment Methods'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingManager;