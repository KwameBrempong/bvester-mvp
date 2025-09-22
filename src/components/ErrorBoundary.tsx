import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../config/environment';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log error with full context
    logger.error('React Error Boundary caught error', errorDetails);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error info for display
    this.setState({ errorInfo });

    // Auto-reset after 10 seconds for non-critical errors
    if (this.isRecoverableError(error)) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 10000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when specified props change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== (prevProps.resetKeys || [])[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  /**
   * Determine if an error is recoverable (non-critical)
   */
  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      /ChunkLoadError/,
      /Loading chunk/,
      /Network Error/,
      /timeout/i,
    ];

    return recoverablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Reset the error boundary state
   */
  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
    });
  };

  /**
   * Render fallback UI
   */
  private renderFallback(): ReactNode {
    const { fallback } = this.props;
    const { error, errorId } = this.state;

    if (fallback) {
      return fallback;
    }

    const isRecoverable = error ? this.isRecoverableError(error) : false;

    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        border: '2px solid #e74c3c',
        borderRadius: '8px',
        backgroundColor: '#fff5f5',
        color: '#333',
      }}>
        <h3 style={{ color: '#e74c3c', margin: '0 0 15px 0' }}>
          {isRecoverable ? '⚠️ Temporary Issue' : '❌ Something went wrong'}
        </h3>

        <p style={{ margin: '0 0 15px 0' }}>
          {isRecoverable
            ? 'We encountered a temporary issue. The page will automatically refresh in a few seconds.'
            : 'We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.'
          }
        </p>

        <details style={{ marginBottom: '15px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Technical Details
          </summary>
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}>
            <p><strong>Error ID:</strong> {errorId}</p>
            <p><strong>Message:</strong> {error?.message || 'Unknown error'}</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          </div>
        </details>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2E8B57',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>

          <button
            onClick={this.resetErrorBoundary}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => {
              const emailBody = `Error ID: ${errorId}%0AError: ${encodeURIComponent(error?.message || 'Unknown error')}%0ATime: ${encodeURIComponent(new Date().toISOString())}`;
              window.open(`mailto:support@bvester.com?subject=Error Report&body=${emailBody}`);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Report Issue
          </button>
        </div>

        {isRecoverable && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            fontSize: '14px',
          }}>
            💡 <strong>Tip:</strong> This is usually caused by a temporary network issue or outdated cached files.
          </div>
        )}
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;