import React, { useState, useEffect } from 'react';
import { resendSignUpCode, confirmSignUp, fetchUserAttributes } from 'aws-amplify/auth';

interface EmailVerificationBannerProps {
  userEmail?: string;
  onVerificationSuccess?: () => void;
  onDismiss?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  userEmail,
  onVerificationSuccess,
  onDismiss
}) => {
  const [isResending, setIsResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const MAX_ATTEMPTS = 5;

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds(cooldownSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleResendCode = async () => {
    if (!userEmail) {
      setError('Email address is required');
      return;
    }

    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds} seconds before requesting a new code`);
      return;
    }

    setIsResending(true);
    setError('');
    setMessage('');

    try {
      await resendSignUpCode({ username: userEmail });
      setMessage('✅ Verification code sent! Check your email inbox and spam folder.');
      setShowCodeInput(true);
      setCooldownSeconds(60); // 60 second cooldown
      setAttempts(0); // Reset attempts when new code is sent
    } catch (error: any) {
      console.error('Error resending verification code:', error);
      if (error.name === 'LimitExceededException') {
        setError('Too many attempts. Please wait a few minutes before trying again.');
        setCooldownSeconds(180); // 3 minute cooldown for rate limit
      } else if (error.name === 'InvalidParameterException') {
        setError('Invalid email address. Please contact support.');
      } else if (error.name === 'UserNotFoundException') {
        setError('Email not found. Please check your email or sign up again.');
      } else {
        setError(error.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!userEmail) {
      setError('Email address is required');
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    // Check if only digits
    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Verification code must contain only numbers');
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError('Too many failed attempts. Please request a new code.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setMessage('');

    try {
      await confirmSignUp({
        username: userEmail,
        confirmationCode: verificationCode
      });
      setMessage('🎉 Email verified successfully! Refreshing your account...');

      // Try to fetch updated attributes before reloading
      setTimeout(async () => {
        try {
          await fetchUserAttributes();
        } catch (e) {
          console.log('Could not refresh attributes:', e);
        }
        onVerificationSuccess?.();
      }, 1500);
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setAttempts(attempts + 1);

      if (error.name === 'CodeMismatchException') {
        setError(`Incorrect code. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
      } else if (error.name === 'ExpiredCodeException') {
        setError('This code has expired. Please request a new one.');
        setShowCodeInput(false);
      } else if (error.name === 'NotAuthorizedException') {
        setError('This account has already been verified.');
        setTimeout(() => onVerificationSuccess?.(), 2000);
      } else if (error.name === 'LimitExceededException') {
        setError('Too many attempts. Please wait before trying again.');
        setCooldownSeconds(180);
      } else {
        setError(error.message || 'Verification failed. Please try again.');
      }

      // Clear code on error
      if (error.name === 'ExpiredCodeException' || attempts >= MAX_ATTEMPTS - 1) {
        setVerificationCode('');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!userEmail) return;

    setIsCheckingStatus(true);
    try {
      const attributes = await fetchUserAttributes();
      const emailVerified = attributes.email_verified;
      // Check if email is verified (can be string 'true' or boolean true)
      if (emailVerified && String(emailVerified) === 'true') {
        setMessage('✅ Your email is already verified!');
        setTimeout(() => onVerificationSuccess?.(), 2000);
      }
    } catch (error) {
      console.log('Could not check verification status:', error);
    } finally {
      setIsCheckingStatus(false);
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    if (value.length <= 6) {
                      setVerificationCode(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && verificationCode.length === 6) {
                      handleVerifyCode();
                    }
                  }}
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
              disabled={isResending || cooldownSeconds > 0}
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
              {isResending ? '⏳ Sending...' : cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : showCodeInput ? 'Resend Code' : 'Send Verification Code'}
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

            <button
              onClick={checkVerificationStatus}
              disabled={isCheckingStatus}
              style={{
                background: 'none',
                border: 'none',
                color: '#D4AF37',
                fontSize: '0.9rem',
                cursor: isCheckingStatus ? 'not-allowed' : 'pointer',
                textDecoration: 'underline',
                opacity: isCheckingStatus ? 0.6 : 1
              }}
            >
              {isCheckingStatus ? '⏳ Checking...' : 'Check Status'}
            </button>

            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginLeft: 'auto'
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;