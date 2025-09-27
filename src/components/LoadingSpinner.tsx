// CRITICAL FIX: Enhanced loading spinner with better UX
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  progress?: number; // 0-100 for progress indication
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
  overlay = false,
  progress
}) => {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { width: '20px', height: '20px', borderWidth: '2px' };
      case 'large':
        return { width: '60px', height: '60px', borderWidth: '6px' };
      default: // medium
        return { width: '40px', height: '40px', borderWidth: '4px' };
    }
  };

  const sizeProps = getSizeProps();

  const spinnerStyle: React.CSSProperties = {
    width: sizeProps.width,
    height: sizeProps.height,
    border: `${sizeProps.borderWidth} solid #f3f3f3`,
    borderTop: `${sizeProps.borderWidth} solid #D4AF37`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: overlay ? 'rgba(255, 255, 255, 0.9)' : 'white',
      zIndex: 1000
    }),
    ...(overlay && !fullScreen && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      zIndex: 100
    }),
    ...(!fullScreen && !overlay && {
      padding: '40px 20px'
    })
  };

  const messageStyle: React.CSSProperties = {
    color: '#666',
    fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '300px'
  };

  return (
    <>
      {/* Add keyframes for spin animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={containerStyle}>
        <div style={spinnerStyle}></div>

        {message && (
          <div style={messageStyle}>
            {message}
          </div>
        )}

        {progress !== undefined && (
          <div style={{
            width: '200px',
            height: '4px',
            background: '#f0f0f0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #D4AF37, #FFD700)',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        )}

        {progress !== undefined && (
          <div style={{
            fontSize: '12px',
            color: '#888',
            textAlign: 'center'
          }}>
            {Math.round(progress)}% complete
          </div>
        )}
      </div>
    </>
  );
};

// Preset loading components for common use cases
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading page...' }) => (
  <LoadingSpinner size="large" message={message} fullScreen overlay />
);

export const ButtonLoader: React.FC = () => (
  <LoadingSpinner size="small" message="" />
);

export const SectionLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <LoadingSpinner size="medium" message={message} />
);

export const PaymentLoader: React.FC = () => (
  <LoadingSpinner
    size="large"
    message="Processing your payment..."
    fullScreen
    overlay
  />
);

export const DataLoader: React.FC<{ progress?: number }> = ({ progress }) => (
  <LoadingSpinner
    size="medium"
    message="Loading your data..."
    progress={progress}
  />
);

export default LoadingSpinner;