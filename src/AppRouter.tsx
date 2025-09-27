import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { getCurrentUser } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import './styles/auth-theme.css';
import App from './App';
import HomepageRevenue from './components/HomepageRevenue';
import SignupSuccess from './components/SignupSuccess';
import outputs from '../amplify_outputs.json';

// Configure Amplify with backend outputs
Amplify.configure(outputs);

const AppRouter: React.FC = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          setShowSignIn(true); // Show the Authenticator component which will handle the authenticated state
        }
      } catch (error) {
        // User is not authenticated
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle route changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleGetStarted = () => {
    setShowSignIn(true);
  };

  const handleBackToHome = () => {
    setShowSignIn(false);
    setIsAuthenticated(false);
    setCurrentRoute('/');
    window.history.pushState({}, '', '/');
  };

  const handleContinueFromSuccess = () => {
    setShowSignIn(true);
    setCurrentRoute('/');
    window.history.pushState({}, '', '/');
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #D4AF37',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle signup success route
  if (currentRoute === '/signup-success') {
    return <SignupSuccess onContinue={handleContinueFromSuccess} />;
  }

  if (showSignIn || isAuthenticated) {
    return (
      <Authenticator
        formFields={{
          signUp: {
            email: {
              order: 1,
              placeholder: 'your.business@example.com',
              label: 'Business Email Address',
              isRequired: true
            },
            password: {
              order: 2,
              placeholder: 'Must be 8+ characters with symbols',
              label: 'Create Password',
              isRequired: true
            },
            confirm_password: {
              order: 3,
              placeholder: 'Confirm your password',
              label: 'Confirm Password',
              isRequired: true
            }
          },
          signIn: {
            username: {
              placeholder: 'your.business@example.com',
              label: 'Email Address'
            },
            password: {
              placeholder: 'Enter your password',
              label: 'Password'
            }
          },
          confirmSignUp: {
            confirmation_code: {
              placeholder: 'Enter 6-digit code',
              label: 'Verification Code',
              labelHidden: false
            }
          }
        }}
        components={{
          Header() {
            return (
              <div style={{
                textAlign: 'center',
                padding: '0 0 2rem 0',
                position: 'relative'
              }}>
                {/* Logo/Brand */}
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em'
                }}>
                  Bvester
                </div>

                {/* Tagline */}
                <div style={{
                  color: '#0A0A0A',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem'
                }}>
                  🇬🇭 Ghana's #1 SME Investment Platform
                </div>

                {/* Description */}
                <p style={{
                  color: '#666',
                  fontSize: '0.95rem',
                  margin: 0,
                  lineHeight: '1.5',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  Join <strong>Ghana's ambitious SMEs</strong> building <strong>investment-ready</strong> businesses
                </p>

                {/* Trust indicators */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2rem',
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(212, 175, 55, 0.05)',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#D4AF37' }}>⚡ 2-Min</div>
                    <div style={{ color: '#666' }}>Setup</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#D4AF37' }}>🔒 Secure</div>
                    <div style={{ color: '#666' }}>Bank-level</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#D4AF37' }}>📱 Mobile</div>
                    <div style={{ color: '#666' }}>Optimized</div>
                  </div>
                </div>
              </div>
            );
          },
          Footer() {
            return (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem 1rem',
                borderTop: '2px solid #F0F0F0',
                marginTop: '3rem',
                position: 'relative'
              }}>
                {/* Security badges */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '2rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(40, 167, 69, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#28A745',
                    fontWeight: '600'
                  }}>
                    🔒 256-bit SSL
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#D4AF37',
                    fontWeight: '600'
                  }}>
                    🏦 Bank-level Security
                  </div>
                </div>

                {/* Support info */}
                <div style={{
                  color: '#666',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  lineHeight: '1.5'
                }}>
                  Need help? Contact our support team at{' '}
                  <a href="mailto:support@bvester.com" style={{ color: '#D4AF37', textDecoration: 'none' }}>
                    support@bvester.com
                  </a>
                </div>

                {/* Back to homepage */}
                <button
                  onClick={handleBackToHome}
                  style={{
                    background: 'none',
                    border: '2px solid #D4AF37',
                    color: '#D4AF37',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#D4AF37';
                    e.currentTarget.style.color = '#0A0A0A';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#D4AF37';
                  }}
                >
                  ← Back to Homepage
                </button>

                {/* Copyright */}
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E5E5E5',
                  color: '#999',
                  fontSize: '0.8rem'
                }}>
                  © 2024 Bvester. All rights reserved. | Empowering African SMEs
                </div>
              </div>
            );
          }
        }}
        socialProviders={[]}
      >
        {({ signOut, user }) => {
          // SECURITY FIX: Enhanced signOut handler with complete cleanup
          const handleCustomSignOut = async () => {
            try {
              const currentUser = user?.username;
              console.log('Starting secure logout process for user:', currentUser);

              // First, perform Cognito sign out
              if (signOut) {
                await signOut();
              }

              // Clear application state
              setShowSignIn(false);
              setIsAuthenticated(false);
              setCheckingAuth(false);

              // CRITICAL: Complete localStorage cleanup
              const keysToRemove = Object.keys(localStorage).filter(key => {
                return (
                  key.startsWith('profile_') ||
                  key.startsWith('assessment_') ||
                  key.startsWith('subscription_') ||
                  key.startsWith('transaction_') ||
                  key.startsWith('bvester_') ||
                  key.startsWith('payment_') ||
                  key.startsWith('user_') ||
                  key.startsWith('session_') ||
                  (currentUser && key.includes(currentUser))
                );
              });

              keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log('Removed localStorage key:', key);
              });

              // Clear session storage as well
              const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => {
                return (
                  key.startsWith('bvester_') ||
                  key.startsWith('profile_') ||
                  key.startsWith('session_') ||
                  (currentUser && key.includes(currentUser))
                );
              });

              sessionKeysToRemove.forEach(key => {
                sessionStorage.removeItem(key);
                console.log('Removed sessionStorage key:', key);
              });

              // Clear any cookies that might contain session data
              document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                if (name.trim().includes('bvester') || name.trim().includes('auth')) {
                  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                }
              });

              // Force garbage collection
              if (window.gc) {
                window.gc();
              }

              // Ensure cleanup completes before redirect
              await new Promise(resolve => setTimeout(resolve, 200));

              console.log('Secure logout completed successfully');
            } catch (error) {
              console.error('Logout error:', error);

              // CRITICAL: Even if errors occur, force cleanup
              setShowSignIn(false);
              setIsAuthenticated(false);
              setCheckingAuth(false);

              // Emergency cleanup
              try {
                localStorage.clear();
                sessionStorage.clear();
                console.log('Emergency storage cleanup completed');
              } catch (cleanupError) {
                console.error('Emergency cleanup failed:', cleanupError);
              }
            }
          };

          return (
            <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
              <App user={user} signOut={handleCustomSignOut} />
            </div>
          );
        }}
      </Authenticator>
    );
  }

  return <HomepageRevenue onGetStarted={handleGetStarted} />;
};

export default AppRouter;