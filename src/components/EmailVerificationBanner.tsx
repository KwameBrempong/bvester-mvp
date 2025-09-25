import React, { useState } from 'react';
import { resendSignUpCode, confirmSignUp } from 'aws-amplify/auth';

interface EmailVerificationBannerProps {
  userEmail?: string;
  onVerificationSuccess?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  userEmail,
  onVerificationSuccess
}) => {
  const [isResending, setIsResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendCode = async () => {
    if (!userEmail) return;

    setIsResending(true);
    setError('');

    try {
      await resendSignUpCode({ username: userEmail });
      setMessage('✅ Verification code sent to your email!');
      setShowCodeInput(true);
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      console.error('Error resending verification code:', error);
      setError(error.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!userEmail || !verificationCode) return;

    setIsVerifying(true);
    setError('');

    try {
      await confirmSignUp({
        username: userEmail,
        confirmationCode: verificationCode
      });
      setMessage('🎉 Email verified successfully!');
      setTimeout(() => {
        onVerificationSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF3CD, #FCF8E3)',
      borderLeft: '4px solid #D4AF37',
      padding: '1rem 1.5rem',
      marginBottom: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '1.5rem' }}>📧</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404', fontSize: '1rem', fontWeight: '600' }}>
            Verify Your Email Address
          </h4>
          <p style={{ margin: '0 0 1rem 0', color: '#856404', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Please check your email ({userEmail}) and click the verification link, or enter the verification code below.
          </p>

          {message && (
            <div style={{
              background: 'rgba(76, 175, 80, 0.1)',
              color: '#388e3c',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.1)',
              color: '#d32f2f',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {showCodeInput && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '2px solid #D4AF37',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    width: '150px',
                    textAlign: 'center',
                    letterSpacing: '2px'
                  }}
                  maxLength={6}
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || verificationCode.length !== 6}
                  style={{
                    background: verificationCode.length === 6 ? 'linear-gradient(135deg, #D4AF37, #FFD700)' : '#ccc',
                    color: verificationCode.length === 6 ? '#0A0A0A' : '#666',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: verificationCode.length === 6 && !isVerifying ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  {isVerifying ? '⏳ Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleResendCode}
              disabled={isResending}
              style={{
                background: 'none',
                border: '2px solid #D4AF37',
                color: '#D4AF37',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: isResending ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {isResending ? '⏳ Sending...' : showCodeInput ? 'Resend Code' : 'Send Verification Code'}
            </button>

            {!showCodeInput && (
              <button
                onClick={() => setShowCodeInput(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D4AF37',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                I have a code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;