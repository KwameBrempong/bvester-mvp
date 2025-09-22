import { logger } from '../config/environment';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      logger.warn('Performance timer not found', { label });
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);

    logger.debug('Performance metric', { label, duration: `${duration.toFixed(2)}ms` });

    // Log slow operations
    if (duration > 1000) {
      logger.warn('Slow operation detected', { label, duration: `${duration.toFixed(2)}ms` });
    }

    return duration;
  }

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    return fn().finally(() => {
      this.endTimer(label);
    });
  }

  measureSync<T>(label: string, fn: () => T): T {
    this.startTimer(label);
    try {
      return fn();
    } finally {
      this.endTimer(label);
    }
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading intersection observer
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}

// Memory usage monitoring
export function logMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    logger.debug('Memory usage', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
    });
  }
}

// Bundle size optimization utilities
export function preloadRoute(routeLoader: () => Promise<any>): void {
  // Preload the route component when browser is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routeLoader().catch((error) => {
        logger.warn('Route preload failed', { error });
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      routeLoader().catch((error) => {
        logger.warn('Route preload failed', { error });
      });
    }, 100);
  }
}

// Image optimization utilities
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
}

export function optimizedImageProps(
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
): React.ImgHTMLAttributes<HTMLImageElement> {
  const { width, height, quality = 80, format = 'webp', lazy = true } = options;

  // In a real app, you might use a CDN or image optimization service
  // For now, we'll just return optimized attributes
  const props: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt,
    loading: lazy ? 'lazy' : 'eager',
    decoding: 'async',
    style: {
      objectFit: 'cover',
      transition: 'opacity 0.3s ease-in-out',
    },
  };

  if (width) props.width = width;
  if (height) props.height = height;

  return props;
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();