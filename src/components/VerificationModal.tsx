import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { sendEmailVerification, verifyEmail, sendPhoneVerification, verifyPhone } from '../store/slices/userSlice';
import { logger } from '../config/environment';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationType: 'email' | 'phone';
  contactInfo: string; // email or phone number
  userId: string;
  onSuccess: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  verificationType,
  contactInfo,
  userId,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('request');
      setVerificationCode('');
      setError(null);
      setResendCooldown(0);
    }
  }, [isOpen]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (verificationType === 'email') {
        result = await dispatch(sendEmailVerification({ userId, email: contactInfo }));
      } else {
        result = await dispatch(sendPhoneVerification({ userId, phone: contactInfo }));
      }

      if (sendEmailVerification.fulfilled.match(result) || sendPhoneVerification.fulfilled.match(result)) {
        setStep('verify');
        setResendCooldown(60); // 60 seconds cooldown
        logger.info(`${verificationType} verification sent`, { userId, contactInfo: contactInfo.substring(0, 4) + '****' });
      } else {
        const errorMessage = result.payload as string || `Failed to send ${verificationType} verification. Please try again.`;
        setError(errorMessage);
      }
    } catch (error) {
      logger.error(`Failed to send ${verificationType} verification`, { error, userId });
      setError(`An error occurred while sending the verification code.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (verificationType === 'email') {
        result = await dispatch(verifyEmail({ userId, code: verificationCode }));
      } else {
        result = await dispatch(verifyPhone({ userId, code: verificationCode }));
      }

      if (verifyEmail.fulfilled.match(result) || verifyPhone.fulfilled.match(result)) {
        logger.info(`${verificationType} verified successfully`, { userId });
        onSuccess();
        onClose();
      } else {
        const errorMessage = result.payload as string || 'Invalid verification code. Please check and try again.';
        setError(errorMessage);
      }
    } catch (error) {
      logger.error(`${verificationType} verification failed`, { error, userId });
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown === 0) {
      handleSendVerification();
    }
  };

  if (!isOpen) return null;

  const icon = verificationType === 'email' ? '📧' : '📱';
  const title = verificationType === 'email' ? 'Email Verification' : 'Phone Verification';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#2E8B57', fontSize: '20px' }}>
            {icon} {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: '#fff5f5',
            border: '1px solid #ffcdd2',
            borderRadius: '6px',
            color: '#d32f2f',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {step === 'request' ? (
          <div>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
              We'll send a 6-digit verification code to{' '}
              <strong>{contactInfo}</strong> to verify your {verificationType}.
            </p>

            <button
              onClick={handleSendVerification}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: isLoading ? '#ccc' : '#2E8B57',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              {isLoading ? 'Sending...' : `Send Verification Code`}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
              Enter the 6-digit code sent to{' '}
              <strong>{contactInfo}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError(null);
                }}
                placeholder="Enter 6-digit code"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '18px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  fontWeight: 'bold'
                }}
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              style={{
                width: '100%',
                padding: '12px',
                background: (isLoading || verificationCode.length !== 6) ? '#ccc' : '#2E8B57',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (isLoading || verificationCode.length !== 6) ? 'not-allowed' : 'pointer',
                marginBottom: '12px',
                transition: 'background 0.2s ease'
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#ccc' : '#2E8B57',
                  fontSize: '14px',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Code'
                }
              </button>
            </div>
          </div>
        )}

        {/* Security notice */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>🔒 Security Notice:</strong> This verification code expires in{' '}
          {verificationType === 'email' ? '10 minutes' : '5 minutes'} and can only be used once.
          Never share this code with anyone.
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;