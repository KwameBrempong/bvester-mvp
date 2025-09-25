import React from 'react';
import { useUser, useUserRole } from '../../store/hooks';

interface DashboardHeaderProps {
  user?: any;
  signOut?: () => void;
  onEditProfile?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  signOut,
  onEditProfile
}) => {
  const userState = useUser();
  const userRole = useUserRole();

  const userProfile = userState.profile;
  const completionPercentage = userProfile?.profileCompletionPercentage || 0;

  // Calculate investment readiness score
  const investmentReadinessScore = Math.min(100, Math.round(
    (completionPercentage * 0.4) +
    ((userProfile?.isEmailVerified ? 15 : 0) +
     (userProfile?.isPhoneVerified ? 10 : 0) +
     (userProfile?.businessDescription ? 15 : 0) +
     (userProfile?.yearEstablished ? 10 : 0) +
     (userProfile?.employeeCount ? 10 : 0))
  ));

  return (
    <div className="card card-primary scale-in">
      <div className="card-body">
        <div className="dashboard-grid" style={{ alignItems: 'center', marginBottom: 0 }}>
          <div>
            {/* Welcome Section */}
            <div className="mb-md">
              <h1 className="text-2xl font-bold mb-xs" style={{ color: 'var(--black-primary)' }}>
                🇬🇭 Welcome Back, {user?.username}!
              </h1>
              <p className="text-base font-medium mb-0" style={{ color: 'var(--black-secondary)' }}>
                {userProfile?.businessName || 'Your Business'} • {userProfile?.location}, {userProfile?.region}
              </p>
            </div>

            {/* Key Status Indicators */}
            <div className="flex gap-md items-center mb-lg">
              <div className="badge badge-primary">
                <span>📊</span>
                Investment Ready: {investmentReadinessScore}%
              </div>
              <div className="badge badge-success">
                <span>🎯</span>
                {userRole === 'owner' ? 'SME Owner' : 'Business Viewer'}
              </div>
              {userProfile?.businessType && (
                <div className="badge badge-neutral">
                  <span>🏢</span>
                  {userProfile.businessType}
                </div>
              )}
            </div>

            {/* Progress Towards Investment Readiness */}
            <div className="mb-lg">
              <div className="flex justify-between items-center mb-sm">
                <span className="text-sm font-semibold" style={{ color: 'var(--black-primary)' }}>
                  🚀 Investment Readiness Progress
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--black-primary)' }}>
                  {investmentReadinessScore}%
                </span>
              </div>
              <div className="progress progress-lg">
                <div
                  className="progress-bar"
                  style={{
                    width: `${investmentReadinessScore}%`,
                    background: `linear-gradient(90deg, var(--black-primary), var(--black-secondary))`
                  }}
                ></div>
              </div>
              <p className="text-xs mt-xs mb-0" style={{ color: 'var(--black-secondary)' }}>
                {investmentReadinessScore >= 80
                  ? '🎉 Excellent! You\'re nearly investment-ready'
                  : investmentReadinessScore >= 60
                  ? '📈 Good progress! Complete your profile to boost readiness'
                  : '🎯 Let\'s build your investment readiness score'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-sm items-center">
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="btn btn-outline btn-sm"
                aria-label="Edit business profile"
              >
                <span>✏️</span>
                Edit Profile
              </button>
            )}
            {signOut && (
              <button
                onClick={signOut}
                className="btn btn-ghost btn-sm"
                aria-label="Sign out of account"
              >
                <span>🚪</span>
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Investment Readiness Mission Statement */}
        <div
          className="card"
          style={{
            background: 'rgba(10, 10, 10, 0.05)',
            border: '1px solid rgba(10, 10, 10, 0.1)',
            marginTop: 'var(--space-lg)',
            marginBottom: 0
          }}
        >
          <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
            <div className="flex items-center gap-md">
              <div style={{ fontSize: '2rem' }}>🎯</div>
              <div>
                <h3 className="text-lg font-bold mb-xs" style={{ color: 'var(--black-primary)' }}>
                  Preparing Ghana's SMEs for Investment Success
                </h3>
                <p className="text-sm mb-0" style={{ color: 'var(--black-secondary)', lineHeight: 1.5 }}>
                  We're building a pipeline of <strong>1,000 investment-ready SMEs</strong> by Q2 2025.
                  Use our growth tools to strengthen your business and be first in line when our full investment platform launches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;