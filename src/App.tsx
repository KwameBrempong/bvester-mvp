import { useSubscription } from './useSubscription';
import { useState, useEffect, Suspense, lazy, memo } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useUser, useUserRole, useSubscriptionTier } from './store/hooks';
import {
  fetchUserProfile,
  setAuthenticated,
  updateUserProfile,
  createUserProfile,
  hydrateProfile
} from './store/slices/userSlice';
import ErrorBoundary from './components/ErrorBoundary';
import PermissionWrapper from './components/PermissionWrapper';
import UserProfileHeader from './components/UserProfileHeader';
import ProfileCompletionWidget from './components/ProfileCompletionWidget';
import { isFeatureEnabled } from './config/featureFlags';
import { profileUtils, UserProfile } from './services/dataService';
import './App.css';
// Import premium theme - it will only apply when feature is enabled
import './styles/premium-theme.css';

// Lazy load components for better performance
const SMEProfile = lazy(() => import('./SMEProfile'));
const GrowthAccelerator = lazy(() => import('./GrowthAccelerator'));
const InvestmentBootcamp = lazy(() => import('./components/InvestmentBootcamp'));
const ChatTransactionRecorder = lazy(() => import('./components/ChatTransactionRecorder'));
const BusinessAssessment = lazy(() => import('./BusinessAssessment'));
const InvestmentXRay = lazy(() => import('./components/InvestmentXRay'));
const SubscriptionManager = lazy(() => import('./SubscriptionManager'));
const UsageTracker = lazy(() => import('./components/UsageTracker'));
const SubscriptionTierManager = lazy(() => import('./components/SubscriptionTierManager'));
const BillingManager = lazy(() => import('./components/BillingManager'));
const BusinessAnalysisDashboard = lazy(() => import('./components/BusinessAnalysisDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #2E8B57',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
);

const buildUserProfile = (username: string, overrides: Partial<UserProfile> = {}): UserProfile => {
  const now = new Date().toISOString();

  const securitySettings = {
    mfaEnabled: overrides.securitySettings?.mfaEnabled ?? false,
    loginAttempts: overrides.securitySettings?.loginAttempts ?? 0,
    accountLocked: overrides.securitySettings?.accountLocked ?? false,
    lastPasswordChange: overrides.securitySettings?.lastPasswordChange,
    lockoutUntil: overrides.securitySettings?.lockoutUntil,
  };

  const preferences = {
    language: overrides.preferences?.language ?? 'en',
    currency: overrides.preferences?.currency ?? 'GHS',
    timezone: overrides.preferences?.timezone ?? 'Africa/Accra',
    notifications: {
      email: overrides.preferences?.notifications?.email ?? true,
      sms: overrides.preferences?.notifications?.sms ?? true,
      push: overrides.preferences?.notifications?.push ?? true,
    },
  };

  const profile: UserProfile = {
    userId: username,
    businessName: overrides.businessName ?? 'My Business',
    ownerName: overrides.ownerName ?? username,
    email: overrides.email ?? `${username}@example.com`,
    phone: overrides.phone ?? '',
    location: overrides.location ?? 'Accra',
    region: overrides.region ?? 'Greater Accra',
    businessType: overrides.businessType ?? 'SME',
    businessDescription: overrides.businessDescription ?? '',
    registrationNumber: overrides.registrationNumber ?? '',
    tinNumber: overrides.tinNumber ?? '',
    yearEstablished: overrides.yearEstablished ?? '',
    employeeCount: overrides.employeeCount ?? '',
    businessStage: overrides.businessStage ?? 'existing',
    profileCompletedAt: overrides.profileCompletedAt,
    lastUpdated: overrides.lastUpdated ?? now,
    role: overrides.role ?? 'owner',
    profileCompletionPercentage: overrides.profileCompletionPercentage ?? 0,
    isEmailVerified: overrides.isEmailVerified ?? false,
    isPhoneVerified: overrides.isPhoneVerified ?? false,
    isBusinessVerified: overrides.isBusinessVerified ?? false,
    stripeCustomerId: overrides.stripeCustomerId,
    verificationDocuments: overrides.verificationDocuments,
    securitySettings,
    preferences,
  };

  const updatedCompletion = profileUtils.calculateCompletionPercentage(profile);
  profile.profileCompletionPercentage = updatedCompletion;
  if (updatedCompletion >= 100 && !profile.profileCompletedAt) {
    profile.profileCompletedAt = now;
  }
  profile.lastUpdated = overrides.lastUpdated ?? now;

  return profile;
};

interface AppProps {
  user?: any;
  signOut?: () => void;
}

const AppContent = memo(({ user, signOut }: AppProps) => {
  const dispatch = useAppDispatch();
  const userState = useUser();
  const userRole = useUserRole();
  const subscriptionTier = useSubscriptionTier();
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showTransactionRecorder, setShowTransactionRecorder] = useState(false);
  const [showBusinessAssessment, setShowBusinessAssessment] = useState(false);
  const [showGrowthAccelerator, setShowGrowthAccelerator] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [showSubscriptionTierManager, setShowSubscriptionTierManager] = useState(false);
  const [showBillingManager, setShowBillingManager] = useState(false);
  const [showBusinessAnalysis, setShowBusinessAnalysis] = useState(false);
  const subscriptionStatus = useSubscription(user?.username);

  // Initialize user authentication state and hydrate profile
  useEffect(() => {
    if (!user?.username) {
      return;
    }

    const username = user.username;

    const initializeProfile = async () => {
      dispatch(setAuthenticated({ userId: username, isAuthenticated: true }));

      if (userState.profile) {
        setProfileCompleted(userState.profile.profileCompletionPercentage >= 60);
        return;
      }

      try {
        const fetchedProfile = await dispatch(fetchUserProfile(username)).unwrap();
        if (fetchedProfile) {
          dispatch(hydrateProfile(fetchedProfile));
          localStorage.setItem(`profile_${username}`, JSON.stringify(fetchedProfile));
          setProfileCompleted(fetchedProfile.profileCompletionPercentage >= 60);
          return;
        }
      } catch (error) {
        console.warn('Unable to fetch profile from backend, using cached data if available', error);
      }

      let storedProfile: Partial<UserProfile> | undefined;
      const cached = localStorage.getItem(`profile_${username}`);
      if (cached) {
        try {
          storedProfile = JSON.parse(cached);
        } catch (parseError) {
          console.warn('Failed to parse cached profile data, continuing with defaults', parseError);
        }
      }

      const fallbackProfile = buildUserProfile(username, storedProfile ?? {});
      dispatch(hydrateProfile(fallbackProfile));
      localStorage.setItem(`profile_${username}`, JSON.stringify(fallbackProfile));
      setProfileCompleted(fallbackProfile.profileCompletionPercentage >= 60);

      try {
        await dispatch(createUserProfile({ ...fallbackProfile })).unwrap();
      } catch (creationError) {
        console.warn('Profile creation skipped (likely offline/local mode)', creationError);
      }
    };

    initializeProfile();
  }, [user?.username, dispatch, userState.profile]);

  // Check if profile is completed based on Redux state
  useEffect(() => {
    if (user?.username && userState.profile) {
      localStorage.setItem(`profile_${user.username}`, JSON.stringify(userState.profile));
      setProfileCompleted(userState.profile.profileCompletionPercentage >= 60);
    }
  }, [user?.username, userState.profile]);

  const handleProfileComplete = async (profileData: any) => {
    if (!user?.username) {
      return;
    }

    const username = user.username;
    const role = profileData.userType === 'investor' ? 'viewer' : 'owner';
    const normalizedProfile = buildUserProfile(username, {
      ...userState.profile,
      businessName: profileData.businessName,
      businessType: profileData.businessType,
      location: profileData.location,
      region: profileData.region,
      yearEstablished: profileData.yearEstablished,
      employeeCount: profileData.numberOfEmployees,
      businessDescription: profileData.businessDescription,
      role,
    });

    localStorage.setItem(`profile_${username}`, JSON.stringify(normalizedProfile));
    dispatch(hydrateProfile(normalizedProfile));
    setProfileCompleted(normalizedProfile.profileCompletionPercentage >= 60);

    try {
      if (userState.profile) {
        await dispatch(updateUserProfile({ userId: username, updates: normalizedProfile })).unwrap();
      } else {
        await dispatch(createUserProfile({ ...normalizedProfile })).unwrap();
      }
    } catch (error) {
      console.warn('Failed to persist profile details to backend', error);
    }
  };

  if (!profileCompleted) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <SMEProfile user={user} onProfileComplete={handleProfileComplete} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '15px 0 0 0'
    }}>
      <div className="main-container">
        
        {/* Enhanced User Profile Header */}
        <UserProfileHeader
          user={user}
          signOut={signOut}
          onEditProfile={() => setProfileCompleted(false)}
        />

        {/* Dashboard Header */}
        <div className="dashboard-header" style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '25px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e8e8e8'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#2E8B57', fontSize: '26px', fontWeight: 'bold' }}>Dashboard</h2>
            <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '16px' }}>
              Manage your business funding and growth
            </p>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Role: <strong>{userRole || 'Business Owner'}</strong>
          </div>
        </div>

        {/* Usage Tracker */}
        {user?.username && (
          <div style={{ marginBottom: '30px' }}>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <UsageTracker userId={user.username} compact={true} />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}

        {/* Dashboard Content - Mobile-first responsive */}
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>

          {/* Business Summary */}
          <div className="dashboard-card" style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ color: '#2E8B57', marginBottom: '20px', fontSize: '20px' }}>Business Overview</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Business Type</span>
                <span style={{
                  color: '#2E8B57',
                  fontWeight: '600',
                  background: '#f0f8f0',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  {userState.profile?.businessType || 'SME'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Team Size</span>
                <span style={{
                  color: '#3498db',
                  fontWeight: '600',
                  background: '#f0f7ff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  👥 {userState.profile?.employeeCount || '1-10'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Business Stage</span>
                <span style={{
                  color: '#9b59b6',
                  fontWeight: '600',
                  background: '#f9f0ff',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  🚀 {userState.profile?.businessStage || 'Existing'}
                </span>
              </div>

              {/* Business Setup Progress */}
              <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Business Setup Progress</span>
                  <span style={{ color: '#2E8B57', fontWeight: 'bold', fontSize: '14px' }}>
                    {userState.profile?.profileCompletionPercentage || 60}%
                  </span>
                </div>
                <div style={{
                  background: '#e8e8e8',
                  borderRadius: '10px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #2E8B57, #3CB371)',
                    height: '100%',
                    width: `${userState.profile?.profileCompletionPercentage || 60}%`,
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{
                  color: '#666',
                  fontSize: '12px',
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  {(userState.profile?.profileCompletionPercentage || 60) >= 80 ?
                    '✅ Profile Complete' :
                    '⚡ Complete your profile to unlock more features'
                  }
                </div>
              </div>
            </div>
            {userState.profile?.businessDescription && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <strong>Description:</strong>
                <p style={{ marginTop: '8px', color: '#666', lineHeight: '1.5' }}>
                  {userState.profile.businessDescription}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card" style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ color: '#2E8B57', marginBottom: '20px', fontSize: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* PRIMARY ACTION - Most important for MVP */}
              <button
                className={isFeatureEnabled('useBlackGoldTheme') ? "btn-premium" : "action-button"}
                onClick={() => setShowGrowthAccelerator(true)}
                aria-label={isFeatureEnabled('use30DayBootcamp') ? "Join 30-Day Investment Readiness Bootcamp" : "Start Growth Accelerator program - Primary business development tool"}
                tabIndex={0}
                style={!isFeatureEnabled('useBlackGoldTheme') ? {
                  background: 'linear-gradient(135deg, #2E8B57, #3CB371)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(46, 139, 87, 0.3)'
                } : { width: '100%', marginBottom: '10px' }}
              >
                {isFeatureEnabled('use30DayBootcamp') ? '🎯 30-Day Investment Bootcamp - START HERE' : '🚀 Growth Accelerator - START HERE'}
              </button>

              {/* SECONDARY ACTIONS - Core features */}
              <button
                className="action-button"
                onClick={() => setShowTransactionRecorder(true)}
                aria-label="Open chat-style transaction recorder for quick business record keeping"
                tabIndex={0}
                style={{
                  background: 'linear-gradient(135deg, #32CD32, #90EE90)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 3px 12px rgba(50, 205, 50, 0.25)'
                }}
              >
                💬 Quick Record Transactions
              </button>

              <button
                className="action-button"
                onClick={() => setShowBusinessAnalysis(true)}
                aria-label="View AI-powered business analysis and insights dashboard"
                tabIndex={0}
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 3px 12px rgba(255, 107, 107, 0.25)'
                }}
              >
                📊 Business Analysis
              </button>

              {/* TERTIARY ACTION - Use Investment X-Ray if enabled */}
              <button
                className={isFeatureEnabled('useBlackGoldTheme') ? "btn-premium" : "action-button"}
                onClick={() => setShowBusinessAssessment(true)}
                aria-label={isFeatureEnabled('useInvestmentXRay') ? "Take 7-minute Investment X-Ray assessment" : "Take comprehensive business assessment quiz"}
                tabIndex={0}
                style={!isFeatureEnabled('useBlackGoldTheme') ? {
                  background: 'linear-gradient(135deg, #4169E1, #6495ED)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(65, 105, 225, 0.2)'
                } : undefined}
              >
                {isFeatureEnabled('useInvestmentXRay') ? '🎯 Investment X-Ray (7 min)' : '📋 Business Assessment'}
              </button>

              {/* SUBSCRIPTION MANAGEMENT */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
                <button
                  className="action-button"
                  onClick={() => setShowSubscriptionTierManager(true)}
                  style={{
                    background: subscriptionTier !== 'free' ?
                      'linear-gradient(135deg, #27ae60, #2ecc71)' :
                      'linear-gradient(135deg, #e74c3c, #c0392b)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    boxShadow: subscriptionTier !== 'free' ?
                      '0 2px 8px rgba(39, 174, 96, 0.2)' :
                      '0 2px 8px rgba(231, 76, 60, 0.2)'
                  }}
                >
                  {subscriptionTier !== 'free' ? '⚙️ Manage Subscription' : '⬆️ Upgrade to Pro'}
                </button>

                {subscriptionTier !== 'free' && (
                  <button
                    className="action-button"
                    onClick={() => setShowBillingManager(true)}
                    style={{
                      background: 'linear-gradient(135deg, #3498db, #5dade2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(52, 152, 219, 0.2)',
                      marginTop: '8px'
                    }}
                  >
                    💳 Billing & Invoices
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Funding Progress */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#2E8B57', marginBottom: '20px', fontSize: '20px' }}>Funding Progress</h3>
          <div style={{ background: '#e0e0e0', borderRadius: '10px', height: '12px', marginBottom: '15px' }}>
            <div style={{ background: '#2E8B57', height: '100%', width: '0%', borderRadius: '10px' }}></div>
          </div>
          <p style={{ color: '#666', textAlign: 'center', fontSize: '16px' }}>
            No active campaigns yet. Create your first funding campaign to start raising investment!
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '25px', 
          background: '#f8f9fa', 
          borderRadius: '12px', 
          textAlign: 'center',
          border: '1px solid #e0e0e0'
        }}>
          <p style={{ color: '#666', margin: 0, fontSize: '16px' }}>
            Bvester - Connecting Ghana SMEs with Global Investment Opportunities
          </p>
          <p style={{ color: '#999', margin: '5px 0 0 0', fontSize: '14px' }}>
            Empowering African businesses through technology and investment
          </p>
        </div>

        {/* Lazy-loaded Modals with Error Boundaries - Moved outside for proper z-index */}
        {showTransactionRecorder && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ChatTransactionRecorder
                user={user}
                onClose={() => setShowTransactionRecorder(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {showBusinessAssessment && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              {isFeatureEnabled('useInvestmentXRay') ? (
                <InvestmentXRay
                  user={user}
                  userProfile={userState.profile}
                  onClose={() => setShowBusinessAssessment(false)}
                  onComplete={(score, insights) => {
                    console.log('Investment X-Ray completed:', { score, insights });
                    // Handle completion - could trigger accelerator enrollment
                  }}
                />
              ) : (
                <BusinessAssessment
                  user={user}
                  userProfile={userState.profile}
                  onClose={() => setShowBusinessAssessment(false)}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        )}

        {showGrowthAccelerator && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              {isFeatureEnabled('use30DayBootcamp') ? (
                <InvestmentBootcamp
                  user={user}
                  userProfile={userState.profile}
                  onClose={() => setShowGrowthAccelerator(false)}
                />
              ) : (
                <GrowthAccelerator
                  user={user}
                  userProfile={userState.profile}
                  onClose={() => setShowGrowthAccelerator(false)}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        )}

        {showSubscriptionManager && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SubscriptionManager
                user={user}
                userProfile={userState.profile}
                onClose={() => setShowSubscriptionManager(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {showSubscriptionTierManager && user?.username && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SubscriptionTierManager
                userId={user.username}
                userEmail={userState.profile?.email || `${user.username}@example.com`}
                onClose={() => setShowSubscriptionTierManager(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {showBillingManager && user?.username && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <BillingManager
                userId={user.username}
                userEmail={userState.profile?.email || `${user.username}@example.com`}
                customerId={userState.profile?.stripeCustomerId}
                onClose={() => setShowBillingManager(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {showBusinessAnalysis && user?.username && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <BusinessAnalysisDashboard
                user={user}
                onClose={() => setShowBusinessAnalysis(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

      </div>
    </div>
  );
});

AppContent.displayName = 'AppContent';

// Main App component that wraps everything with Redux
const App = (props: AppProps) => (
  <Provider store={store}>
    <ErrorBoundary>
      <AppContent {...props} />
    </ErrorBoundary>
  </Provider>
);

export default App;
