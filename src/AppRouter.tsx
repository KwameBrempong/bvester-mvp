import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import Homepage from './components/Homepage';

// Amplify configuration removed - using standalone Lambda backend

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
      <Authenticator>
        {({ signOut, user }) => (
          <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Add back to homepage option for unauthenticated state */}
            {!user && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 1000
              }}>
                <button
                  onClick={handleBackToHome}
                  style={{
                    background: 'rgba(46, 139, 87, 0.9)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  ← Back to Home
                </button>
              </div>
            )}
            <App user={user} signOut={signOut} />
          </div>
        )}
      </Authenticator>
    );
  }

  return <Homepage onGetStarted={handleGetStarted} />;
};

export default AppRouter;