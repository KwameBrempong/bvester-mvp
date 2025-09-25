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
import EmailVerificationBanner from './components/EmailVerificationBanner';
import { isFeatureEnabled } from './config/featureFlags';
import { profileUtils, UserProfile } from './services/dataService';
import './App.css';
// Import premium theme - it will only apply when feature is enabled
import './styles/premium-theme.css';
// Import professional dashboard system
import './styles/dashboard-system.css';

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

// Import professional dashboard components
import {
  DashboardLayout,
  DashboardHeader,
  BusinessOverview,
  GrowthToolsWidget,
  InvestmentReadinessTracker
} from './components/dashboard';

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
      borderTop: '4px solid #D4AF37',
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
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const subscriptionStatus = useSubscription(user?.username);

  // Authentication state management
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setAuthError('No user session found');
      return;
    }

    // Clear any previous errors
    setAuthError(null);
    setIsLoading(false);
  }, [user]);

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

    console.log('🔥 Profile completion started', { profileData, username: user.username });

    const username = user.username;
    const role = profileData.userType === 'investor' ? 'viewer' : 'owner';

    // Get user email from Cognito
    const userEmail = (user as any).attributes?.email || `${username}@example.com`;

    const normalizedProfile = buildUserProfile(username, {
      ...userState.profile,
      businessName: profileData.businessName,
      ownerName: profileData.businessName, // Use business name as owner name for now
      email: userEmail,
      businessType: profileData.businessType,
      location: profileData.location,
      region: profileData.region,
      yearEstablished: profileData.yearEstablished,
      employeeCount: profileData.numberOfEmployees,
      businessDescription: profileData.businessDescription,
      role,
    });

    console.log('🔥 Normalized profile created', {
      normalizedProfile,
      completionPercentage: normalizedProfile.profileCompletionPercentage,
      isComplete: normalizedProfile.profileCompletionPercentage >= 60
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

  // Handle loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#FAFAFA'
      }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: '#666' }}>Setting up your account...</p>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#FAFAFA',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h3 style={{ color: '#D4AF37', marginBottom: '1rem' }}>Authentication Error</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{authError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              color: '#0A0A0A',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retry Login
          </button>
        </div>
      </div>
    );
  }

  // Handle profile completion flow
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
    <>
      <DashboardLayout
      header={
        <>
          {/* Email Verification Banner */}
          {user && !user.attributes?.email_verified && (
            <EmailVerificationBanner
              userEmail={user.attributes?.email}
              onVerificationSuccess={() => {
                // Refresh the page to get updated user attributes
                window.location.reload();
              }}
            />
          )}

          {/* Professional Dashboard Header */}
          <DashboardHeader
            user={user}
            signOut={signOut}
            onEditProfile={() => setProfileCompleted(false)}
          />
        </>
      }
      sidebar={
        <>
          {/* Investment Readiness Tracker */}
          <InvestmentReadinessTracker />

          {/* Usage Tracker */}
          {user?.username && (
            <ErrorBoundary>
              <Suspense fallback={<div className="skeleton skeleton-text"></div>}>
                <UsageTracker userId={user.username} compact={true} />
              </Suspense>
            </ErrorBoundary>
          )}
        </>
      }
    >
      {/* Main Dashboard Content */}
      <div className="dashboard-grid-full">
        <BusinessOverview />
      </div>

      <div className="dashboard-grid-full">
        <GrowthToolsWidget
          onOpenGrowthAccelerator={() => setShowGrowthAccelerator(true)}
          onOpenTransactionRecorder={() => setShowTransactionRecorder(true)}
          onOpenBusinessAnalysis={() => setShowBusinessAnalysis(true)}
          onOpenBusinessAssessment={() => setShowBusinessAssessment(true)}
          onOpenSubscriptionManager={() => setShowSubscriptionTierManager(true)}
        />
      </div>

      {/* Professional Footer */}
      <div className="dashboard-grid-full">
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-body text-center" style={{ padding: 'var(--space-xl)' }}>
            <h4 className="text-lg font-semibold mb-md text-black">
              🇬🇭 Bvester - Ghana's Investment Readiness Platform
            </h4>
            <p className="text-sm text-gray mb-0">
              Connecting SMEs with global investment opportunities through professional business development
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>

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
    </>
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
