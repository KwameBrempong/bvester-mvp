import React from 'react';
import { useSubscriptionTier } from '../../store/hooks';
import { isFeatureEnabled } from '../../config/featureFlags';

interface GrowthToolsWidgetProps {
  onOpenGrowthAccelerator: () => void;
  onOpenTransactionRecorder: () => void;
  onOpenBusinessAnalysis: () => void;
  onOpenBusinessAssessment: () => void;
  onOpenSubscriptionManager: () => void;
}

interface GrowthTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'primary' | 'secondary' | 'tertiary';
  isPremium: boolean;
  isComingSoon: boolean;
  compliance: 'safe' | 'educational' | 'preparation';
  onClick: () => void;
}

const GrowthToolsWidget: React.FC<GrowthToolsWidgetProps> = ({
  onOpenGrowthAccelerator,
  onOpenTransactionRecorder,
  onOpenBusinessAnalysis,
  onOpenBusinessAssessment,
  onOpenSubscriptionManager
}) => {
  const subscriptionTier = useSubscriptionTier();

  const growthTools: GrowthTool[] = [
    {
      id: 'investment_accelerator',
      title: 'Investment Accelerator Program',
      description: 'Transform from struggling SME to investment-ready business in 90 days',
      icon: '🚀',
      category: 'primary',
      isPremium: false,
      isComingSoon: false,
      compliance: 'educational',
      onClick: onOpenGrowthAccelerator
    },
    {
      id: 'transaction-recorder',
      title: 'Smart Transaction Tracker',
      description: 'Record and categorize business transactions with AI assistance',
      icon: '💬',
      category: 'secondary',
      isPremium: false,
      isComingSoon: false,
      compliance: 'safe',
      onClick: onOpenTransactionRecorder
    },
    {
      id: 'business-analysis',
      title: 'Business Health Analytics',
      description: 'AI-powered insights into your business performance and trends',
      icon: '📊',
      category: 'secondary',
      isPremium: false,
      isComingSoon: false,
      compliance: 'educational',
      onClick: onOpenBusinessAnalysis
    },
    {
      id: 'assessment',
      title: isFeatureEnabled('useInvestmentXRay') ? 'Investment X-Ray' : 'Business Assessment',
      description: isFeatureEnabled('useInvestmentXRay') ?
        '7-minute comprehensive investment readiness evaluation' :
        'Comprehensive business readiness evaluation',
      icon: '🎯',
      category: 'tertiary',
      isPremium: false,
      isComingSoon: false,
      compliance: 'preparation',
      onClick: onOpenBusinessAssessment
    },
    {
      id: 'financial-projections',
      title: 'Financial Projections Builder',
      description: 'Create professional financial forecasts and business plans',
      icon: '📈',
      category: 'secondary',
      isPremium: true,
      isComingSoon: true,
      compliance: 'preparation',
      onClick: () => console.log('Coming soon')
    },
    {
      id: 'compliance-checker',
      title: 'Regulatory Compliance Tracker',
      description: 'Track Ghana business registrations and compliance requirements',
      icon: '✅',
      category: 'tertiary',
      isPremium: true,
      isComingSoon: true,
      compliance: 'safe',
      onClick: () => console.log('Coming soon')
    },
    {
      id: 'market-research',
      title: 'Ghana Market Intelligence',
      description: 'Local market data, trends, and competitive analysis',
      icon: '🇬🇭',
      category: 'tertiary',
      isPremium: true,
      isComingSoon: true,
      compliance: 'educational',
      onClick: () => console.log('Coming soon')
    }
  ];

  const primaryTools = growthTools.filter(tool => tool.category === 'primary');
  const secondaryTools = growthTools.filter(tool => tool.category === 'secondary');
  const tertiaryTools = growthTools.filter(tool => tool.category === 'tertiary');

  const getButtonVariant = (tool: GrowthTool) => {
    if (tool.isComingSoon) return 'btn-ghost';
    if (tool.category === 'primary') return 'btn-primary';
    if (tool.category === 'secondary') return 'btn-secondary';
    return 'btn-outline';
  };

  const getComplianceIndicator = (compliance: string) => {
    switch (compliance) {
      case 'safe': return { color: 'var(--success-primary)', text: 'Fully Compliant' };
      case 'educational': return { color: 'var(--info-primary)', text: 'Educational Only' };
      case 'preparation': return { color: 'var(--warning-primary)', text: 'Preparation Focus' };
      default: return { color: 'var(--gray-500)', text: 'Standard' };
    }
  };

  const renderToolButton = (tool: GrowthTool) => {
    const compliance = getComplianceIndicator(tool.compliance);
    const isDisabled = tool.isComingSoon || (tool.isPremium && subscriptionTier === 'free');

    return (
      <div key={tool.id} className="card" style={{ background: isDisabled ? 'var(--gray-50)' : 'var(--white-primary)' }}>
        <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
          <div className="flex items-start gap-md mb-md">
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
              {tool.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 className="text-base font-semibold mb-xs text-black">
                {tool.title}
                {tool.isPremium && (
                  <span className="badge badge-primary ml-sm" style={{ fontSize: '0.65rem' }}>
                    PRO
                  </span>
                )}
                {tool.isComingSoon && (
                  <span className="badge badge-neutral ml-sm" style={{ fontSize: '0.65rem' }}>
                    SOON
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray mb-0" style={{ lineHeight: 1.4 }}>
                {tool.description}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
              <span style={{ color: compliance.color }}>●</span>
              {compliance.text}
            </div>

            <button
              className={`btn btn-sm ${getButtonVariant(tool)}`}
              onClick={tool.onClick}
              disabled={isDisabled}
            >
              {tool.isComingSoon ? 'Coming Soon' :
               isDisabled ? 'Upgrade Required' : 'Launch Tool'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">
          <span>🛠️</span>
          Growth Tools
        </h3>
        <p className="card-subtitle">Prepare your business for investment success</p>
      </div>

      <div className="card-body">
        {/* Primary Tools - Most Important */}
        <div className="mb-xl">
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-lg font-semibold text-black mb-0">🎯 Investment Readiness</h4>
            <span className="text-xs text-gray">Start here</span>
          </div>
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
            {primaryTools.map(renderToolButton)}
          </div>
        </div>

        {/* Secondary Tools - Core Features */}
        <div className="mb-xl">
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-lg font-semibold text-black mb-0">📊 Business Management</h4>
            <span className="text-xs text-gray">Build your foundation</span>
          </div>
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
            {secondaryTools.map(renderToolButton)}
          </div>
        </div>

        {/* Tertiary Tools - Additional Features */}
        <div className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-lg font-semibold text-black mb-0">🚀 Advanced Tools</h4>
            <span className="text-xs text-gray">Coming soon</span>
          </div>
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-md)' }}>
            {tertiaryTools.map(renderToolButton)}
          </div>
        </div>

        {/* Subscription Management */}
        <div
          className="card"
          style={{
            background: subscriptionTier === 'free' ?
              'linear-gradient(135deg, var(--gold-subtle), var(--gold-light))' :
              'var(--success-light)',
            border: `1px solid ${subscriptionTier === 'free' ? 'var(--gold-primary)' : 'var(--success-primary)'}`
          }}
        >
          <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold mb-xs text-black">
                  {subscriptionTier === 'free' ? '⬆️ Unlock Premium Tools' : '⚙️ Manage Subscription'}
                </h4>
                <p className="text-sm text-gray mb-0">
                  {subscriptionTier === 'free'
                    ? 'Get access to advanced business tools and exclusive features'
                    : 'Manage your subscription settings and billing information'
                  }
                </p>
              </div>
              <button
                className={`btn btn-sm ${subscriptionTier === 'free' ? 'btn-primary' : 'btn-outline'}`}
                onClick={onOpenSubscriptionManager}
              >
                {subscriptionTier === 'free' ? 'Upgrade Now' : 'Manage'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="flex items-center gap-md">
          <span style={{ fontSize: '1.25rem' }}>🔒</span>
          <div>
            <h5 className="text-sm font-semibold mb-xs text-black">SEC Compliance Notice</h5>
            <p className="text-xs text-gray mb-0">
              All tools focus on business development and education. Investment services will be available post-licensing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthToolsWidget;