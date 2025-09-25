import React, { useState, useEffect } from 'react';
import { fetchUserAttributes, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import EmailVerificationBanner from './EmailVerificationBanner';

interface EmailVerificationHandlerProps {
  user: any;
}

const EmailVerificationHandler: React.FC<EmailVerificationHandlerProps> = ({ user }) => {
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // Fetch and check email verification status
  const checkEmailVerification = async () => {
    try {
      setIsChecking(true);

      // Get fresh user attributes from Cognito
      const attributes = await fetchUserAttributes();
      console.log('Fetched user attributes:', attributes);

      // Set the email
      const email = attributes.email || user?.username || '';
      setUserEmail(email);

      // Check verification status - handle different possible formats
      const isVerified = String(attributes.email_verified).toLowerCase() === 'true';

      console.log('Email verification status:', {
        raw: attributes.email_verified,
        type: typeof attributes.email_verified,
        isVerified
      });

      setEmailVerified(isVerified);

      // If verified, ensure banner is dismissed
      if (isVerified) {
        setDismissed(true);
        sessionStorage.setItem('emailVerificationDismissed', 'true');
        sessionStorage.setItem('emailVerified', 'true');
      }
    } catch (error) {
      console.error('Error checking email verification:', error);

      // Fallback to user object attributes if fetch fails
      if (user?.attributes) {
        const email = user.attributes.email || user.username || '';
        setUserEmail(email);

        const isVerified = String(user.attributes.email_verified).toLowerCase() === 'true';

        setEmailVerified(isVerified);

        // If verified, ensure banner is dismissed
        if (isVerified) {
          setDismissed(true);
          sessionStorage.setItem('emailVerificationDismissed', 'true');
          sessionStorage.setItem('emailVerified', 'true');
        }
      } else {
        setEmailVerified(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkEmailVerification();

      // Set up periodic check every 30 seconds to catch status changes
      const interval = setInterval(() => {
        checkEmailVerification();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleVerificationSuccess = async () => {
    console.log('Email verification successful');
    setEmailVerified(true);
    setDismissed(true);

    // Re-check after a short delay to confirm
    setTimeout(() => {
      checkEmailVerification();
    }, 2000);

    // Reload page after a bit longer to get fresh auth state
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in session storage so it persists during the session
    sessionStorage.setItem('emailVerificationDismissed', 'true');
  };

  // Check if previously dismissed in this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('emailVerificationDismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  // Don't show anything while checking
  if (isChecking) {
    return null;
  }

  // Don't show if verified or dismissed
  if (emailVerified || dismissed) {
    return null;
  }

  // Show the verification banner
  return (
    <EmailVerificationBanner
      userEmail={userEmail}
      onVerificationSuccess={handleVerificationSuccess}
      onDismiss={handleDismiss}
    />
  );
};

export default EmailVerificationHandler;