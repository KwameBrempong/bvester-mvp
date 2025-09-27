import React, { useEffect, useState } from 'react';
import '../styles/signup-success.css';

interface SignupSuccessProps {
  onContinue: () => void;
}

const SignupSuccess: React.FC<SignupSuccessProps> = ({ onContinue }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tier, setTier] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tierParam = urlParams.get('tier');
    const sessionParam = urlParams.get('session_id');

    console.log('SignupSuccess loaded with params:', {
      tier: tierParam,
      sessionId: sessionParam
    });

    if (tierParam) setTier(tierParam);
    if (sessionParam) setSessionId(sessionParam);

    // Simulate account setup delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getTierDisplayName = (tierId: string) => {
    switch (tierId) {
      case 'growth':
        return 'Pro';
      case 'accelerate':
        return 'Accelerator';
      default:
        return 'Premium';
    }
  };

  const handleContinue = () => {
    // Store session info for potential future use
    if (sessionId) {
      localStorage.setItem('payment_session_id', sessionId);
    }

    // Clear URL parameters and redirect to login
    window.history.replaceState({}, document.title, window.location.pathname);
    onContinue();
  };

  if (isLoading) {
    return (
      <div className="signup-success">
        <div className="success-container">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <h2>Setting up your account...</h2>
            <p>We're creating your {getTierDisplayName(tier)} dashboard and preparing your business tools.</p>
            <div className="loading-steps">
              <div className="step active">✓ Payment confirmed</div>
              <div className="step active">✓ Account created</div>
              <div className="step active">⚡ Preparing dashboard</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-success">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h1>Welcome to Bvester {getTierDisplayName(tier)}!</h1>
          <p className="success-subtitle">
            Your payment was successful and your account is ready.
            You now have access to all {getTierDisplayName(tier)} features.
          </p>

          <div className="success-features">
            <h3>What's included in your {getTierDisplayName(tier)} plan:</h3>
            <ul>
              {tier === 'growth' ? (
                <>
                  <li>✓ Unlimited transactions & smart analytics</li>
                  <li>✓ Full business health X-Ray & benchmarks</li>
                  <li>✓ Diaspora investor introductions</li>
                  <li>✓ 50% founding member discount (₵50/month)</li>
                </>
              ) : (
                <>
                  <li>✓ All Pro features + advanced voice analytics</li>
                  <li>✓ Full Investment Accelerator Program access</li>
                  <li>✓ Dedicated growth coach & experts</li>
                  <li>✓ Priority investor matching</li>
                  <li>✓ 50% founding member discount (₵250/month)</li>
                </>
              )}
            </ul>
          </div>

          <div className="success-actions">
            <button className="btn btn--gold" onClick={handleContinue}>
              Access Your Dashboard →
            </button>
            <p className="success-note">
              You'll be asked to sign in with the email you used for payment.
              Your account has been created automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;