// Removed unused import for production cleanup
import { useState, useEffect, Suspense, lazy, memo } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useUser } from './store/hooks';
import {
  fetchUserProfile,
  setAuthenticated,
  updateUserProfile,
  createUserProfile,
  hydrateProfile
} from './store/slices/userSlice';
import ErrorBoundary from './components/ErrorBoundary';
// Removed unused imports for production cleanup
import EmailVerificationHandler from './components/EmailVerificationHandler';
import { isFeatureEnabled } from './config/featureFlags';
import { profileUtils, UserProfile } from './services/dataService';
import './App.css';
// Import premium theme - it will only apply when feature is enabled
import './styles/premium-theme.css';
// Import professional dashboard system
import './styles/dashboard-system.css';
// Import mobile optimizations
import './styles/mobile-optimizations.css';

// Lazy load components for better performance
const SMEProfile = lazy(() => import('./SMEProfile'));
const InvestmentAccelerator = lazy(() => import('./components/InvestmentAccelerator'));
const TransactionHub = lazy(() => import('./components/TransactionHub'));
// Removed unused lazy imports for production cleanup
const SubscriptionTierManager = lazy(() => import('./components/SubscriptionTierManager'));
const BillingManager = lazy(() => import('./components/BillingManager'));
const BusinessAnalysisDashboard = lazy(() => import('./components/BusinessAnalysisDashboard'));

// Import professional dashboard components
import { ProfessionalDashboard } from './components/dashboard';
import React from 'react';
// Removed unused DashboardKPIs for production cleanup

// Import dashboard views
import {
  OverviewView,
  ProfileView,
  AssessmentView,
  GrowthView,
  XRayView,
  TransactionsView,
  BillingView,
  SettingsView
} from './components/dashboard/DashboardViews';

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
  user?: {
    username: string;
    attributes?: {
      email?: string;
    };
  };
  signOut?: () => void;
}

const AppContent = memo(({ user, signOut }: AppProps) => {
  const dispatch = useAppDispatch();
  const userState = useUser();
  // Removed unused variables for production cleanup
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [showTransactionRecorder, setShowTransactionRecorder] = useState(false);
  const [showBusinessAssessment, setShowBusinessAssessment] = useState(false);
  const [showGrowthAccelerator, setShowGrowthAccelerator] = useState(false);
  // Removed unused showSubscriptionManager for production cleanup
  const [showSubscriptionTierManager, setShowSubscriptionTierManager] = useState(false);
  const [showBillingManager, setShowBillingManager] = useState(false);
  const [showBusinessAnalysis, setShowBusinessAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('overview');
  const [shouldShowAssessmentAfterProfile, setShouldShowAssessmentAfterProfile] = useState(false);
  // Removed unused subscriptionStatus for production cleanup

  // Check if user came from assessment CTA
  useEffect(() => {
    // Check localStorage for assessment intent
    const assessmentIntent = localStorage.getItem('assessment_intent');
    if (assessmentIntent === 'true') {
      setShouldShowAssessmentAfterProfile(true);
    }
  }, []);

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
        // Profile fetch failed, using cached data
      }

      let storedProfile: Partial<UserProfile> | undefined;
      const cached = localStorage.getItem(`profile_${username}`);
      if (cached) {
        try {
          storedProfile = JSON.parse(cached);
        } catch (parseError) {
          // Failed to parse cached profile data
        }
      }

      const fallbackProfile = buildUserProfile(username, storedProfile ?? {});
      dispatch(hydrateProfile(fallbackProfile));
      localStorage.setItem(`profile_${username}`, JSON.stringify(fallbackProfile));
      setProfileCompleted(fallbackProfile.profileCompletionPercentage >= 60);

      try {
        await dispatch(createUserProfile({ ...fallbackProfile })).unwrap();
      } catch (creationError) {
        // Profile creation skipped (likely offline/local mode)
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

  const handleProfileComplete = async (profileData: {
    businessName: string;
    businessType: string;
    location: string;
    region: string;
    yearEstablished: string;
    numberOfEmployees: string;
    businessDescription: string;
    userType: string;
  }) => {
    if (!user?.username) {
      return;
    }

    // Profile completion started

    const username = user.username;
    const role = profileData.userType === 'investor' ? 'viewer' : 'owner';

    // Get user email from Cognito with type safety
    interface CognitoUser {
      attributes?: {
        email?: string;
      };
    }
    const userEmail = (user as CognitoUser).attributes?.email || `${username}@example.com`;

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

    // Normalized profile created

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
      // Failed to persist profile details to backend
    }

    // Check if user came from assessment CTA and automatically show assessment
    if (shouldShowAssessmentAfterProfile) {
      // Auto-triggering Business Assessment after profile completion
      localStorage.removeItem('assessment_intent'); // Clear the intent flag
      setShouldShowAssessmentAfterProfile(false);
      setActiveView('assessment');
      setShowBusinessAssessment(true);
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
          <SMEProfile user={user!} onProfileComplete={handleProfileComplete} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  const handleViewChange = (view: string) => {
    setActiveView(view);
    // Handle view-specific actions
    switch(view) {
      case 'assessment':
        setShowBusinessAssessment(true);
        break;
      case 'growth':
        setShowGrowthAccelerator(true);
        break;
      case 'transactions':
        setShowTransactionRecorder(true);
        break;
      case 'billing':
        setShowBillingManager(true);
        break;
      case 'xray':
        // Handle Investment X-Ray view
        break;
      case 'bootcamp':
        // Handle Bootcamp view
        break;
      default:
        // Close all modals for overview, profile, settings
        setShowBusinessAssessment(false);
        setShowGrowthAccelerator(false);
        setShowTransactionRecorder(false);
        setShowBillingManager(false);
        break;
    }
  };

  // Removed unused handleProfileSave function for production cleanup

  return (
    <>
      <ProfessionalDashboard
        user={user}
        signOut={signOut || (() => {})}
        activeView={activeView}
        onViewChange={handleViewChange}
      >
        {/* Email Verification Handler */}
        <EmailVerificationHandler user={user} />

        {/* Main Dashboard Content Based on Active View */}
        {activeView === 'overview' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <OverviewView />
          </React.Suspense>
        )}

        {activeView === 'profile' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <ProfileView />
          </React.Suspense>
        )}

        {activeView === 'assessment' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <AssessmentView />
          </React.Suspense>
        )}

        {activeView === 'growth' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <GrowthView />
          </React.Suspense>
        )}


        {activeView === 'xray' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <XRayView />
          </React.Suspense>
        )}

        {activeView === 'transactions' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <TransactionsView />
          </React.Suspense>
        )}

        {activeView === 'billing' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <BillingView />
          </React.Suspense>
        )}

        {activeView === 'settings' && (
          <React.Suspense fallback={<LoadingSpinner />}>
            <SettingsView />
          </React.Suspense>
        )}
      </ProfessionalDashboard>

        {/* Lazy-loaded Modals with Error Boundaries - Moved outside for proper z-index */}
        {showTransactionRecorder && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <TransactionHub
                user={user!}
                onClose={() => setShowTransactionRecorder(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {showBusinessAssessment && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              {isFeatureEnabled('useAssessmentV2') ? (
                <div>Business Assessment V2 - Feature in development</div>
              ) : isFeatureEnabled('useInvestmentXRay') ? (
                <div>Investment X-Ray - Feature in development</div>
              ) : (
                <div>Enhanced Business Assessment - Feature in development</div>
              )}
            </Suspense>
          </ErrorBoundary>
        )}

        {showGrowthAccelerator && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InvestmentAccelerator
                user={user}
                userProfile={userState.profile}
                onClose={() => setShowGrowthAccelerator(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Subscription Manager temporarily disabled for production cleanup */}

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
