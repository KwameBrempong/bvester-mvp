import React from 'react';
import '../styles/loading-states.css';

// Skeleton loader component for content loading
export const SkeletonLoader: React.FC<{
  height?: string;
  width?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  count?: number;
}> = ({
  height = '20px',
  width = '100%',
  variant = 'text',
  count = 1
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton-${variant}`}
      style={{
        height,
        width,
        marginBottom: count > 1 ? '8px' : 0
      }}
    />
  ));

  return <>{skeletons}</>;
};

// Spinner loader component
export const Spinner: React.FC<{
  size?: 'small' | 'medium' | 'large';
  color?: string;
  centered?: boolean;
}> = ({
  size = 'medium',
  color = 'var(--gold-primary)',
  centered = false
}) => {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60
  };

  const spinner = (
    <div
      className={`spinner spinner-${size}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderColor: `${color}20`,
        borderTopColor: color
      }}
    />
  );

  if (centered) {
    return (
      <div className="spinner-container">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Loading card placeholder
export const LoadingCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="loading-card">
      <div className="loading-card-header">
        <SkeletonLoader variant="circular" height="40px" width="40px" />
        <div style={{ flex: 1, marginLeft: '12px' }}>
          <SkeletonLoader height="18px" width="60%" />
          <SkeletonLoader height="14px" width="40%" />
        </div>
      </div>
      <div className="loading-card-body">
        <SkeletonLoader count={lines} />
      </div>
      <div className="loading-card-footer">
        <SkeletonLoader height="32px" width="100px" variant="rectangular" />
      </div>
    </div>
  );
};

// Shimmer effect component
export const ShimmerEffect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="shimmer-wrapper">
      <div className="shimmer">
        {children}
      </div>
    </div>
  );
};

// Progress bar component
export const ProgressBar: React.FC<{
  progress: number;
  showLabel?: boolean;
  color?: string;
  height?: string;
}> = ({
  progress,
  showLabel = true,
  color = 'var(--gold-primary)',
  height = '8px'
}) => {
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ height }}>
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: color
          }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">{Math.round(progress)}%</span>
      )}
    </div>
  );
};

// Pulse animation component
export const PulseAnimation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="pulse-animation">
      {children}
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  text?: string;
}> = ({ isLoading, text = 'Loading...' }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner size="large" />
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
};