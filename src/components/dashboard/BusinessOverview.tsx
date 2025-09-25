import React, { useState, useEffect } from 'react';
import { useUser } from '../../store/hooks';

interface BusinessMetrics {
  profileCompleteness: number;
  verificationStatus: {
    email: boolean;
    phone: boolean;
    business: boolean;
  };
  businessHealth: number;
  investmentReadiness: number;
  growthPotential: 'high' | 'medium' | 'low';
}

const BusinessOverview: React.FC = () => {
  const userState = useUser();
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userProfile = userState.profile;

  useEffect(() => {
    calculateMetrics();
  }, [userProfile]);

  const calculateMetrics = async () => {
    setIsLoading(true);

    // Simulate API call delay for real-world feel
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!userProfile) {
      setIsLoading(false);
      return;
    }

    // Calculate profile completeness with weighted scoring
    const requiredFields = [
      'businessName', 'businessType', 'location', 'region', 'businessDescription'
    ];
    const enhancementFields = [
      'yearEstablished', 'employeeCount', 'monthlyRevenue', 'fundingNeeded'
    ];

    const requiredScore = requiredFields.filter(field =>
      userProfile[field as keyof typeof userProfile]
    ).length / requiredFields.length * 60;

    const enhancementScore = enhancementFields.filter(field =>
      userProfile[field as keyof typeof userProfile]
    ).length / enhancementFields.length * 30;

    const verificationScore = (
      (userProfile.isEmailVerified ? 3 : 0) +
      (userProfile.isPhoneVerified ? 4 : 0) +
      (userProfile.isBusinessVerified ? 3 : 0)
    );

    const profileCompleteness = Math.round(requiredScore + enhancementScore + verificationScore);

    // Calculate business health score
    const businessAge = userProfile.yearEstablished
      ? new Date().getFullYear() - parseInt(userProfile.yearEstablished)
      : 0;

    const ageScore = Math.min(25, businessAge * 5); // Max 25 points for 5+ years
    const teamScore = userProfile.employeeCount ?
      userProfile.employeeCount.includes('1-5') ? 10 :
      userProfile.employeeCount.includes('6-20') ? 20 :
      userProfile.employeeCount.includes('21-50') ? 25 : 30 : 0;

    const revenueScore = userProfile.monthlyRevenue ?
      userProfile.monthlyRevenue.includes('0-5000') ? 10 :
      userProfile.monthlyRevenue.includes('5000-20000') ? 20 :
      userProfile.monthlyRevenue.includes('20000-50000') ? 30 :
      userProfile.monthlyRevenue.includes('50000-100000') ? 40 : 45 : 0;

    const businessHealth = Math.round(ageScore + teamScore + revenueScore);

    // Calculate investment readiness
    const investmentReadiness = Math.round(
      profileCompleteness * 0.4 +
      businessHealth * 0.4 +
      (userProfile.businessDescription?.length || 0) / 10 * 0.2
    );

    // Determine growth potential
    let growthPotential: 'high' | 'medium' | 'low' = 'low';
    if (investmentReadiness >= 75) growthPotential = 'high';
    else if (investmentReadiness >= 50) growthPotential = 'medium';

    const calculatedMetrics: BusinessMetrics = {
      profileCompleteness,
      verificationStatus: {
        email: userProfile.isEmailVerified || false,
        phone: userProfile.isPhoneVerified || false,
        business: userProfile.isBusinessVerified || false,
      },
      businessHealth,
      investmentReadiness,
      growthPotential
    };

    setMetrics(calculatedMetrics);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="card fade-in">
        <div className="card-header">
          <h3 className="card-title">
            <span>📊</span>
            Business Overview
          </h3>
          <p className="card-subtitle">Analyzing your business metrics...</p>
        </div>
        <div className="card-body">
          <div className="skeleton skeleton-title mb-lg"></div>
          <div className="skeleton skeleton-text mb-md"></div>
          <div className="skeleton skeleton-text mb-lg" style={{ width: '70%' }}></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    );
  }

  if (!metrics || !userProfile) {
    return (
      <div className="card card-warning fade-in">
        <div className="card-body text-center">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📋</div>
          <h3 className="text-xl font-bold mb-md">Complete Your Profile</h3>
          <p className="text-sm text-gray mb-0">
            We need more information about your business to generate insights.
          </p>
        </div>
      </div>
    );
  }

  const getGrowthPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'var(--success-primary)';
      case 'medium': return 'var(--warning-primary)';
      default: return 'var(--gray-500)';
    }
  };

  const getGrowthPotentialIcon = (potential: string) => {
    switch (potential) {
      case 'high': return '🚀';
      case 'medium': return '📈';
      default: return '🌱';
    }
  };

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h3 className="card-title">
          <span>📊</span>
          Business Overview
        </h3>
        <p className="card-subtitle">Your investment readiness snapshot</p>
      </div>

      <div className="card-body">
        {/* Key Metrics Grid */}
        <div className="dashboard-grid mb-xl" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          {/* Investment Readiness Score */}
          <div className="metric">
            <span className="metric-value" style={{ color: 'var(--gold-primary)' }}>
              {metrics.investmentReadiness}%
            </span>
            <span className="metric-label">Investment Readiness</span>
            <div className="progress mt-sm">
              <div
                className="progress-bar"
                style={{ width: `${metrics.investmentReadiness}%` }}
              ></div>
            </div>
          </div>

          {/* Business Health Score */}
          <div className="metric">
            <span className="metric-value" style={{ color: getGrowthPotentialColor(metrics.growthPotential) }}>
              {metrics.businessHealth}%
            </span>
            <span className="metric-label">Business Health</span>
            <div className="metric-trend" style={{ justifyContent: 'center' }}>
              <span>{getGrowthPotentialIcon(metrics.growthPotential)}</span>
              <span style={{ textTransform: 'capitalize' }}>{metrics.growthPotential} Growth Potential</span>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="mb-lg">
          <h4 className="text-lg font-semibold mb-md text-black">Business Information</h4>
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', alignItems: 'start' }}>
            <div>
              <div className="mb-md">
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-sm text-gray">Business Type</span>
                  <span className="badge badge-primary">{userProfile.businessType || 'Not specified'}</span>
                </div>
              </div>

              <div className="mb-md">
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-sm text-gray">Location</span>
                  <span className="text-sm font-medium text-black">
                    📍 {userProfile.location}, {userProfile.region}
                  </span>
                </div>
              </div>

              {userProfile.yearEstablished && (
                <div className="mb-md">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-sm text-gray">Founded</span>
                    <span className="text-sm font-medium text-black">
                      🗓️ {userProfile.yearEstablished}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              {userProfile.employeeCount && (
                <div className="mb-md">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-sm text-gray">Team Size</span>
                    <span className="text-sm font-medium text-black">
                      👥 {userProfile.employeeCount}
                    </span>
                  </div>
                </div>
              )}

              {userProfile.monthlyRevenue && (
                <div className="mb-md">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-sm text-gray">Revenue Range</span>
                    <span className="text-sm font-medium text-black">
                      💰 ₵{userProfile.monthlyRevenue}/month
                    </span>
                  </div>
                </div>
              )}

              {userProfile.fundingNeeded && (
                <div className="mb-md">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-sm text-gray">Funding Goal</span>
                    <span className="text-sm font-medium text-success">
                      🎯 ₵{parseInt(userProfile.fundingNeeded).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="mb-lg">
          <h4 className="text-lg font-semibold mb-md text-black">Verification Status</h4>
          <div className="flex gap-md">
            <div className={`badge ${metrics.verificationStatus.email ? 'badge-success' : 'badge-warning'}`}>
              <span>{metrics.verificationStatus.email ? '✅' : '⚠️'}</span>
              Email {metrics.verificationStatus.email ? 'Verified' : 'Pending'}
            </div>
            <div className={`badge ${metrics.verificationStatus.phone ? 'badge-success' : 'badge-warning'}`}>
              <span>{metrics.verificationStatus.phone ? '✅' : '⚠️'}</span>
              Phone {metrics.verificationStatus.phone ? 'Verified' : 'Pending'}
            </div>
            <div className={`badge ${metrics.verificationStatus.business ? 'badge-success' : 'badge-neutral'}`}>
              <span>{metrics.verificationStatus.business ? '✅' : '📋'}</span>
              Business {metrics.verificationStatus.business ? 'Verified' : 'Documentation'}
            </div>
          </div>
        </div>

        {/* Business Description */}
        {userProfile.businessDescription && (
          <div>
            <h4 className="text-lg font-semibold mb-md text-black">Business Description</h4>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
                <p className="text-sm text-gray mb-0" style={{ lineHeight: 1.6 }}>
                  {userProfile.businessDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Readiness Tips */}
      {metrics.investmentReadiness < 80 && (
        <div className="card-footer">
          <div className="flex items-center gap-md">
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <div>
              <h5 className="text-sm font-semibold mb-xs text-black">Boost Your Investment Readiness</h5>
              <p className="text-xs text-gray mb-0">
                {!metrics.verificationStatus.email && 'Verify your email • '}
                {!metrics.verificationStatus.phone && 'Add phone verification • '}
                {!userProfile.businessDescription && 'Add business description • '}
                {!userProfile.yearEstablished && 'Add founding year • '}
                {!userProfile.employeeCount && 'Specify team size • '}
                {!userProfile.monthlyRevenue && 'Add revenue information'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOverview;