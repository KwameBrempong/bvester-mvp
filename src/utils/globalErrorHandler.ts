// CRITICAL FIX: Global error handler for unhandled errors
import { logger } from '../config/environment';

interface ErrorInfo {
  error: Error;
  errorInfo?: React.ErrorInfo | unknown;
  context?: string;
  userId?: string;
  timestamp: number;
}

class GlobalErrorHandler {
  private errorQueue: ErrorInfo[] = [];
  private isInitialized = false;

  public initialize(): void {
    if (this.isInitialized) return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      this.handleError(
        event.reason instanceof Error ? event.reason : new Error(event.reason),
        'unhandled_promise_rejection'
      );

      // Prevent the default browser console error
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global JavaScript Error:', event.error);
      this.handleError(
        event.error || new Error(event.message),
        'javascript_error',
        { filename: event.filename, lineno: event.lineno, colno: event.colno }
      );
    });

    // Handle React error boundary errors
    this.setupReactErrorHandling();

    this.isInitialized = true;
    logger.info('Global error handler initialized');
  }

  private setupReactErrorHandling(): void {
    // Listen for custom React error events
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.handleError(
        event.detail.error,
        'react_component_error',
        event.detail.errorInfo
      );
    }) as EventListener);
  }

  public handleError(
    error: Error,
    context: string = 'unknown',
    additionalInfo?: unknown
  ): void {
    const errorInfo: ErrorInfo = {
      error,
      errorInfo: additionalInfo,
      context,
      timestamp: Date.now()
    };

    // Log error
    logger.error(`Global Error [${context}]`, {
      message: error.message,
      stack: error.stack,
      context,
      additionalInfo
    });

    // Add to queue
    this.errorQueue.push(errorInfo);

    // Keep only last 50 errors
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-50);
    }

    // Show user-friendly notification
    this.showUserNotification(error, context);
  }

  private showUserNotification(error: Error, context: string): void {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // User-friendly error messages
    let message = 'Something went wrong. Please try again.';

    if (context.includes('network') || error.message.includes('fetch')) {
      message = 'Network error. Please check your connection.';
    } else if (context.includes('payment')) {
      message = 'Payment processing failed. Please try again.';
    } else if (context.includes('auth')) {
      message = 'Authentication error. Please try logging in again.';
    } else if (error.message.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    }

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>⚠️</span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()"
                style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  public getErrorHistory(): ErrorInfo[] {
    return [...this.errorQueue];
  }

  public clearErrorHistory(): void {
    this.errorQueue = [];
  }

  // Method for React components to report errors
  public reportError(error: Error, context: string, additionalInfo?: unknown): void {
    this.handleError(error, context, additionalInfo);
  }
}

export const globalErrorHandler = new GlobalErrorHandler();

// Initialize on module load
if (typeof window !== 'undefined') {
  globalErrorHandler.initialize();
}

// Utility function for manual error reporting
export const reportError = (error: Error, context: string, additionalInfo?: unknown) => {
  globalErrorHandler.reportError(error, context, additionalInfo);
};

export default globalErrorHandler;