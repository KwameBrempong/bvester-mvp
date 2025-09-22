import React, { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  useUsageStats,
  useSubscriptionFeatures,
  useSubscriptionTier,
  useSubscriptionLoading,
} from '../store/hooks';
import { updateUsageCount, refreshUsageStats } from '../store/slices/subscriptionSlice';

interface UsageTrackerProps {
  userId: string;
  compact?: boolean;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ userId, compact = false }) => {
  const dispatch = useAppDispatch();
  const usage = useUsageStats();
  const features = useSubscriptionFeatures();
  const tier = useSubscriptionTier();
  const loading = useSubscriptionLoading();

  useEffect(() => {
    if (userId) {
      dispatch(refreshUsageStats(userId));
    }
  }, [userId, dispatch]);

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

  const getUsageStatus = (current: number, limit: number) => {
    if (limit === 999999) return 'unlimited';
    const percentage = getUsagePercentage(current, limit);
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'good';
  };

  const UsageBar = ({
    label,
    current,
    limit,
    icon,
    upgradeMessage
  }: {
    label: string;
    current: number;
    limit: number;
    icon: string;
    upgradeMessage?: string;
  }) => {
    const percentage = getUsagePercentage(current, limit);
    const color = getUsageColor(percentage);
    const status = getUsageStatus(current, limit);

    return (
      <div style={{
        padding: compact ? '12px' : '16px',
        background: status === 'exceeded' ? '#fff5f5' : 'white',
        borderRadius: '8px',
        border: `1px solid ${status === 'exceeded' ? '#ffcdd2' : '#e0e0e0'}`,
        marginBottom: compact ? '8px' : '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{icon}</span>
            <span style={{ fontWeight: '600', color: '#333', fontSize: compact ? '14px' : '16px' }}>
              {label}
            </span>
            {status === 'exceeded' && (
              <span style={{
                padding: '2px 6px',
                background: '#DC143C',
                color: 'white',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                LIMIT EXCEEDED
              </span>
            )}
          </div>
          <span style={{
            color: status === 'exceeded' ? '#DC143C' : '#666',
            fontSize: compact ? '12px' : '14px',
            fontWeight: status === 'exceeded' ? 'bold' : 'normal'
          }}>
            {current} / {limit === 999999 ? '∞' : limit}
          </span>
        </div>

        <div style={{
          width: '100%',
          height: compact ? '4px' : '6px',
          background: '#f0f0f0',
          borderRadius: compact ? '2px' : '3px',
          overflow: 'hidden',
          marginBottom: status === 'exceeded' && upgradeMessage ? '8px' : '0'
        }}>
          <div style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            background: color,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {status === 'exceeded' && upgradeMessage && (
          <div style={{
            fontSize: '12px',
            color: '#DC143C',
            marginTop: '4px',
            fontWeight: '500'
          }}>
            {upgradeMessage}
          </div>
        )}

        {!compact && status !== 'exceeded' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
            <span>{limit - current} remaining</span>
            <span>{percentage}% used</span>
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div style={{
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, color: '#2E8B57', fontSize: '16px' }}>Usage Overview</h4>
          <div style={{
            padding: '4px 8px',
            background: tier === 'free' ? '#f0f0f0' : '#e8f5e8',
            color: tier === 'free' ? '#666' : '#2E8B57',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {tier.toUpperCase()}
          </div>
        </div>

        <UsageBar
          label="Transactions"
          current={usage.transactions.current}
          limit={usage.transactions.limit}
          icon="💰"
          upgradeMessage="Upgrade to Pro for 500 transactions/month"
        />

        <UsageBar
          label="Reports"
          current={usage.reports.current}
          limit={usage.reports.limit}
          icon="📊"
          upgradeMessage="Upgrade to Pro for 20 reports/month"
        />

        <UsageBar
          label="Users"
          current={usage.users.current}
          limit={usage.users.limit}
          icon="👥"
          upgradeMessage="Upgrade to Pro for 3 users"
        />
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#2E8B57', fontSize: '20px' }}>Usage Dashboard</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px 12px',
            background: tier === 'free' ? '#f0f0f0' : tier === 'pro' ? '#e3f2fd' : '#e8f5e8',
            color: tier === 'free' ? '#666' : tier === 'pro' ? '#1976d2' : '#2E8B57',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {tier.toUpperCase()} PLAN
          </div>
          <button
            onClick={() => dispatch(refreshUsageStats(userId))}
            disabled={loading.usage}
            style={{
              padding: '6px 12px',
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: loading.usage ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              color: '#666'
            }}
          >
            {loading.usage ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Detailed Usage Stats */}
      <div style={{ marginBottom: '24px' }}>
        <UsageBar
          label="Monthly Transactions"
          current={usage.transactions.current}
          limit={usage.transactions.limit}
          icon="💰"
          upgradeMessage={tier === 'free' ? "Upgrade to Pro for 500 transactions/month or Business for unlimited" : undefined}
        />

        <UsageBar
          label="Monthly Reports"
          current={usage.reports.current}
          limit={usage.reports.limit}
          icon="📊"
          upgradeMessage={tier === 'free' ? "Upgrade to Pro for 20 reports/month or Business for unlimited" : undefined}
        />

        <UsageBar
          label="Team Members"
          current={usage.users.current}
          limit={usage.users.limit}
          icon="👥"
          upgradeMessage={tier === 'free' ? "Upgrade to Pro for 3 users or Business for 10 users" : tier === 'pro' ? "Upgrade to Business for 10 users" : undefined}
        />
      </div>

      {/* Feature Access */}
      <div style={{
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>Available Features</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: features.canExportData ? '#2E8B57' : '#ccc' }}>
              {features.canExportData ? '✓' : '✗'}
            </span>
            <span style={{ color: features.canExportData ? '#333' : '#ccc' }}>Data Export</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: features.hasAdvancedAnalytics ? '#2E8B57' : '#ccc' }}>
              {features.hasAdvancedAnalytics ? '✓' : '✗'}
            </span>
            <span style={{ color: features.hasAdvancedAnalytics ? '#333' : '#ccc' }}>Advanced Analytics</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: features.hasAcceleratorAccess ? '#2E8B57' : '#ccc' }}>
              {features.hasAcceleratorAccess ? '✓' : '✗'}
            </span>
            <span style={{ color: features.hasAcceleratorAccess ? '#333' : '#ccc' }}>Growth Accelerator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: features.hasPhoneSupport ? '#2E8B57' : '#ccc' }}>
              {features.hasPhoneSupport ? '✓' : '✗'}
            </span>
            <span style={{ color: features.hasPhoneSupport ? '#333' : '#ccc' }}>Phone Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageTracker;