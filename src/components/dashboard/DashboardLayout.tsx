import React, { Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import '../../styles/dashboard-system.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

const LoadingFallback: React.FC = () => (
  <div className="card">
    <div className="card-body">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
      <div className="skeleton skeleton-button" style={{ marginTop: 'var(--space-lg)' }}></div>
    </div>
  </div>
);

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  header,
  sidebar,
  className = ''
}) => {
  return (
    <div className={`dashboard-container ${className}`}>
      <div className="dashboard-main">
        {header && (
          <ErrorBoundary>
            <div className="fade-in mb-xl">
              {header}
            </div>
          </ErrorBoundary>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-grid-main">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                {children}
              </Suspense>
            </ErrorBoundary>
          </div>

          {sidebar && (
            <div className="dashboard-grid-sidebar">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  {sidebar}
                </Suspense>
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;