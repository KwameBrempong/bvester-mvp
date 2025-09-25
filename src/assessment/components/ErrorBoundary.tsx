/**
 * Error Boundary for Assessment Components
 * Prevents crashes and provides graceful error handling
 */

import React, { Component, ReactNode } from 'react';
import { AssessmentHelpers } from '../utils/assessmentHelpers';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Assessment Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Track error
    AssessmentHelpers.trackEvent('assessment_error', {
      error: error.toString(),
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    AssessmentHelpers.trackEvent('assessment_error_restart');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#FFE5E5',
            border: '2px solid #FF6B6B',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              ⚠️
            </div>

            <h3 style={{
              color: '#D63031',
              marginBottom: '16px',
              fontSize: '20px'
            }}>
              Something went wrong
            </h3>

            <p style={{
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              We encountered an unexpected error while processing your assessment.
              Don't worry - your progress has been saved.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleRestart}
                style={{
                  background: 'linear-gradient(135deg, #2E8B57, #228B22)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'white',
                  color: '#666',
                  border: '2px solid #E9ECEF',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.color = '#D4AF37';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E9ECEF';
                  e.currentTarget.style.color = '#666';
                }}
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#666', fontSize: '12px' }}>
                  Error Details (Development)
                </summary>
                <pre style={{
                  background: '#F8F9FA',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  overflow: 'auto',
                  marginTop: '8px',
                  color: '#666'
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;