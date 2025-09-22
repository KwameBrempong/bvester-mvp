import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor, debounce, throttle } from '../utils/performance';
import { logger } from '../config/environment';

// Hook for component performance monitoring
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();

    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        if (renderTime > 100) { // Log renders taking longer than 100ms
          logger.warn('Slow component render', {
            component: componentName,
            renderTime: `${renderTime.toFixed(2)}ms`
          });
        }
      }
    };
  });

  const measureOperation = useCallback((label: string, operation: () => void) => {
    performanceMonitor.measureSync(`${componentName}.${label}`, operation);
  }, [componentName]);

  const measureAsyncOperation = useCallback(async (label: string, operation: () => Promise<any>) => {
    return performanceMonitor.measureAsync(`${componentName}.${label}`, operation);
  }, [componentName]);

  return { measureOperation, measureAsyncOperation };
}

// Hook for debounced callbacks
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  return useCallback(
    debounce(callback, delay),
    [delay, ...deps]
  ) as T;
}

// Hook for throttled callbacks
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList
): T {
  return useCallback(
    throttle(callback, limit),
    [limit, ...deps]
  ) as T;
}

// Hook for lazy loading with intersection observer
export function useLazyLoading(callback: () => void, options?: IntersectionObserverInit) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(element);
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, options]);

  return elementRef;
}

// Hook for memory monitoring
export function useMemoryMonitoring(intervalMs: number = 10000) {
  useEffect(() => {
    if (!('memory' in performance)) return;

    const logMemory = () => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

      // Log if memory usage is getting high
      if (usedMB > limitMB * 0.8) {
        logger.warn('High memory usage detected', {
          used: `${usedMB.toFixed(2)}MB`,
          total: `${totalMB.toFixed(2)}MB`,
          limit: `${limitMB.toFixed(2)}MB`,
          percentage: `${((usedMB / limitMB) * 100).toFixed(1)}%`,
        });
      }
    };

    const interval = setInterval(logMemory, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
}

// Hook for performance budget monitoring
export function usePerformanceBudget() {
  useEffect(() => {
    // Monitor Web Vitals when available
    if ('web-vitals' in window) return;

    // Monitor Long Tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              logger.warn('Long task detected', {
                name: entry.name,
                duration: `${entry.duration.toFixed(2)}ms`,
                startTime: entry.startTime,
              });
            }
          });
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });

        return () => {
          longTaskObserver.disconnect();
        };
      } catch (error) {
        logger.debug('Long task monitoring not supported', { error });
      }
    }
  }, []);
}