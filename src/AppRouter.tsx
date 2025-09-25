import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import HomepageRevenue from './components/HomepageRevenue';
import outputs from '../amplify_outputs.json';

// Configure Amplify with backend outputs
Amplify.configure(outputs);

const AppRouter: React.FC = () => {
  const [showSignIn, setShowSignIn] = useState(false);

  const handleGetStarted = () => {
    setShowSignIn(true);
  };

  const handleBackToHome = () => {
    setShowSignIn(false);
  };

  if (showSignIn) {
    return (
      <Authenticator
        formFields={{
          signUp: {
            email: {
              order: 1,
              placeholder: 'Enter your business email',
              label: 'Business Email *',
              isRequired: true
            },
            password: {
              order: 2,
              placeholder: 'Create a strong password',
              label: 'Password *'
            },
            confirm_password: {
              order: 3,
              label: 'Confirm Password *'
            }
          }
        }}
        components={{
          Header() {
            return (
              <div style={{ textAlign: 'center', padding: '2rem 1rem 1rem' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  Welcome to Bvester
                </div>
                <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
                  🇬🇭 Join thousands of SMEs accessing growth capital
                </p>
              </div>
            );
          },
          Footer() {
            return (
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                borderTop: '1px solid #eee',
                marginTop: '2rem'
              }}>
                <button
                  onClick={handleBackToHome}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D4AF37',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ← Back to Homepage
                </button>
              </div>
            );
          }
        }}
        socialProviders={[]}
      >
        {({ signOut, user }) => (
          <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Loading state while user profile is being set up */}
            {user && !(user as any).attributes?.email_verified && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: '#FFF3CD',
                color: '#856404',
                padding: '12px',
                textAlign: 'center',
                fontSize: '14px',
                borderBottom: '1px solid #FFEAA7',
                zIndex: 1000
              }}>
                📧 Please verify your email address to complete your account setup
              </div>
            )}
            <App user={user} signOut={signOut} />
          </div>
        )}
      </Authenticator>
    );
  }

  return <HomepageRevenue onGetStarted={handleGetStarted} />;
};

export default AppRouter;