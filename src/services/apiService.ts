import { logger } from '../config/environment';

// Request deduplication and caching service
class ApiService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from request parameters
   */
  private generateCacheKey(method: string, url: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(entry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && this.isCacheValid(entry)) {
      logger.debug('Cache hit', { key });
      return entry.data;
    }
    if (entry) {
      logger.debug('Cache expired', { key });
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Store data in cache
   */
  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    logger.debug('Data cached', { key, ttl });
  }

  /**
   * Clear specific cache entry
   */
  public clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete: string[] = [];
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key));
      logger.debug('Pattern cache cleared', { pattern, count: keysToDelete.length });
    } else {
      this.cache.clear();
      logger.debug('All cache cleared');
    }
  }

  /**
   * Clear all expired cache entries
   */
  public clearExpiredCache(): void {
    const keysToDelete: string[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    logger.debug('Expired cache cleared', { count: keysToDelete.length });
  }

  /**
   * Execute request with deduplication and caching
   */
  public async execute<T>(
    requestFn: () => Promise<T>,
    options: {
      method: string;
      url: string;
      params?: any;
      cacheEnabled?: boolean;
      cacheTTL?: number;
      deduplicationEnabled?: boolean;
    }
  ): Promise<T> {
    const { method, url, params, cacheEnabled = true, cacheTTL = this.DEFAULT_TTL, deduplicationEnabled = true } = options;
    const cacheKey = this.generateCacheKey(method, url, params);

    // Check cache first (for GET requests only)
    if (cacheEnabled && method.toLowerCase() === 'get') {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    // Check for pending request (deduplication)
    if (deduplicationEnabled && this.pendingRequests.has(cacheKey)) {
      logger.debug('Request deduplication', { cacheKey });
      return this.pendingRequests.get(cacheKey)!;
    }

    // Execute request
    const requestPromise = (async () => {
      try {
        logger.debug('Executing request', { method, url });
        const startTime = Date.now();

        const result = await requestFn();

        const duration = Date.now() - startTime;
        logger.debug('Request completed', { method, url, duration });

        // Cache successful GET responses
        if (cacheEnabled && method.toLowerCase() === 'get') {
          this.setCache(cacheKey, result, cacheTTL);
        }

        return result;
      } catch (error) {
        logger.error('Request failed', { method, url, error });
        throw error;
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // Store pending request for deduplication
    if (deduplicationEnabled) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  /**
   * Batch multiple requests
   */
  public async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    logger.debug('Executing batch requests', { count: requests.length });

    try {
      const results = await Promise.all(requests.map(req => req()));
      logger.debug('Batch requests completed', { count: requests.length });
      return results;
    } catch (error) {
      logger.error('Batch requests failed', error);
      throw error;
    }
  }

  /**
   * Execute requests with retry logic
   */
  public async withRetry<T>(
    requestFn: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      retryCondition?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, retryDelay = 1000, retryCondition = () => true } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !retryCondition(error)) {
          break;
        }

        logger.warn('Request failed, retrying', {
          attempt: attempt + 1,
          maxRetries,
          error: error instanceof Error ? error.message : error
        });

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    throw lastError;
  }

  /**
   * Prefetch data for better performance
   */
  public async prefetch(
    requestFn: () => Promise<any>,
    options: {
      method: string;
      url: string;
      params?: any;
      cacheTTL?: number;
    }
  ): Promise<void> {
    try {
      await this.execute(requestFn, {
        ...options,
        cacheEnabled: true,
        deduplicationEnabled: false,
      });
      logger.debug('Prefetch completed', { url: options.url });
    } catch (error) {
      logger.warn('Prefetch failed', { url: options.url, error });
      // Don't throw errors for prefetch operations
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get pending requests count
   */
  public getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Auto cleanup expired cache every 10 minutes
setInterval(() => {
  apiService.clearExpiredCache();
}, 10 * 60 * 1000);

// Clear cache when going offline/online
window.addEventListener('online', () => {
  logger.info('Network online - clearing cache for fresh data');
  apiService.clearCache();
});

export default apiService;